import { createReconnectingSocket } from './createReconnectingSocket'

type CreateStreamManagerInput<TMsg> = {
  buildUrl: (channel: string) => string
  parse: (raw: string) => TMsg | null
  onParseError?: (channel: string, raw: string) => void
  onSocketError?: (channel: string, error: Event) => void
}

type StreamManager<TMsg> = {
  subscribe: (channel: string, handler: (msg: TMsg) => void) => () => void
}

type Channel<TMsg> = {
  socket: { close: () => void }
  handlers: Set<(msg: TMsg) => void>
}

export const createStreamManager = <TMsg>({
  buildUrl,
  parse,
  onParseError,
  onSocketError
}: CreateStreamManagerInput<TMsg>): StreamManager<TMsg> => {
  const channels = new Map<string, Channel<TMsg>>()

  const dispatch = (entry: Channel<TMsg>, msg: TMsg) => {
    entry.handlers.forEach(handler => handler(msg))
  }

  const openChannel = (channel: string): Channel<TMsg> => {
    const handlers = new Set<(msg: TMsg) => void>()
    const entry: Channel<TMsg> = {
      handlers,
      socket: createReconnectingSocket({
        url: buildUrl(channel),
        onMessage: raw => {
          const parsed = parse(raw)
          if (parsed === null) {
            onParseError?.(channel, raw)
            return
          }
          dispatch(entry, parsed)
        },
        onError: err => onSocketError?.(channel, err)
      })
    }
    return entry
  }

  return {
    subscribe: (channel, handler) => {
      let entry = channels.get(channel)
      if (!entry) {
        entry = openChannel(channel)
        channels.set(channel, entry)
      }
      entry.handlers.add(handler)

      return () => {
        const current = channels.get(channel)
        if (!current) return
        current.handlers.delete(handler)
        if (current.handlers.size === 0) {
          current.socket.close()
          channels.delete(channel)
        }
      }
    }
  }
}

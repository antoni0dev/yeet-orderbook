import { createReconnectingSocket } from './createReconnectingSocket'

export type StreamParseResult<TMsg> =
  | { kind: 'success'; data: TMsg }
  | { kind: 'error'; error: Error }

type CreateStreamManagerInput<TMsg> = {
  buildUrl: (channel: string) => string
  parse: (raw: string) => StreamParseResult<TMsg>
  onParseError?: (channel: string, raw: string) => void
  onSocketError?: (channel: string, error: Error) => void
}

type StreamSubscription<TMsg> = {
  onMessage: (msg: TMsg) => void
  onError?: (error: Error) => void
}

type StreamManager<TMsg> = {
  awaitNextMessage: (channel: string, signal?: AbortSignal) => Promise<TMsg>
  subscribe: (channel: string, subscription: StreamSubscription<TMsg>) => () => void
}

type PendingRequest<TMsg> = {
  reject: (error: Error) => void
  resolve: (message: TMsg) => void
}

type Channel<TMsg> = {
  socket: { close: () => void }
  latestMessage: TMsg | null
  pendingRequests: Set<PendingRequest<TMsg>>
  subscriptions: Set<StreamSubscription<TMsg>>
}

export const createStreamManager = <TMsg>({
  buildUrl,
  parse,
  onParseError,
  onSocketError
}: CreateStreamManagerInput<TMsg>): StreamManager<TMsg> => {
  const channels = new Map<string, Channel<TMsg>>()

  const cleanupChannel = (channel: string) => {
    const entry = channels.get(channel)
    if (entry === undefined) return
    if (entry.pendingRequests.size > 0 || entry.subscriptions.size > 0) return
    entry.socket.close()
    channels.delete(channel)
  }

  const resolvePendingRequests = (channel: string, entry: Channel<TMsg>, message: TMsg) => {
    Array.from(entry.pendingRequests).forEach(request => {
      request.resolve(message)
    })
    entry.pendingRequests.clear()
    cleanupChannel(channel)
  }

  const rejectPendingRequests = (channel: string, entry: Channel<TMsg>, error: Error) => {
    Array.from(entry.pendingRequests).forEach(request => {
      request.reject(error)
    })
    entry.pendingRequests.clear()
    cleanupChannel(channel)
  }

  const dispatchMessage = (channel: string, entry: Channel<TMsg>, message: TMsg) => {
    entry.latestMessage = message
    resolvePendingRequests(channel, entry, message)
    entry.subscriptions.forEach(subscription => {
      subscription.onMessage(message)
    })
  }

  const dispatchError = (channel: string, entry: Channel<TMsg>, error: Error) => {
    rejectPendingRequests(channel, entry, error)
    entry.subscriptions.forEach(subscription => {
      subscription.onError?.(error)
    })
  }

  const openChannel = (channel: string): Channel<TMsg> => {
    const entry: Channel<TMsg> = {
      latestMessage: null,
      pendingRequests: new Set(),
      subscriptions: new Set(),
      socket: createReconnectingSocket({
        url: buildUrl(channel),
        onFailure: error => {
          dispatchError(channel, entry, error)
          onSocketError?.(channel, error)
        },
        onMessage: raw => {
          const parsed = parse(raw)
          if (parsed.kind === 'error') {
            dispatchError(channel, entry, parsed.error)
            onParseError?.(channel, raw)
            return
          }
          dispatchMessage(channel, entry, parsed.data)
        }
      })
    }
    return entry
  }

  const getChannel = (channel: string): Channel<TMsg> => {
    const existingEntry = channels.get(channel)
    if (existingEntry !== undefined) return existingEntry
    const nextEntry = openChannel(channel)
    channels.set(channel, nextEntry)
    return nextEntry
  }

  const createAbortedStreamError = (): Error => {
    const error = new Error('Stream request aborted')
    error.name = 'AbortError'
    return error
  }

  return {
    awaitNextMessage: (channel, signal) => {
      const entry = getChannel(channel)
      if (entry.latestMessage !== null) {
        return Promise.resolve(entry.latestMessage)
      }

      return new Promise<TMsg>((resolve, reject) => {
        const settleRequest = (callback: () => void) => {
          entry.pendingRequests.delete(request)
          signal?.removeEventListener('abort', abortRequest)
          callback()
          cleanupChannel(channel)
        }

        const request: PendingRequest<TMsg> = {
          resolve: message => {
            settleRequest(() => {
              resolve(message)
            })
          },
          reject: error => {
            settleRequest(() => {
              reject(error)
            })
          }
        }

        const abortRequest = () => {
          request.reject(createAbortedStreamError())
        }

        if (signal?.aborted === true) {
          abortRequest()
          return
        }

        entry.pendingRequests.add(request)
        signal?.addEventListener('abort', abortRequest, { once: true })
      })
    },
    subscribe: (channel, subscription) => {
      const entry = getChannel(channel)
      entry.subscriptions.add(subscription)

      if (entry.latestMessage !== null) {
        subscription.onMessage(entry.latestMessage)
      }

      return () => {
        const current = channels.get(channel)
        if (current === undefined) return
        current.subscriptions.delete(subscription)
        cleanupChannel(channel)
      }
    }
  }
}

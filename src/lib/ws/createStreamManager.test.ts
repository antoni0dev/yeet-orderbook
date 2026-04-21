import { beforeEach, describe, expect, it, vi } from 'vitest'

type MockSocketRecord = {
  url: string
  onMessage: (raw: string) => void
  onFailure?: (error: Error) => void
  close: ReturnType<typeof vi.fn>
}

const { socketRecords } = vi.hoisted(() => ({
  socketRecords: [] as MockSocketRecord[]
}))

vi.mock('./createReconnectingSocket', () => ({
  createReconnectingSocket: ({
    url,
    onMessage,
    onFailure
  }: {
    url: string
    onMessage: (raw: string) => void
    onFailure?: (error: Error) => void
  }) => {
    const record: MockSocketRecord = {
      url,
      onMessage,
      onFailure,
      close: vi.fn()
    }

    socketRecords.push(record)

    return {
      close: record.close
    }
  }
}))

import { createStreamManager } from './createStreamManager'

beforeEach(() => {
  socketRecords.length = 0
})

describe('createStreamManager', () => {
  it('shares one socket per channel and closes it after the last unsubscribe', () => {
    const firstHandler = vi.fn()
    const secondHandler = vi.fn()

    const manager = createStreamManager<string>({
      buildUrl: channel => `wss://example.test/${channel}`,
      parse: raw => ({ kind: 'success', data: raw })
    })

    const unsubscribeFirst = manager.subscribe('btcusdt', { onMessage: firstHandler })
    const unsubscribeSecond = manager.subscribe('btcusdt', { onMessage: secondHandler })

    expect(socketRecords).toHaveLength(1)
    expect(socketRecords[0]?.url).toBe('wss://example.test/btcusdt')

    socketRecords[0]?.onMessage('snapshot')

    expect(firstHandler).toHaveBeenCalledWith('snapshot')
    expect(secondHandler).toHaveBeenCalledWith('snapshot')

    unsubscribeFirst()
    expect(socketRecords[0]?.close).not.toHaveBeenCalled()

    unsubscribeSecond()
    expect(socketRecords[0]?.close).toHaveBeenCalledTimes(1)
  })

  it('reports parse failures and socket errors without dispatching bad messages', async () => {
    const handler = vi.fn()
    const subscriptionError = vi.fn()
    const onParseError = vi.fn()
    const onSocketError = vi.fn()
    const parseError = new Error('bad payload')

    const manager = createStreamManager<string>({
      buildUrl: channel => `wss://example.test/${channel}`,
      parse: raw => (raw === 'bad' ? { kind: 'error', error: parseError } : { kind: 'success', data: raw }),
      onParseError,
      onSocketError
    })

    const pendingMessage = manager.awaitNextMessage('ethusdt')
    manager.subscribe('ethusdt', { onMessage: handler, onError: subscriptionError })

    socketRecords[0]?.onMessage('bad')

    await expect(pendingMessage).rejects.toThrow('bad payload')
    expect(onParseError).toHaveBeenCalledWith('ethusdt', 'bad')
    expect(subscriptionError).toHaveBeenCalledWith(parseError)
    expect(handler).not.toHaveBeenCalled()

    const socketError = new Error('socket closed')
    socketRecords[0]?.onFailure?.(socketError)

    expect(onSocketError).toHaveBeenCalledWith('ethusdt', socketError)
  })
})

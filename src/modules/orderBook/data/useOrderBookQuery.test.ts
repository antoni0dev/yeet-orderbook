import { QueryClient, QueryObserver } from '@tanstack/react-query'
import { afterEach, describe, expect, it, vi } from 'vitest'

import type { OrderBookSnapshot } from '../types'
import { orderBookQueryKey } from './orderBookQueryKey'
import { awaitOrderBookSnapshot, subscribeToOrderBook } from './subscribeToOrderBook'
import { createOrderBookQueryOptions, syncOrderBookQueryCache } from './useOrderBookQuery'

vi.mock('./subscribeToOrderBook', () => ({
  awaitOrderBookSnapshot: vi.fn(),
  subscribeToOrderBook: vi.fn()
}))

const mockedAwaitOrderBookSnapshot = vi.mocked(awaitOrderBookSnapshot)
const mockedSubscribeToOrderBook = vi.mocked(subscribeToOrderBook)

describe('useOrderBookQuery helpers', () => {
  afterEach(() => {
    mockedAwaitOrderBookSnapshot.mockReset()
    mockedSubscribeToOrderBook.mockReset()
    vi.restoreAllMocks()
  })

  it('surfaces an initial stream failure as a query error', async () => {
    mockedAwaitOrderBookSnapshot.mockRejectedValueOnce(new Error('stream unavailable'))

    const queryClient = new QueryClient()
    const observer = new QueryObserver(queryClient, createOrderBookQueryOptions('BTCUSDT'))

    const result = await observer.refetch()

    expect(result.status).toBe('error')
    expect(result.error?.message).toBe('stream unavailable')
  })

  it('syncs live snapshots into the query cache and unsubscribes on cleanup', () => {
    let onSnapshot: ((snapshot: OrderBookSnapshot) => void) | undefined
    const unsubscribe = vi.fn()

    mockedSubscribeToOrderBook.mockImplementation(input => {
      onSnapshot = input.onSnapshot
      return unsubscribe
    })

    vi.spyOn(globalThis, 'requestAnimationFrame').mockImplementation(callback => {
      callback(0)
      return 1
    })
    vi.spyOn(globalThis, 'cancelAnimationFrame').mockImplementation(() => undefined)

    const queryClient = new QueryClient()
    const snapshot: OrderBookSnapshot = {
      asks: [{ price: 101, qty: 3 }],
      bids: [{ price: 100, qty: 2 }],
      lastUpdateId: 2
    }

    const cleanup = syncOrderBookQueryCache({ queryClient, symbol: 'BTCUSDT' })

    onSnapshot?.(snapshot)

    expect(queryClient.getQueryData(orderBookQueryKey('BTCUSDT'))).toEqual(snapshot)

    cleanup()

    expect(unsubscribe).toHaveBeenCalledTimes(1)
  })

  it('moves an existing query into error when the live stream fails', () => {
    let onError: ((error: Error) => void) | undefined

    mockedSubscribeToOrderBook.mockImplementation(input => {
      onError = input.onError
      return () => undefined
    })

    const queryClient = new QueryClient()
    queryClient.setQueryData(orderBookQueryKey('BTCUSDT'), {
      asks: [],
      bids: [],
      lastUpdateId: 1
    })

    const cleanup = syncOrderBookQueryCache({ queryClient, symbol: 'BTCUSDT' })

    onError?.(new Error('socket failed'))

    const queryState = queryClient.getQueryState(orderBookQueryKey('BTCUSDT'))

    expect(queryState?.status).toBe('error')
    expect(queryState?.error?.message).toBe('socket failed')

    cleanup()
  })
})

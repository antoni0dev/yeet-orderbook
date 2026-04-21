import {
  type QueryClient,
  useQuery,
  useQueryClient,
  type UseQueryOptions,
  type UseQueryResult} from '@tanstack/react-query'
import { useEffect } from 'react'

import { rafBatcher } from '@/lib/ws/rafBatcher'
import type { Symbol } from '@/modules/market/core'

import type { OrderBookSnapshot } from '../types'
import { orderBookQueryKey } from './orderBookQueryKey'
import { awaitOrderBookSnapshot, subscribeToOrderBook } from './subscribeToOrderBook'

type SetOrderBookQueryErrorInput = {
  queryClient: QueryClient
  symbol: Symbol
  error: Error
}

const setOrderBookQueryError = ({
  queryClient,
  symbol,
  error
}: SetOrderBookQueryErrorInput): void => {
  const query = queryClient.getQueryCache().find({
    queryKey: orderBookQueryKey(symbol),
    exact: true
  })

  query?.setState({
    error,
    status: 'error',
    fetchStatus: 'idle'
  })
}

type SyncOrderBookQueryCacheInput = {
  queryClient: QueryClient
  symbol: Symbol
}

const syncOrderBookQueryCache = ({
  queryClient,
  symbol
}: SyncOrderBookQueryCacheInput): (() => void) => {
  const batcher = rafBatcher<OrderBookSnapshot>(snapshot => {
    queryClient.setQueryData(orderBookQueryKey(symbol), snapshot)
  })

  const unsubscribe = subscribeToOrderBook({
    symbol,
    onSnapshot: batcher.push,
    onError: error => {
      batcher.cancel()
      setOrderBookQueryError({ queryClient, symbol, error })
    }
  })

  return () => {
    unsubscribe()
    batcher.cancel()
  }
}

const createOrderBookQueryOptions = (
  symbol: Symbol
): UseQueryOptions<
  OrderBookSnapshot,
  Error,
  OrderBookSnapshot,
  ReturnType<typeof orderBookQueryKey>
> => ({
  queryKey: orderBookQueryKey(symbol),
  queryFn: ({ signal }) => awaitOrderBookSnapshot({ signal, symbol }),
  staleTime: Infinity,
  gcTime: 0,
  retry: false,
  refetchOnWindowFocus: false,
  refetchOnReconnect: false
})

export const useOrderBookQuery = (symbol: Symbol): UseQueryResult<OrderBookSnapshot, Error> => {
  const queryClient = useQueryClient()

  useEffect(() => {
    return syncOrderBookQueryCache({ queryClient, symbol })
  }, [symbol, queryClient])

  return useQuery(createOrderBookQueryOptions(symbol))
}

import { useQuery, useQueryClient, type UseQueryResult } from '@tanstack/react-query'
import { useEffect } from 'react'

import { rafBatcher } from '@/lib/ws/rafBatcher'
import type { Symbol } from '@/modules/market/core'

import type { OrderBookSnapshot } from '../types'
import { subscribeToOrderBook } from './subscribeToOrderBook'

const orderBookQueryKey = (symbol: Symbol) => ['orderBook', symbol] as const

export const useOrderBookQuery = (symbol: Symbol): UseQueryResult<OrderBookSnapshot, Error> => {
  const queryClient = useQueryClient()

  useEffect(() => {
    const batcher = rafBatcher<OrderBookSnapshot>(snapshot => {
      queryClient.setQueryData(orderBookQueryKey(symbol), snapshot)
    })

    const unsubscribe = subscribeToOrderBook({ symbol, onSnapshot: batcher.push })

    return () => {
      unsubscribe()
      batcher.cancel()
      queryClient.removeQueries({ queryKey: orderBookQueryKey(symbol), exact: true })
    }
  }, [symbol, queryClient])

  return useQuery<OrderBookSnapshot, Error>({
    queryKey: orderBookQueryKey(symbol),
    queryFn: () => new Promise<OrderBookSnapshot>(() => {}),
    staleTime: Infinity,
    gcTime: 0,
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false
  })
}

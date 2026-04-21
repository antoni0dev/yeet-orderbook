import type { ReactNode } from 'react'

import { setupValueProvider } from '@/lib/state/setupValueProvider'

import { maxDisplayRows } from '../config'
import { accumulateLevels } from '../logic/accumulateLevels'
import { computeRatio } from '../logic/computeRatio'
import { groupLevelsByTick } from '../logic/groupLevelsByTick'
import type { GroupedOrderBook, OrderBookSnapshot } from '../types'
import { usePriceStep } from './PriceStepProvider'

const [GroupedOrderBookValueProvider, useGroupedOrderBook] =
  setupValueProvider<GroupedOrderBook>('GroupedOrderBook')

export { useGroupedOrderBook }

const deriveGroupedOrderBook = (
  snapshot: OrderBookSnapshot,
  priceStep: number
): GroupedOrderBook => {
  const groupedBids = groupLevelsByTick({
    levels: snapshot.bids,
    step: priceStep,
    side: 'bid',
    maxRows: maxDisplayRows
  })
  const groupedAsks = groupLevelsByTick({
    levels: snapshot.asks,
    step: priceStep,
    side: 'ask',
    maxRows: maxDisplayRows
  })

  const bidSide = accumulateLevels({ levels: groupedBids })
  const askSide = accumulateLevels({ levels: groupedAsks })

  return {
    bids: bidSide.levels,
    asks: askSide.levels,
    maxBidQty: bidSide.maxQty,
    maxAskQty: askSide.maxQty,
    totalBidQty: bidSide.totalQty,
    totalAskQty: askSide.totalQty,
    bidRatio: computeRatio({ totalBidQty: bidSide.totalQty, totalAskQty: askSide.totalQty }),
    bestBid: bidSide.levels[0]?.price ?? null,
    bestAsk: askSide.levels[0]?.price ?? null
  }
}

type GroupedOrderBookProviderProps = {
  snapshot: OrderBookSnapshot
  children: ReactNode
}

export const GroupedOrderBookProvider = ({
  snapshot,
  children
}: GroupedOrderBookProviderProps): ReactNode => {
  const [priceStep] = usePriceStep()
  const grouped = deriveGroupedOrderBook(snapshot, priceStep)
  return <GroupedOrderBookValueProvider value={grouped}>{children}</GroupedOrderBookValueProvider>
}

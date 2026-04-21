import type { ReactNode } from 'react'

import { marketConfigs } from '@/modules/market/config'
import { useSelectedSymbol } from '@/modules/market/state/SelectedSymbolProvider'

import { useGroupedOrderBook } from '../state/GroupedOrderBookProvider'
import { useSetHoveredRow } from '../state/HoveredRowProvider'
import { OrderBookRow } from './OrderBookRow'

export const OrderBookBidSide = (): ReactNode => {
  const { bids, maxBidQty, totalBidQty } = useGroupedOrderBook()
  const [symbol] = useSelectedSymbol()
  const setHoveredRow = useSetHoveredRow()
  const { qtyDecimals } = marketConfigs[symbol]

  return (
    <div role="rowgroup" aria-label="Bids" onMouseLeave={() => setHoveredRow(null)}>
      {bids.map((level, index) => (
        <OrderBookRow
          key={level.price}
          side="bid"
          index={index}
          level={level}
          maxQty={maxBidQty}
          totalQty={totalBidQty}
          qtyDecimals={qtyDecimals}
        />
      ))}
    </div>
  )
}

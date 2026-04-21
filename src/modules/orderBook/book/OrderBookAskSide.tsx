import type { ReactNode } from 'react'

import { marketConfigs } from '@/modules/market/config'
import { useSelectedSymbol } from '@/modules/market/state/SelectedSymbolProvider'

import { useGroupedOrderBook } from '../state/GroupedOrderBookProvider'
import { useHoveredRow } from '../state/HoveredRowProvider'
import { OrderBookRow } from './OrderBookRow'

export const OrderBookAskSide = (): ReactNode => {
  const { asks, maxAskQty, totalAskQty } = useGroupedOrderBook()
  const [symbol] = useSelectedSymbol()
  const [, setHovered] = useHoveredRow()
  const { qtyDecimals } = marketConfigs[symbol]

  return (
    <div
      role="rowgroup"
      aria-label="Asks"
      onMouseLeave={() => setHovered(null)}
      className="flex flex-col-reverse"
    >
      {asks.map((level, index) => (
        <OrderBookRow
          key={level.price}
          side="ask"
          index={index}
          level={level}
          maxQty={maxAskQty}
          totalQty={totalAskQty}
          qtyDecimals={qtyDecimals}
        />
      ))}
    </div>
  )
}

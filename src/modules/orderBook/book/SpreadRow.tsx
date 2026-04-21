import type { ReactNode } from 'react'

import { formatPrice } from '@/lib/format/formatPrice'

import { useGroupedOrderBook } from '../state/GroupedOrderBookProvider'
import { usePriceStep } from '../state/PriceStepProvider'

export const SpreadRow = (): ReactNode => {
  const { bestBid, bestAsk } = useGroupedOrderBook()
  const [priceStep] = usePriceStep()

  if (bestBid === null || bestAsk === null) {
    return (
      <div className="flex items-center justify-between border-y border-[color:var(--color-border)] bg-[color:var(--color-bg-elevated)] px-3 py-1.5 font-mono text-[12.5px] text-[color:var(--color-text-subtle)]">
        <span>-</span>
        <span className="text-[10px] uppercase tracking-wider">Spread</span>
        <span>-</span>
      </div>
    )
  }

  const mid = (bestBid + bestAsk) / 2
  const spread = bestAsk - bestBid
  const spreadPct = mid > 0 ? (spread / mid) * 100 : 0

  return (
    <div className="flex items-center justify-between border-y border-[color:var(--color-border)] bg-[color:var(--color-bg-elevated)] px-3 py-1.5 font-mono text-[12.5px] tabular-nums">
      <span className="text-[color:var(--color-text)]">
        {formatPrice({ value: mid, step: priceStep })}
      </span>
      <span className="text-[10px] uppercase tracking-wider text-[color:var(--color-text-subtle)]">
        Spread
      </span>
      <span className="text-[color:var(--color-text-muted)]">
        {formatPrice({ value: spread, step: priceStep })}
        <span className="ml-1 text-[color:var(--color-text-subtle)]">
          ({spreadPct.toFixed(3)}%)
        </span>
      </span>
    </div>
  )
}

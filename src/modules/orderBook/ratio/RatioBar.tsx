import type { ReactNode } from 'react'

import { useGroupedOrderBook } from '../state/GroupedOrderBookProvider'
import { useShowRatio } from '../state/ShowRatioProvider'

const toPercent = (ratio: number): string => `${(ratio * 100).toFixed(2)}%`

export const RatioBar = (): ReactNode => {
  const [showRatio] = useShowRatio()
  const { bidRatio } = useGroupedOrderBook()

  if (!showRatio) return null

  const askRatio = 1 - bidRatio

  return (
    <div
      role="meter"
      aria-label="Buy vs sell ratio"
      aria-valuemin={0}
      aria-valuemax={1}
      aria-valuenow={bidRatio}
      className="flex flex-col gap-1 border-t border-[color:var(--color-border)] px-3 py-2"
    >
      <div className="flex items-center justify-between text-[10px] font-medium uppercase tracking-wider">
        <span className="flex items-center gap-1 text-[color:var(--color-bid)]">
          <span>B</span>
          <span className="text-[color:var(--color-text-muted)]">{toPercent(bidRatio)}</span>
        </span>
        <span className="flex items-center gap-1 text-[color:var(--color-ask)]">
          <span className="text-[color:var(--color-text-muted)]">{toPercent(askRatio)}</span>
          <span>S</span>
        </span>
      </div>
      <div className="flex h-1.5 overflow-hidden rounded-sm">
        <div
          className="bg-[color:var(--color-bid)] transition-[width] duration-[200ms] ease-out"
          style={{ width: `${bidRatio * 100}%` }}
        />
        <div
          className="bg-[color:var(--color-ask)] transition-[width] duration-[200ms] ease-out"
          style={{ width: `${askRatio * 100}%` }}
        />
      </div>
    </div>
  )
}

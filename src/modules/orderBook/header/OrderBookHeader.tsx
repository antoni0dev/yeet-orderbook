import type { ReactNode } from 'react'

import { MarketSelector } from './MarketSelector'

export const OrderBookHeader = (): ReactNode => (
  <header className="flex items-center justify-between gap-3 px-3 py-3">
    <div className="flex items-center gap-2">
      <span className="text-xs font-semibold uppercase tracking-wider text-[color:var(--color-text-muted)]">
        Order Book
      </span>
      <span className="rounded bg-[color:var(--color-bg-elevated)] px-2 py-0.5 text-[10px] font-medium text-[color:var(--color-text-subtle)]">
        Live
      </span>
    </div>
    <MarketSelector />
  </header>
)

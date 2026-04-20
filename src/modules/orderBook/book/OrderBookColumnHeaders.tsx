import type { ReactNode } from 'react'

import { marketConfigs } from '@/modules/market/config'
import { useSelectedSymbol } from '@/modules/market/state/SelectedSymbolProvider'

export const OrderBookColumnHeaders = (): ReactNode => {
  const [symbol] = useSelectedSymbol()
  const { baseAsset, quoteAsset } = marketConfigs[symbol]

  return (
    <div
      role="row"
      className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)] px-3 py-2 text-[10px] uppercase tracking-wider text-[color:var(--color-text-subtle)]"
    >
      <span>Price ({quoteAsset})</span>
      <span className="text-right">Amount ({baseAsset})</span>
      <span className="text-right">Total</span>
    </div>
  )
}

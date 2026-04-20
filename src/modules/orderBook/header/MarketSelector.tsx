import type { ReactNode } from 'react'

import { marketConfigs } from '@/modules/market/config'
import { supportedSymbols, type Symbol } from '@/modules/market/core'
import { useSelectedSymbol } from '@/modules/market/state/SelectedSymbolProvider'
import { Select } from '@/ui/inputs/Select'

const options = supportedSymbols.map(symbol => ({
  value: symbol,
  label: marketConfigs[symbol].displayName
}))

export const MarketSelector = (): ReactNode => {
  const [symbol, setSymbol] = useSelectedSymbol()
  return (
    <Select<Symbol>
      ariaLabel="Select market"
      value={symbol}
      onChange={setSymbol}
      options={options}
    />
  )
}

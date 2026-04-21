import type { ReactNode } from 'react'

import { formatPrice } from '@/lib/format/formatPrice'
import { marketConfigs } from '@/modules/market/config'
import { useSelectedSymbol } from '@/modules/market/state/SelectedSymbolProvider'
import { Select } from '@/ui/inputs/Select'

import { usePriceStep } from '../state/PriceStepProvider'

export const PriceStepSelector = (): ReactNode => {
  const [symbol] = useSelectedSymbol()
  const [priceStep, setPriceStep] = usePriceStep()
  const { tickSteps } = marketConfigs[symbol]

  const options = tickSteps.map(step => ({
    value: String(step),
    label: formatPrice({ value: step, step })
  }))

  return (
    <Select
      ariaLabel="Price step"
      size="sm"
      value={String(priceStep)}
      onChange={next => setPriceStep(Number(next))}
      options={options}
    />
  )
}

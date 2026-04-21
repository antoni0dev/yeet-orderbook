import { decimalsForStep } from '../math/roundToTick'

type FormatPriceInput = {
  value: number
  step: number
}

export const formatPrice = ({ value, step }: FormatPriceInput): string => {
  const decimals = decimalsForStep(step)
  return value.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
    useGrouping: step >= 10
  })
}

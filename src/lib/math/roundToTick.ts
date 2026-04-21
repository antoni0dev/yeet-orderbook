type RoundToTickInput = {
  value: number
  step: number
  direction: 'floor' | 'ceil'
}

export const roundToTick = ({ value, step, direction }: RoundToTickInput): number => {
  if (step <= 0) {
    throw new Error(`Expected positive step, got ${step}`)
  }
  const ratio = value / step
  const rounded = direction === 'floor' ? Math.floor(ratio) : Math.ceil(ratio)
  return Number((rounded * step).toFixed(decimalsForStep(step)))
}

export const decimalsForStep = (step: number): number => {
  if (step >= 1) return 0
  const decimals = -Math.floor(Math.log10(step))
  return Math.max(0, Math.min(decimals, 12))
}

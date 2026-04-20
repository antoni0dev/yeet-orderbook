type ComputeRatioInput = {
  totalBidQty: number
  totalAskQty: number
}

export const computeRatio = ({ totalBidQty, totalAskQty }: ComputeRatioInput): number => {
  const sum = totalBidQty + totalAskQty
  if (sum <= 0) return 0.5
  return totalBidQty / sum
}

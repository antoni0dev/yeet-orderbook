import { describe, expect, it } from 'vitest'

import { computeRatio } from './computeRatio'

describe('computeRatio', () => {
  it('returns 0.5 when both sides are empty', () => {
    expect(computeRatio({ totalBidQty: 0, totalAskQty: 0 })).toBe(0.5)
  })

  it('returns 0.5 for a 50/50 split', () => {
    expect(computeRatio({ totalBidQty: 10, totalAskQty: 10 })).toBe(0.5)
  })

  it('returns the bid share for an imbalance', () => {
    expect(computeRatio({ totalBidQty: 30, totalAskQty: 10 })).toBeCloseTo(0.75, 5)
    expect(computeRatio({ totalBidQty: 1, totalAskQty: 9 })).toBeCloseTo(0.1, 5)
  })

  it('handles asymmetric zeros', () => {
    expect(computeRatio({ totalBidQty: 5, totalAskQty: 0 })).toBe(1)
    expect(computeRatio({ totalBidQty: 0, totalAskQty: 5 })).toBe(0)
  })
})

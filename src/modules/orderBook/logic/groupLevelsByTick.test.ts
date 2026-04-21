import { describe, expect, it } from 'vitest'

import { groupLevelsByTick } from './groupLevelsByTick'

describe('groupLevelsByTick', () => {
  it('floors bids and merges adjacent levels into the same bucket', () => {
    const result = groupLevelsByTick({
      levels: [
        { price: 42_310.47, qty: 1 },
        { price: 42_310.42, qty: 2 },
        { price: 42_310.01, qty: 3 },
        { price: 42_309.99, qty: 4 }
      ],
      step: 0.1,
      side: 'bid',
      maxRows: 10
    })

    expect(result).toStrictEqual([
      { price: 42_310.4, qty: 3 },
      { price: 42_310, qty: 3 },
      { price: 42_309.9, qty: 4 }
    ])
  })

  it('ceils asks and sorts ascending so the best price sits first', () => {
    const result = groupLevelsByTick({
      levels: [
        { price: 42_311.99, qty: 5 },
        { price: 42_311.01, qty: 2 },
        { price: 42_310.55, qty: 7 }
      ],
      step: 1,
      side: 'ask',
      maxRows: 10
    })

    expect(result).toStrictEqual([
      { price: 42_311, qty: 7 },
      { price: 42_312, qty: 7 }
    ])
  })

  it('truncates to maxRows', () => {
    const levels = Array.from({ length: 50 }, (_, i) => ({ price: 100 - i * 0.01, qty: 1 }))
    const result = groupLevelsByTick({
      levels,
      step: 0.01,
      side: 'bid',
      maxRows: 10
    })
    expect(result).toHaveLength(10)
    expect(result[0]?.price).toBe(100)
  })

  it('returns empty array for empty input', () => {
    expect(groupLevelsByTick({ levels: [], step: 1, side: 'bid', maxRows: 10 })).toStrictEqual([])
  })

  it('returns empty array when maxRows is zero', () => {
    expect(
      groupLevelsByTick({
        levels: [{ price: 1, qty: 1 }],
        step: 1,
        side: 'bid',
        maxRows: 0
      })
    ).toStrictEqual([])
  })
})

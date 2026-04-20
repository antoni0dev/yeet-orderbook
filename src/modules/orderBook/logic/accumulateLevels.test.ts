import { describe, expect, it } from 'vitest'

import { accumulateLevels } from './accumulateLevels'

describe('accumulateLevels', () => {
  it('produces a running cumQty from the best price outward', () => {
    const { levels, totalQty, maxQty } = accumulateLevels({
      levels: [
        { price: 100, qty: 2 },
        { price: 99, qty: 3 },
        { price: 98, qty: 5 }
      ]
    })

    expect(levels.map(l => l.cumQty)).toStrictEqual([2, 5, 10])
    expect(totalQty).toBe(10)
    expect(maxQty).toBe(5)
  })

  it('leaves cumQty[last] equal to totalQty', () => {
    const { levels, totalQty } = accumulateLevels({
      levels: Array.from({ length: 10 }, (_, i) => ({ price: 100 + i, qty: i + 1 }))
    })
    expect(levels[levels.length - 1]?.cumQty).toBe(totalQty)
  })

  it('handles an empty input', () => {
    const result = accumulateLevels({ levels: [] })
    expect(result).toStrictEqual({ levels: [], totalQty: 0, maxQty: 0 })
  })
})

import { describe, expect, it } from 'vitest'

import { formatPrice } from './formatPrice'

describe('formatPrice', () => {
  it('uses decimals derived from the price step', () => {
    expect(formatPrice({ value: 42_310.4, step: 0.1 })).toBe('42310.4')
    expect(formatPrice({ value: 42_310.4, step: 0.01 })).toBe('42310.40')
    expect(formatPrice({ value: 42_310, step: 1 })).toBe('42310')
  })

  it('groups thousands at step >= 10 and leaves lower steps ungrouped', () => {
    expect(formatPrice({ value: 42_310, step: 10 })).toBe('42,310')
    expect(formatPrice({ value: 1_234_500, step: 100 })).toBe('1,234,500')
    expect(formatPrice({ value: 42_310.4, step: 0.1 })).not.toContain(',')
  })

  it('preserves trailing zeros for low steps', () => {
    expect(formatPrice({ value: 42_310.1, step: 0.001 })).toBe('42310.100')
  })
})

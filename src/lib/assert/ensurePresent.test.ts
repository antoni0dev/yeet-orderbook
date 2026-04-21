import { describe, expect, it } from 'vitest'

import { ensurePresent } from './ensurePresent'
import { shouldBePresent } from './shouldBePresent'

describe('ensurePresent', () => {
  it('returns the original value when it is present', () => {
    const value = { label: 'ready' }

    expect(ensurePresent(value)).toBe(value)
  })

  it('throws for nullish values with the provided label', () => {
    expect(() => ensurePresent(undefined, 'selected symbol')).toThrow(
      'Expected selected symbol to be present'
    )
    expect(() => ensurePresent(null, 'selected symbol')).toThrow(
      'Expected selected symbol to be present'
    )
  })
})

describe('shouldBePresent', () => {
  it('delegates to ensurePresent for alias-style call sites', () => {
    expect(shouldBePresent('BTCUSDT', 'market')).toBe('BTCUSDT')
  })
})

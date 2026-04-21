import { describe, expect, it } from 'vitest'

import { decimalsForStep, roundToTick } from './roundToTick'

describe('roundToTick', () => {
  it('floors bids to the nearest step', () => {
    expect(roundToTick({ value: 42_310.47, step: 0.1, direction: 'floor' })).toBe(42_310.4)
    expect(roundToTick({ value: 42_310.47, step: 1, direction: 'floor' })).toBe(42_310)
    expect(roundToTick({ value: 42_310.47, step: 10, direction: 'floor' })).toBe(42_310)
    expect(roundToTick({ value: 42_310.47, step: 100, direction: 'floor' })).toBe(42_300)
  })

  it('ceils asks to the nearest step', () => {
    expect(roundToTick({ value: 42_310.47, step: 0.1, direction: 'ceil' })).toBe(42_310.5)
    expect(roundToTick({ value: 42_310.47, step: 1, direction: 'ceil' })).toBe(42_311)
    expect(roundToTick({ value: 42_310.01, step: 100, direction: 'ceil' })).toBe(42_400)
  })

  it('handles sub-cent precision without drift', () => {
    expect(roundToTick({ value: 145.123456, step: 0.001, direction: 'floor' })).toBe(145.123)
    expect(roundToTick({ value: 145.123456, step: 0.001, direction: 'ceil' })).toBe(145.124)
  })

  it('rejects a non-positive step', () => {
    expect(() => roundToTick({ value: 100, step: 0, direction: 'floor' })).toThrow()
    expect(() => roundToTick({ value: 100, step: -1, direction: 'ceil' })).toThrow()
  })
})

describe('decimalsForStep', () => {
  it('returns zero for integer steps', () => {
    expect(decimalsForStep(1)).toBe(0)
    expect(decimalsForStep(10)).toBe(0)
    expect(decimalsForStep(100)).toBe(0)
  })

  it('returns the inverse log for fractional steps', () => {
    expect(decimalsForStep(0.1)).toBe(1)
    expect(decimalsForStep(0.01)).toBe(2)
    expect(decimalsForStep(0.001)).toBe(3)
    expect(decimalsForStep(0.00001)).toBe(5)
  })
})

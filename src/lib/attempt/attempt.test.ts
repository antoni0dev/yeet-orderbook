import { describe, expect, it } from 'vitest'

import { attempt } from './attempt'

describe('attempt', () => {
  it('returns sync successes as data', () => {
    expect(attempt(() => 42)).toEqual({ data: 42 })
  })

  it('captures sync failures as unknown by default', () => {
    const error = new Error('boom')

    expect(attempt(() => {
      throw error
    })).toEqual({ error })
  })

  it('maps sync failures through an explicit error mapper', () => {
    const result = attempt({
      fn: () => {
        throw new Error('bad payload')
      },
      mapError: error => (error instanceof Error ? error.message : 'unknown error')
    })

    expect(result).toEqual({ error: 'bad payload' })
  })

  it('returns async successes as data', async () => {
    await expect(attempt(Promise.resolve('ready'))).resolves.toEqual({ data: 'ready' })
  })
})

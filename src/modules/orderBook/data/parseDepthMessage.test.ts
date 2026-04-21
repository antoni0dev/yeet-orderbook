import { describe, expect, it } from 'vitest'

import { createDepthMessageParser } from './parseDepthMessage'

describe('createDepthMessageParser', () => {
  it('returns typed errors for malformed json and schema-invalid payloads', () => {
    const parse = createDepthMessageParser()

    expect(parse('{not-json')).toEqual({
      kind: 'error',
      error: expect.objectContaining({ message: 'Received non-JSON order book payload' })
    })
    expect(
      parse(
        JSON.stringify({
          lastUpdateId: 1,
          bids: [['100.0', '1.5']]
        })
      )
    ).toEqual({
      kind: 'error',
      error: expect.objectContaining({ message: 'Received malformed order book payload' })
    })
  })

  it('maps valid messages and filters non-finite or non-positive levels', () => {
    const parse = createDepthMessageParser()

    expect(
      parse(
        JSON.stringify({
          lastUpdateId: 7,
          bids: [
            ['100.0', '1.5'],
            ['oops', '2.0'],
            ['101.0', '0']
          ],
          asks: [
            ['102.0', '3.5'],
            ['103.0', '-2'],
            ['NaN', '1']
          ]
        })
      )
    ).toEqual({
      kind: 'success',
      data: {
        lastUpdateId: 7,
        bids: [{ price: 100, qty: 1.5 }],
        asks: [{ price: 102, qty: 3.5 }]
      }
    })
  })

  it('validates each message independently after prior success', () => {
    const parse = createDepthMessageParser()

    expect(
      parse(
        JSON.stringify({
          lastUpdateId: 1,
          bids: [['100.0', '1.0']],
          asks: [['101.0', '1.0']]
        })
      )
    ).toEqual({
      kind: 'success',
      data: {
        lastUpdateId: 1,
        bids: [{ price: 100, qty: 1 }],
        asks: [{ price: 101, qty: 1 }]
      }
    })

    expect(
      parse(
        JSON.stringify({
          lastUpdateId: 2,
          bids: [['99.5', '2.5']]
        })
      )
    ).toEqual({
      kind: 'error',
      error: expect.objectContaining({ message: 'Received malformed order book payload' })
    })
  })
})

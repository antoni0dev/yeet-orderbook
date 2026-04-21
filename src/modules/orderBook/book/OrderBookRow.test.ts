import { describe, expect, it } from 'vitest'

import { isRowHighlightedFor } from './OrderBookRow'

describe('isRowHighlightedFor', () => {
  it('highlights rows from the hovered index back toward the spread', () => {
    expect(isRowHighlightedFor({ index: 0, hoveredIndex: 3 })).toBe(true)
    expect(isRowHighlightedFor({ index: 3, hoveredIndex: 3 })).toBe(true)
    expect(isRowHighlightedFor({ index: 4, hoveredIndex: 3 })).toBe(false)
  })
})

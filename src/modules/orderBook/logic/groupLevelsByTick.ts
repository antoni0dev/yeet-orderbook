import { decimalsForStep, roundToTick } from '@/lib/math/roundToTick'

import type { Side } from '../core'
import type { PriceLevel } from '../types'

type GroupLevelsByTickInput = {
  levels: readonly PriceLevel[]
  step: number
  side: Side
  maxRows: number
}

type BareGroupedLevel = { price: number; qty: number }

export const groupLevelsByTick = ({
  levels,
  step,
  side,
  maxRows
}: GroupLevelsByTickInput): BareGroupedLevel[] => {
  if (levels.length === 0 || maxRows <= 0) return []
  const decimals = decimalsForStep(step)
  const direction: 'floor' | 'ceil' = side === 'bid' ? 'floor' : 'ceil'
  const buckets = new Map<number, number>()

  for (const level of levels) {
    const grouped = roundToTick({ value: level.price, step, direction })
    const key = Number(grouped.toFixed(decimals))
    const existing = buckets.get(key) ?? 0
    buckets.set(key, existing + level.qty)
  }

  const sorted = Array.from(buckets, ([price, qty]) => ({ price, qty })).sort((a, b) =>
    side === 'bid' ? b.price - a.price : a.price - b.price
  )

  return sorted.slice(0, maxRows)
}

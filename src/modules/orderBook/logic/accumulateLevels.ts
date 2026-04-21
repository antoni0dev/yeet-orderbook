import type { GroupedLevel } from '../types'

type BareLevel = { price: number; qty: number }

type AccumulateLevelsInput = {
  levels: readonly BareLevel[]
}

type AccumulateLevelsResult = {
  levels: GroupedLevel[]
  totalQty: number
  maxQty: number
}

export const accumulateLevels = ({ levels }: AccumulateLevelsInput): AccumulateLevelsResult => {
  let running = 0
  let maxQty = 0
  const next: GroupedLevel[] = []

  for (const level of levels) {
    running += level.qty
    if (level.qty > maxQty) maxQty = level.qty
    next.push({ price: level.price, qty: level.qty, cumQty: running })
  }

  return { levels: next, totalQty: running, maxQty }
}

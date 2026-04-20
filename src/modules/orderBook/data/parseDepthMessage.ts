import { attempt } from '@/lib/attempt/attempt'

import type { OrderBookSnapshot, PriceLevel, RawDepthMessage, RawLevel } from '../types'
import { depthMessageSchema } from './depthMessageSchema'

type ParseState = { hasValidated: boolean }

const mapLevels = (raw: readonly RawLevel[]): readonly PriceLevel[] =>
  raw
    .map(([priceStr, qtyStr]) => ({ price: Number(priceStr), qty: Number(qtyStr) }))
    .filter(level => Number.isFinite(level.price) && Number.isFinite(level.qty) && level.qty > 0)

const toSnapshot = (raw: RawDepthMessage): OrderBookSnapshot => ({
  lastUpdateId: raw.lastUpdateId,
  bids: mapLevels(raw.bids),
  asks: mapLevels(raw.asks)
})

export const createDepthMessageParser = () => {
  const state: ParseState = { hasValidated: false }

  return (rawJson: string): OrderBookSnapshot | null => {
    const parseResult = attempt(() => JSON.parse(rawJson) as unknown)
    if (parseResult.error !== undefined) return null

    if (!state.hasValidated) {
      const validation = depthMessageSchema.safeParse(parseResult.data)
      if (!validation.success) return null
      state.hasValidated = true
      return toSnapshot(validation.data)
    }

    return toSnapshot(parseResult.data as RawDepthMessage)
  }
}

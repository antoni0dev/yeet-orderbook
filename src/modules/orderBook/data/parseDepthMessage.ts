import { attempt } from '@/lib/attempt/attempt'
import type { StreamParseResult } from '@/lib/ws/createStreamManager'

import type { OrderBookSnapshot, PriceLevel, RawDepthMessage, RawLevel } from '../types'
import { depthMessageSchema } from './depthMessageSchema'

const mapLevels = (raw: readonly RawLevel[]): readonly PriceLevel[] =>
  raw
    .map(([priceStr, qtyStr]) => ({ price: Number(priceStr), qty: Number(qtyStr) }))
    .filter(level => Number.isFinite(level.price) && Number.isFinite(level.qty) && level.qty > 0)

const toSnapshot = (raw: RawDepthMessage): OrderBookSnapshot => ({
  lastUpdateId: raw.lastUpdateId,
  bids: mapLevels(raw.bids),
  asks: mapLevels(raw.asks)
})

const createInvalidDepthMessageError = (): Error => new Error('Received malformed order book payload')

const createInvalidDepthJsonError = (): Error => new Error('Received non-JSON order book payload')

export const createDepthMessageParser = () => {
  return (rawJson: string): StreamParseResult<OrderBookSnapshot> => {
    const parseResult = attempt<unknown>(() => JSON.parse(rawJson))
    if (parseResult.error !== undefined) {
      return { kind: 'error', error: createInvalidDepthJsonError() }
    }

    const validation = depthMessageSchema.safeParse(parseResult.data)
    if (!validation.success) {
      return { kind: 'error', error: createInvalidDepthMessageError() }
    }

    return { kind: 'success', data: toSnapshot(validation.data) }
  }
}

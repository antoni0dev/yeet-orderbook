import { createStreamManager } from '@/lib/ws/createStreamManager'
import type { Symbol } from '@/modules/market/core'

import { defaultDepthLevels, defaultSpeedMs } from '../config'
import type { OrderBookSnapshot } from '../types'
import { buildStreamUrl } from './buildStreamUrl'
import { createDepthMessageParser } from './parseDepthMessage'

const parseDepthMessage = createDepthMessageParser()

const streamManager = createStreamManager<OrderBookSnapshot>({
  buildUrl: channel => channel,
  parse: parseDepthMessage,
  onParseError: channel => {
    console.warn(`[orderBook] dropped malformed message on ${channel}`)
  }
})

type SubscribeToOrderBookInput = {
  symbol: Symbol
  onSnapshot: (snapshot: OrderBookSnapshot) => void
}

export const subscribeToOrderBook = ({
  symbol,
  onSnapshot
}: SubscribeToOrderBookInput): (() => void) => {
  const channel = buildStreamUrl({ symbol, levels: defaultDepthLevels, speedMs: defaultSpeedMs })
  return streamManager.subscribe(channel, onSnapshot)
}

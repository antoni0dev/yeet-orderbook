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
  },
  onSocketError: (channel, error) => {
    console.warn(`[orderBook] socket failure on ${channel}: ${error.message}`)
  }
})

type SubscribeToOrderBookInput = {
  onError?: (error: Error) => void
  symbol: Symbol
  onSnapshot: (snapshot: OrderBookSnapshot) => void
}

type AwaitOrderBookSnapshotInput = {
  signal?: AbortSignal
  symbol: Symbol
}

const getOrderBookChannel = (symbol: Symbol): string =>
  buildStreamUrl({ symbol, levels: defaultDepthLevels, speedMs: defaultSpeedMs })

export const awaitOrderBookSnapshot = ({
  signal,
  symbol
}: AwaitOrderBookSnapshotInput): Promise<OrderBookSnapshot> =>
  streamManager.awaitNextMessage(getOrderBookChannel(symbol), signal)

export const subscribeToOrderBook = ({
  onError,
  symbol,
  onSnapshot
}: SubscribeToOrderBookInput): (() => void) => {
  return streamManager.subscribe(getOrderBookChannel(symbol), {
    onError,
    onMessage: onSnapshot
  })
}

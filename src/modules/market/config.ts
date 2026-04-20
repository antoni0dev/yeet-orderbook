import type { Symbol } from './core'

type MarketConfig = {
  displayName: string
  baseAsset: string
  quoteAsset: string
  tickSteps: readonly number[]
  defaultTickStep: number
  qtyDecimals: number
}

export const marketConfigs: Record<Symbol, MarketConfig> = {
  BTCUSDT: {
    displayName: 'BTC / USDT',
    baseAsset: 'BTC',
    quoteAsset: 'USDT',
    tickSteps: [0.01, 0.1, 1, 10, 100],
    defaultTickStep: 0.01,
    qtyDecimals: 5
  },
  ETHUSDT: {
    displayName: 'ETH / USDT',
    baseAsset: 'ETH',
    quoteAsset: 'USDT',
    tickSteps: [0.01, 0.1, 1, 10],
    defaultTickStep: 0.01,
    qtyDecimals: 4
  },
  SOLUSDT: {
    displayName: 'SOL / USDT',
    baseAsset: 'SOL',
    quoteAsset: 'USDT',
    tickSteps: [0.001, 0.01, 0.1, 1],
    defaultTickStep: 0.01,
    qtyDecimals: 2
  }
}

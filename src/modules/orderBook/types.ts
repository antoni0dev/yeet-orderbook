export type RawLevel = readonly [string, string]

export type RawDepthMessage = {
  readonly lastUpdateId: number
  readonly bids: readonly RawLevel[]
  readonly asks: readonly RawLevel[]
}

export type PriceLevel = { readonly price: number; readonly qty: number }

export type OrderBookSnapshot = {
  readonly lastUpdateId: number
  readonly bids: readonly PriceLevel[]
  readonly asks: readonly PriceLevel[]
}

export type GroupedLevel = {
  readonly price: number
  readonly qty: number
  readonly cumQty: number
}

export type GroupedOrderBook = {
  readonly asks: readonly GroupedLevel[]
  readonly bids: readonly GroupedLevel[]
  readonly maxAskQty: number
  readonly maxBidQty: number
  readonly totalAskQty: number
  readonly totalBidQty: number
  readonly bidRatio: number
  readonly bestBid: number | null
  readonly bestAsk: number | null
}

export type HoveredRow = {
  readonly side: 'bid' | 'ask'
  readonly index: number
}

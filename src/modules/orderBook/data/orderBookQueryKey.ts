import type { Symbol } from '@/modules/market/core'

export const orderBookQueryKey = (symbol: Symbol): readonly ['orderBook', Symbol] => [
  'orderBook',
  symbol
]

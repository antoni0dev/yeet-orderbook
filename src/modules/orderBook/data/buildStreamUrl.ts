import type { Symbol } from '@/modules/market/core'

import { binanceStreamBaseUrl } from '../config'
import type { DepthLevels, SpeedMs } from '../core'

type BuildStreamUrlInput = {
  symbol: Symbol
  levels: DepthLevels
  speedMs: SpeedMs
}

export const buildStreamUrl = ({ symbol, levels, speedMs }: BuildStreamUrlInput): string =>
  `${binanceStreamBaseUrl}/${symbol.toLowerCase()}@depth${levels}@${speedMs}ms`

import { marketConfigs } from '@/modules/market/config'
import type { Symbol } from '@/modules/market/core'

export const defaultPriceStepFor = (symbol: Symbol): number => marketConfigs[symbol].defaultTickStep

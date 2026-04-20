export const supportedSymbols = ['BTCUSDT', 'ETHUSDT', 'SOLUSDT'] as const

export type Symbol = (typeof supportedSymbols)[number]

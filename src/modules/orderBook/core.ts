export const depthLevels = [5, 10, 20] as const
export type DepthLevels = (typeof depthLevels)[number]

export const speedMs = [100, 1000] as const
export type SpeedMs = (typeof speedMs)[number]

export const depthModes = ['amount', 'cumulative'] as const
export type DepthMode = (typeof depthModes)[number]

export const sides = ['bid', 'ask'] as const
export type Side = (typeof sides)[number]

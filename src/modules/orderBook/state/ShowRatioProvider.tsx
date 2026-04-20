import { setupStateProvider } from '@/lib/state/setupStateProvider'

export const [ShowRatioProvider, useShowRatio] = setupStateProvider<boolean>('ShowRatio', true)

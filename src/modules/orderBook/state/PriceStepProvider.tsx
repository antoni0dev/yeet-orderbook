import { setupStateProvider } from '@/lib/state/setupStateProvider'

export const [PriceStepProvider, usePriceStep] = setupStateProvider<number>('PriceStep')

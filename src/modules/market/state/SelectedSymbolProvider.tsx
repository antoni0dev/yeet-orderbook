import { setupStateProvider } from '@/lib/state/setupStateProvider'

import type { Symbol } from '../core'

export const [SelectedSymbolProvider, useSelectedSymbol] = setupStateProvider<Symbol>(
  'SelectedSymbol',
  'BTCUSDT'
)

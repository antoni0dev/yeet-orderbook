import { setupStateProvider } from '@/lib/state/setupStateProvider'

import type { DepthMode } from '../core'

export const [DepthModeProvider, useDepthMode] = setupStateProvider<DepthMode>(
  'DepthMode',
  'amount'
)

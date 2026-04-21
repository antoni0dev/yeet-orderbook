import { setupStateProvider } from '@/lib/state/setupStateProvider'

import type { HoveredRow } from '../types'

export const [HoveredRowProvider, useHoveredRow] = setupStateProvider<HoveredRow | null>(
  'HoveredRow',
  null
)

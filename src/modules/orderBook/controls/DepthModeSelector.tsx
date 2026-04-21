import type { ReactNode } from 'react'

import { SegmentedControl } from '@/ui/inputs/SegmentedControl'

import { type DepthMode } from '../core'
import { useDepthMode } from '../state/DepthModeProvider'

const options = [
  { value: 'amount', label: 'Amount', ariaLabel: 'Show per-level amount bars' },
  { value: 'cumulative', label: 'Cumulative', ariaLabel: 'Show cumulative depth bars' }
] as const satisfies ReadonlyArray<{ value: DepthMode; label: string; ariaLabel: string }>

export const DepthModeSelector = (): ReactNode => {
  const [depthMode, setDepthMode] = useDepthMode()
  return (
    <SegmentedControl<DepthMode>
      ariaLabel="Depth visualization mode"
      value={depthMode}
      onChange={setDepthMode}
      options={options}
    />
  )
}

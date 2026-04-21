import type { ReactNode } from 'react'

import { HStack } from '@/ui/layout/Stack'

import { DepthModeSelector } from './DepthModeSelector'
import { PriceStepSelector } from './PriceStepSelector'
import { ShowRatioToggle } from './ShowRatioToggle'

export const ControlsBar = (): ReactNode => (
  <HStack
    alignItems="center"
    gap={12}
    className="flex-wrap border-y border-[color:var(--color-border)] bg-[color:var(--color-bg-elevated)] px-3 py-2"
  >
    <DepthModeSelector />
    <PriceStepSelector />
    <div className="ml-auto">
      <ShowRatioToggle />
    </div>
  </HStack>
)

import type { ReactNode } from 'react'

import { Toggle } from '@/ui/inputs/Toggle'

import { useShowRatio } from '../state/ShowRatioProvider'

export const ShowRatioToggle = (): ReactNode => {
  const [showRatio, setShowRatio] = useShowRatio()
  return <Toggle label="Ratio" checked={showRatio} onChange={setShowRatio} />
}

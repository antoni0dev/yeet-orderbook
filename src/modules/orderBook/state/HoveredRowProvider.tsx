import {
  createContext,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
  useContext,
  useState
} from 'react'

import { shouldBePresent } from '@/lib/assert/shouldBePresent'

import type { HoveredRow } from '../types'

type HoveredRowSetter = Dispatch<SetStateAction<HoveredRow | null>>

const HoveredRowValueContext = createContext<HoveredRow | null | undefined>(undefined)
const HoveredRowSetterContext = createContext<HoveredRowSetter | undefined>(undefined)

type HoveredRowProviderProps = {
  children: ReactNode
}

export const HoveredRowProvider = ({ children }: HoveredRowProviderProps): ReactNode => {
  const [hoveredRow, setHoveredRow] = useState<HoveredRow | null>(null)

  return (
    <HoveredRowSetterContext.Provider value={setHoveredRow}>
      <HoveredRowValueContext.Provider value={hoveredRow}>
        {children}
      </HoveredRowValueContext.Provider>
    </HoveredRowSetterContext.Provider>
  )
}

export const useHoveredRow = (): HoveredRow | null => {
  const hoveredRow = useContext(HoveredRowValueContext)

  if (hoveredRow === undefined) {
    throw new Error('HoveredRow value context')
  }

  return hoveredRow
}

export const useSetHoveredRow = (): HoveredRowSetter =>
  shouldBePresent(useContext(HoveredRowSetterContext), 'HoveredRow setter context')

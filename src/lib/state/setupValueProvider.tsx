import { createContext, type ReactNode, useContext } from 'react'

import { shouldBePresent } from '../assert/shouldBePresent'

type ChildrenProp = { children: ReactNode }

export const setupValueProvider = <T,>(contextId: string) => {
  const Context = createContext<T | undefined>(undefined)

  const Provider = ({ children, value }: ChildrenProp & { value: T }): ReactNode => (
    <Context.Provider value={value}>{children}</Context.Provider>
  )

  const useValue = (): T => {
    const value = useContext(Context)
    return shouldBePresent(value, `${contextId} context`)
  }

  return [Provider, useValue] as const
}

import {
  createContext,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
  useContext,
  useState
} from 'react'

import { shouldBePresent } from '../assert/shouldBePresent'

type ChildrenProp = { children: ReactNode }
type StateTuple<T> = readonly [T, Dispatch<SetStateAction<T>>]
type Baked<T> = { present: true; value: T } | { present: false }

export function setupStateProvider<T>(
  contextId: string,
  initialValue: T
): readonly [(props: ChildrenProp & { initialValue?: T }) => ReactNode, () => StateTuple<T>]
export function setupStateProvider<T>(
  contextId: string
): readonly [(props: ChildrenProp & { initialValue: T }) => ReactNode, () => StateTuple<T>]
export function setupStateProvider<T>(contextId: string, ...bakedArgs: [] | [T]) {
  const baked: Baked<T> =
    bakedArgs.length === 1 ? { present: true, value: bakedArgs[0] } : { present: false }
  const Context = createContext<StateTuple<T> | undefined>(undefined)

  const resolveInitial = (fromProp: T | undefined): T => {
    if (fromProp !== undefined) return fromProp
    if (baked.present) return baked.value
    throw new Error(`${contextId} provider requires an initialValue prop`)
  }

  const Provider = ({ children, initialValue }: ChildrenProp & { initialValue?: T }): ReactNode => {
    const tuple = useState<T>(() => resolveInitial(initialValue))
    return <Context.Provider value={tuple as StateTuple<T>}>{children}</Context.Provider>
  }

  const useValue = (): StateTuple<T> => {
    const value = useContext(Context)
    return shouldBePresent(value, `${contextId} context`)
  }

  return [Provider, useValue] as const
}

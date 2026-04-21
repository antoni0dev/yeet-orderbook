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
type ProviderProps<T> = ChildrenProp & { initialValue?: T }
type Baked<T> = { present: true; value: T } | { present: false }

type SetupStateProvider = {
  <T>(
    contextId: string,
    initialValue: T
  ): readonly [(props: ProviderProps<T>) => ReactNode, () => StateTuple<T>]
  <T>(
    contextId: string
  ): readonly [(props: ChildrenProp & { initialValue: T }) => ReactNode, () => StateTuple<T>]
}

export const setupStateProvider: SetupStateProvider = <T,>(
  contextId: string,
  ...bakedArgs: [] | [T]
) => {
  const baked: Baked<T> =
    bakedArgs.length === 1 ? { present: true, value: bakedArgs[0] } : { present: false }
  const Context = createContext<StateTuple<T> | undefined>(undefined)

  const resolveInitial = (fromProp: T | undefined): T => {
    if (fromProp !== undefined) return fromProp
    if (baked.present) return baked.value
    throw new Error(`${contextId} provider requires an initialValue prop`)
  }

  const Provider = ({ children, initialValue }: ProviderProps<T>): ReactNode => {
    const tuple = useState<T>(() => resolveInitial(initialValue))
    return <Context.Provider value={tuple}>{children}</Context.Provider>
  }

  const useValue = (): StateTuple<T> => {
    const value = useContext(Context)
    return shouldBePresent(value, `${contextId} context`)
  }

  const result: readonly [(props: ProviderProps<T>) => ReactNode, () => StateTuple<T>] = [
    Provider,
    useValue
  ]

  return result
}

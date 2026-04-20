import { ensurePresent } from './ensurePresent'

export const shouldBePresent = <T>(value: T, valueName = 'value'): NonNullable<T> =>
  ensurePresent(value, valueName)

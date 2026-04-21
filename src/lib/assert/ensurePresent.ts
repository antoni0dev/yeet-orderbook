const isPresent = <T>(value: T): value is NonNullable<T> => value !== null && value !== undefined

export const ensurePresent = <T>(value: T, valueName = 'value'): NonNullable<T> => {
  if (!isPresent(value)) {
    throw new Error(`Expected ${valueName} to be present, got ${String(value)}`)
  }

  return value
}

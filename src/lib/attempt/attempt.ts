import type { Result } from './types'

export function attempt<T, E = unknown>(fn: () => T): Result<T, E>
export function attempt<T, E = unknown>(promise: Promise<T>): Promise<Result<T, E>>
export function attempt<T, E = unknown>(
  target: (() => T) | Promise<T>
): Result<T, E> | Promise<Result<T, E>> {
  if (target instanceof Promise) {
    return target.then(
      data => ({ data }) as Result<T, E>,
      error => ({ error: error as E }) as Result<T, E>
    )
  }
  try {
    return { data: target() }
  } catch (error) {
    return { error: error as E }
  }
}

import type { Failure, Result, Success } from './types'

type SyncAttemptInput<T, E> = {
  fn: () => T
  mapError: (error: unknown) => E
}

type AsyncAttemptInput<T, E> = {
  promise: Promise<T>
  mapError: (error: unknown) => E
}

type AttemptTarget<T, E> = (() => T) | Promise<T> | SyncAttemptInput<T, E> | AsyncAttemptInput<T, E>

const toSuccess = <T>(data: T): Success<T> => ({ data })

const toFailure = <E>(error: E): Failure<E> => ({ error })

const identity = (error: unknown) => error

const isPromise = <T>(value: AttemptTarget<T, unknown>): value is Promise<T> => value instanceof Promise

const isSyncAttemptInput = <T, E>(value: AttemptTarget<T, E>): value is SyncAttemptInput<T, E> =>
  typeof value === 'object' && value !== null && 'fn' in value

const attemptSync = <T, E>(fn: () => T, mapError: (error: unknown) => E): Result<T, E> => {
  try {
    return toSuccess(fn())
  } catch (error) {
    return toFailure(mapError(error))
  }
}

const attemptAsync = <T, E>(
  promise: Promise<T>,
  mapError: (error: unknown) => E
): Promise<Result<T, E>> => promise.then(toSuccess, error => toFailure(mapError(error)))

export function attempt<T>(fn: () => T): Result<T, unknown>
export function attempt<T>(promise: Promise<T>): Promise<Result<T, unknown>>
export function attempt<T, E>(input: SyncAttemptInput<T, E>): Result<T, E>
export function attempt<T, E>(input: AsyncAttemptInput<T, E>): Promise<Result<T, E>>
export function attempt<T, E>(target: AttemptTarget<T, E>) {
  if (typeof target === 'function') {
    return attemptSync(target, identity)
  }

  if (isPromise(target)) {
    return attemptAsync(target, identity)
  }

  if (isSyncAttemptInput(target)) {
    return attemptSync(target.fn, target.mapError)
  }

  return attemptAsync(target.promise, target.mapError)
}

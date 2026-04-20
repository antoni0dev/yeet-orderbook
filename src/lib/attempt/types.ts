export type Success<T> = { data: T; error?: undefined }
export type Failure<E> = { data?: undefined; error: E }
export type Result<T, E = unknown> = Success<T> | Failure<E>

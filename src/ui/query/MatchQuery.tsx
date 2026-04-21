import type { UseQueryResult } from '@tanstack/react-query'
import type { ReactNode } from 'react'

type MatchQueryProps<TData, TError> = {
  value: UseQueryResult<TData, TError>
  pending?: () => ReactNode
  error?: (error: TError) => ReactNode
  success: (data: TData) => ReactNode
}

export const MatchQuery = <TData, TError>({
  value,
  pending,
  error,
  success
}: MatchQueryProps<TData, TError>): ReactNode => {
  if (value.isPending) return pending ? pending() : null
  if (value.isError) return error ? error(value.error) : null
  return success(value.data)
}

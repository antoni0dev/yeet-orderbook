import type { ReactNode } from 'react'

type ErrorStateProps = {
  error: unknown
  onRetry?: () => void
}

const readMessage = (error: unknown): string => {
  if (error instanceof Error) return error.message
  if (typeof error === 'string') return error
  return 'Something went wrong.'
}

export const ErrorState = ({ error, onRetry }: ErrorStateProps): ReactNode => (
  <div
    role="alert"
    className="flex flex-col items-center gap-2 px-3 py-6 text-center text-xs text-[color:var(--color-ask)]"
  >
    <span>{readMessage(error)}</span>
    {onRetry ? (
      <button
        type="button"
        onClick={onRetry}
        className="rounded border border-[color:var(--color-border)] px-2 py-1 text-[color:var(--color-text-muted)] hover:text-[color:var(--color-text)]"
      >
        Retry
      </button>
    ) : null}
  </div>
)

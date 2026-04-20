import type { ReactNode } from 'react'

type SpinnerProps = {
  label?: string
}

export const Spinner = ({ label = 'Loading' }: SpinnerProps): ReactNode => (
  <div
    role="status"
    aria-live="polite"
    className="flex items-center justify-center gap-2 px-3 py-8 text-xs text-[color:var(--color-text-subtle)]"
  >
    <span
      aria-hidden="true"
      className="inline-block h-3 w-3 animate-spin rounded-full border border-[color:var(--color-border-strong)] border-t-[color:var(--color-text-muted)]"
    />
    <span>{label}</span>
  </div>
)

import type { ReactNode } from 'react'

type SegmentedOption<T extends string> = {
  value: T
  label: string
  ariaLabel?: string
  icon?: ReactNode
}

type SegmentedControlProps<T extends string> = {
  value: T
  onChange: (value: T) => void
  options: readonly SegmentedOption<T>[]
  ariaLabel: string
}

export const SegmentedControl = <T extends string>({
  value,
  onChange,
  options,
  ariaLabel
}: SegmentedControlProps<T>): ReactNode => (
  <div
    role="group"
    aria-label={ariaLabel}
    className="inline-flex overflow-hidden rounded border border-[color:var(--color-border)] bg-[color:var(--color-bg-elevated)]"
  >
    {options.map(option => {
      const isActive = option.value === value
      return (
        <button
          key={option.value}
          type="button"
          aria-pressed={isActive}
          aria-label={option.ariaLabel ?? option.label}
          onClick={() => onChange(option.value)}
          className={`flex h-7 items-center gap-1 px-2 text-xs transition-colors ${
            isActive
              ? 'bg-[color:var(--color-bg)] text-[color:var(--color-text)]'
              : 'text-[color:var(--color-text-subtle)] hover:text-[color:var(--color-text-muted)]'
          }`}
        >
          {option.icon}
          <span>{option.label}</span>
        </button>
      )
    })}
  </div>
)

import type { ReactNode } from 'react'

type SelectOption<T extends string> = {
  value: T
  label: string
}

type SelectProps<T extends string> = {
  value: T
  onChange: (value: T) => void
  options: readonly SelectOption<T>[]
  ariaLabel: string
  size?: 'sm' | 'md'
}

export const Select = <T extends string>({
  value,
  onChange,
  options,
  ariaLabel,
  size = 'md'
}: SelectProps<T>): ReactNode => {
  const sizing = size === 'sm' ? 'h-7 text-xs' : 'h-8 text-sm'
  return (
    <div className="relative inline-flex items-center">
      <select
        aria-label={ariaLabel}
        value={value}
        onChange={event => onChange(event.target.value as T)}
        className={`${sizing} appearance-none rounded border border-[color:var(--color-border)] bg-[color:var(--color-bg-elevated)] px-2 pr-7 text-[color:var(--color-text)] outline-none focus:border-[color:var(--color-border-strong)]`}
      >
        {options.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <svg
        aria-hidden="true"
        viewBox="0 0 12 12"
        className="pointer-events-none absolute right-2 h-3 w-3 text-[color:var(--color-text-subtle)]"
      >
        <path
          d="M2 4.5 6 8.5 10 4.5"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  )
}

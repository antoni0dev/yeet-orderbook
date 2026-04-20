import type { ReactNode } from 'react'

type ToggleProps = {
  checked: boolean
  onChange: (checked: boolean) => void
  label: string
}

export const Toggle = ({ checked, onChange, label }: ToggleProps): ReactNode => (
  <label className="inline-flex cursor-pointer items-center gap-2 select-none">
    <span className="text-xs text-[color:var(--color-text-muted)]">{label}</span>
    <span
      className={`relative inline-flex h-4 w-7 items-center rounded-full transition-colors ${
        checked ? 'bg-[color:var(--color-bid)]' : 'bg-[color:var(--color-border-strong)]'
      }`}
    >
      <input
        type="checkbox"
        className="sr-only"
        checked={checked}
        onChange={event => onChange(event.target.checked)}
        aria-label={label}
      />
      <span
        aria-hidden="true"
        className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
          checked ? 'translate-x-3.5' : 'translate-x-0.5'
        }`}
      />
    </span>
  </label>
)

import type { ReactNode } from 'react'

type PanelProps = {
  children: ReactNode
  className?: string
}

export const Panel = ({ children, className }: PanelProps): ReactNode => (
  <section
    className={`rounded-lg border border-[color:var(--color-border)] bg-[color:var(--color-bg-raised)] ${className ?? ''}`}
  >
    {children}
  </section>
)

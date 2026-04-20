import { type CSSProperties, type HTMLAttributes, type ReactNode } from 'react'

type HStackProps = {
  children: ReactNode
  gap?: CSSProperties['gap']
  alignItems?: CSSProperties['alignItems']
  justifyContent?: CSSProperties['justifyContent']
  fullWidth?: boolean
  className?: string
} & Omit<HTMLAttributes<HTMLDivElement>, 'className' | 'children'>

export const HStack = ({
  children,
  gap,
  alignItems,
  justifyContent,
  fullWidth,
  className,
  style,
  ...rest
}: HStackProps): ReactNode => (
  <div
    {...rest}
    className={className}
    style={{
      display: 'flex',
      flexDirection: 'row',
      gap,
      alignItems,
      justifyContent,
      width: fullWidth ? '100%' : undefined,
      ...style
    }}
  >
    {children}
  </div>
)

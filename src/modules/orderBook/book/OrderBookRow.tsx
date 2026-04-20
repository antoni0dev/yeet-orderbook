import { type ReactNode, useEffect, useRef, useState } from 'react'

import { formatPrice } from '@/lib/format/formatPrice'
import { formatQty } from '@/lib/format/formatQty'
import { match } from '@/lib/match/match'

import type { DepthMode, Side } from '../core'
import { useDepthMode } from '../state/DepthModeProvider'
import { useHoveredRow } from '../state/HoveredRowProvider'
import { usePriceStep } from '../state/PriceStepProvider'
import type { GroupedLevel } from '../types'

type FlashKind = 'new' | 'up' | 'down'
type FlashDirection = 'up' | 'down'
type Flash = { kind: FlashKind; tick: number }

type OrderBookRowProps = {
  side: Side
  index: number
  level: GroupedLevel
  maxQty: number
  totalQty: number
  qtyDecimals: number
}

const flashForSide: Record<Side, Record<FlashDirection, FlashKind>> = {
  bid: { up: 'up', down: 'down' },
  ask: { up: 'down', down: 'up' }
}

const priceColorForSide: Record<Side, string> = {
  bid: 'text-[color:var(--color-bid)]',
  ask: 'text-[color:var(--color-ask)]'
}

const barColorForSide: Record<Side, string> = {
  bid: 'bg-[color:var(--color-bid-bar)]',
  ask: 'bg-[color:var(--color-ask-bar)]'
}

const pickFlash = (prev: number | undefined, next: number, side: Side): FlashKind | null => {
  if (prev === undefined) return 'new'
  if (next === prev) return null
  const direction: FlashDirection = next > prev ? 'up' : 'down'
  return flashForSide[side][direction]
}

const isRowHighlightedFor = (index: number, hoveredIndex: number, side: Side): boolean =>
  match(side, {
    ask: () => index >= hoveredIndex,
    bid: () => index <= hoveredIndex
  })

const barRatioFor = (mode: DepthMode, level: GroupedLevel, maxQty: number, totalQty: number) =>
  match(mode, {
    amount: () => (maxQty > 0 ? level.qty / maxQty : 0),
    cumulative: () => (totalQty > 0 ? level.cumQty / totalQty : 0)
  })

export const OrderBookRow = ({
  side,
  index,
  level,
  maxQty,
  totalQty,
  qtyDecimals
}: OrderBookRowProps): ReactNode => {
  const [priceStep] = usePriceStep()
  const [depthMode] = useDepthMode()
  const [hovered, setHovered] = useHoveredRow()

  const prevQtyRef = useRef<number | undefined>(undefined)
  const tickRef = useRef(0)
  const [flash, setFlash] = useState<Flash | null>(null)

  useEffect(() => {
    const kind = pickFlash(prevQtyRef.current, level.qty, side)
    prevQtyRef.current = level.qty
    if (kind === null) return
    tickRef.current += 1
    setFlash({ kind, tick: tickRef.current })
  }, [level.qty, side])

  const isHighlighted =
    hovered !== null && hovered.side === side && isRowHighlightedFor(index, hovered.index, side)
  const barWidthPct = Math.min(100, barRatioFor(depthMode, level, maxQty, totalQty) * 100)

  return (
    <div
      onMouseEnter={() => setHovered({ side, index })}
      data-highlighted={isHighlighted}
      className="relative grid cursor-crosshair grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)] items-center px-3 py-[2px] font-mono text-[11.5px] leading-5 tabular-nums data-[highlighted=true]:bg-[color:var(--color-hover)]"
    >
      <div
        aria-hidden="true"
        className={`absolute inset-y-0 right-0 ${barColorForSide[side]} transition-[width] duration-[120ms] ease-linear`}
        style={{ width: `${barWidthPct}%` }}
      />
      {flash ? (
        <div
          key={flash.tick}
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{ animation: `flash-${flash.kind} 360ms ease-out forwards` }}
        />
      ) : null}
      <span className={`relative z-10 ${priceColorForSide[side]}`}>
        {formatPrice({ value: level.price, step: priceStep })}
      </span>
      <span className="relative z-10 text-right text-[color:var(--color-text)]">
        {formatQty({ value: level.qty, decimals: qtyDecimals })}
      </span>
      <span className="relative z-10 text-right text-[color:var(--color-text-muted)]">
        {formatQty({ value: level.cumQty, decimals: qtyDecimals })}
      </span>
    </div>
  )
}

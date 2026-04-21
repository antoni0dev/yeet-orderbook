import { act, type ReactNode } from 'react'
import { createRoot } from 'react-dom/client'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { Select } from './Select'

const cleanups: Array<() => void> = []

const render = (node: ReactNode) => {
  const container = document.createElement('div')
  document.body.append(container)

  const root = createRoot(container)

  act(() => {
    root.render(node)
  })

  const cleanup = () => {
    act(() => {
      root.unmount()
    })
    container.remove()
  }

  cleanups.push(cleanup)

  return { container, cleanup }
}

afterEach(() => {
  while (cleanups.length > 0) {
    const cleanup = cleanups.pop()
    cleanup?.()
  }
})

describe('Select', () => {
  it('emits the matching option value on change', () => {
    const handleChange = vi.fn()
    const options = [
      { value: 'BTCUSDT', label: 'BTC / USDT' },
      { value: 'ETHUSDT', label: 'ETH / USDT' }
    ] as const

    const { container } = render(
      <Select
        ariaLabel="Select market"
        value="BTCUSDT"
        onChange={handleChange}
        options={options}
      />
    )

    const select = container.querySelector('select')

    act(() => {
      if (select === null) {
        throw new Error('select element should exist')
      }

      select.value = 'ETHUSDT'
      select.dispatchEvent(new Event('change', { bubbles: true }))
    })

    expect(handleChange).toHaveBeenCalledWith('ETHUSDT')
  })

  it('fails fast when the DOM value does not match a declared option', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})
    const handleChange = vi.fn()

    const { container } = render(
      <Select
        ariaLabel="Select market"
        value="BTCUSDT"
        onChange={handleChange}
        options={[{ value: 'BTCUSDT', label: 'BTC / USDT' }]}
      />
    )

    const select = container.querySelector('select')

    act(() => {
      if (select === null) {
        throw new Error('select element should exist')
      }

      const invalidOption = document.createElement('option')
      invalidOption.value = 'ETHUSDT'
      invalidOption.textContent = 'ETH / USDT'
      select.append(invalidOption)
      select.value = 'ETHUSDT'
      select.dispatchEvent(new Event('change', { bubbles: true }))
    })

    expect(handleChange).not.toHaveBeenCalled()
    expect(consoleError).toHaveBeenCalled()

    consoleError.mockRestore()
  })
})

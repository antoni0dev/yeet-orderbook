import { act, type ReactNode } from 'react'
import { createRoot } from 'react-dom/client'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { setupStateProvider } from './setupStateProvider'

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

describe('setupStateProvider', () => {
  it('uses the baked initial value and exposes the shared setter', () => {
    const [CountProvider, useCount] = setupStateProvider('Count', 1)

    const Counter = (): ReactNode => {
      const [count, setCount] = useCount()

      return (
        <button type="button" onClick={() => setCount(current => current + 1)}>
          {count}
        </button>
      )
    }

    const { container } = render(
      <CountProvider>
        <Counter />
      </CountProvider>
    )

    const button = container.querySelector('button')
    expect(button?.textContent).toBe('1')

    act(() => {
      button?.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    })

    expect(button?.textContent).toBe('2')
  })

  it('throws when a non-baked provider is rendered without an initial value', () => {
    const [CountProvider] = setupStateProvider<number>('Count')
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})

    expect(() => {
      // @ts-expect-error runtime guard coverage for missing required prop
      render(<CountProvider>missing</CountProvider>)
    }).toThrow('Count provider requires an initialValue prop')

    consoleError.mockRestore()
  })

  it('throws when the hook is used outside its provider', () => {
    const [, useCount] = setupStateProvider('Count', 0)
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})

    const Counter = (): ReactNode => {
      const [count] = useCount()
      return <div>{count}</div>
    }

    expect(() => {
      render(<Counter />)
    }).toThrow('Expected Count context to be present')

    consoleError.mockRestore()
  })
})

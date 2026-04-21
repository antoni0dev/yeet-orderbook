type RafBatcher<T> = {
  push: (value: T) => void
  cancel: () => void
}

export const rafBatcher = <T>(flush: (latest: T) => void): RafBatcher<T> => {
  let pending: { value: T } | null = null
  let frameId: number | null = null

  const run = () => {
    frameId = null
    if (pending === null) return
    const value = pending.value
    pending = null
    flush(value)
  }

  return {
    push: (value: T) => {
      pending = { value }
      if (frameId === null) {
        frameId = requestAnimationFrame(run)
      }
    },
    cancel: () => {
      if (frameId !== null) {
        cancelAnimationFrame(frameId)
        frameId = null
      }
      pending = null
    }
  }
}

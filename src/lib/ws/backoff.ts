type BackoffInput = {
  attempt: number
  baseMs?: number
  capMs?: number
  jitterMs?: number
}

export const backoff = ({
  attempt,
  baseMs = 500,
  capMs = 15_000,
  jitterMs = 1_000
}: BackoffInput): number => {
  const exponential = Math.min(capMs, baseMs * 2 ** attempt)
  const jitter = Math.random() * jitterMs
  return exponential + jitter
}

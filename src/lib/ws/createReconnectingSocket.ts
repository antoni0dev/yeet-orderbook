import { backoff } from './backoff'

type CreateReconnectingSocketInput = {
  url: string
  onMessage: (data: string) => void
  onFailure?: (error: Error) => void
  onOpen?: () => void
  silentReconnectMs?: number
}

type ReconnectingSocket = {
  close: () => void
}

const createSocketError = (url: string): Error => new Error(`WebSocket transport error on ${url}`)

const createSocketClosedError = (url: string, event: CloseEvent): Error => {
  const reasonSuffix = event.reason.length > 0 ? `: ${event.reason}` : ''
  return new Error(`WebSocket closed on ${url} with code ${event.code}${reasonSuffix}`)
}

export const createReconnectingSocket = ({
  url,
  onMessage,
  onFailure,
  onOpen,
  silentReconnectMs = 15_000
}: CreateReconnectingSocketInput): ReconnectingSocket => {
  let socket: WebSocket | null = null
  let attempt = 0
  let reconnectTimer: ReturnType<typeof setTimeout> | null = null
  let silentTimer: ReturnType<typeof setTimeout> | null = null
  let isClosedByUser = false
  let isPaused = false

  const clearReconnectTimer = () => {
    if (reconnectTimer !== null) {
      clearTimeout(reconnectTimer)
      reconnectTimer = null
    }
  }

  const clearSilentTimer = () => {
    if (silentTimer !== null) {
      clearTimeout(silentTimer)
      silentTimer = null
    }
  }

  const scheduleSilentWatchdog = () => {
    clearSilentTimer()
    silentTimer = setTimeout(() => {
      if (socket !== null) socket.close(4000, 'no-messages')
    }, silentReconnectMs)
  }

  const teardownSocket = () => {
    if (socket === null) return
    socket.onopen = null
    socket.onmessage = null
    socket.onerror = null
    socket.onclose = null
    socket.close()
    socket = null
  }

  const connect = () => {
    if (isClosedByUser || isPaused) return
    clearReconnectTimer()
    teardownSocket()

    const next = new WebSocket(url)
    let hasReportedFailure = false
    socket = next

    const reportFailure = (error: Error) => {
      if (hasReportedFailure) return
      hasReportedFailure = true
      onFailure?.(error)
    }

    next.onopen = () => {
      if (socket !== next) return
      attempt = 0
      scheduleSilentWatchdog()
      onOpen?.()
    }

    next.onmessage = event => {
      if (socket !== next) return
      scheduleSilentWatchdog()
      if (typeof event.data === 'string') onMessage(event.data)
    }

    next.onerror = () => {
      if (socket !== next) return
      reportFailure(createSocketError(url))
    }

    next.onclose = event => {
      if (socket !== next) return
      socket = null
      clearSilentTimer()
      reportFailure(createSocketClosedError(url, event))
      if (isClosedByUser || isPaused) return
      const delay = backoff({ attempt })
      attempt += 1
      reconnectTimer = setTimeout(connect, delay)
    }
  }

  const handleVisibility = () => {
    if (typeof document === 'undefined') return
    if (document.hidden) {
      if (isPaused) return
      isPaused = true
      clearReconnectTimer()
      clearSilentTimer()
      teardownSocket()
    } else {
      if (!isPaused) return
      isPaused = false
      attempt = 0
      connect()
    }
  }

  if (typeof document !== 'undefined') {
    document.addEventListener('visibilitychange', handleVisibility)
  }

  connect()

  return {
    close: () => {
      if (isClosedByUser) return
      isClosedByUser = true
      clearReconnectTimer()
      clearSilentTimer()
      if (typeof document !== 'undefined') {
        document.removeEventListener('visibilitychange', handleVisibility)
      }
      teardownSocket()
    }
  }
}

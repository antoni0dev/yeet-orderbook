import { backoff } from './backoff'

type CreateReconnectingSocketInput = {
  url: string
  onMessage: (data: string) => void
  onOpen?: () => void
  onClose?: () => void
  onError?: (err: Event) => void
  silentReconnectMs?: number
}

type ReconnectingSocket = {
  close: () => void
}

export const createReconnectingSocket = ({
  url,
  onMessage,
  onOpen,
  onClose,
  onError,
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
    socket = next

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

    next.onerror = event => {
      if (socket !== next) return
      onError?.(event)
    }

    next.onclose = () => {
      if (socket !== next) return
      socket = null
      clearSilentTimer()
      onClose?.()
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

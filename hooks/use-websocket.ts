"use client"

import { useState, useEffect, useCallback, useRef } from 'react'
import { toast } from 'sonner'

interface WebSocketOptions {
  onMessage?: (data: any) => void
  onConnect?: () => void
  onDisconnect?: () => void
  onError?: (error: Error) => void
  autoReconnect?: boolean
  maxRetries?: number
  retryDelay?: number
}

interface WebSocketError extends Error {
  code?: number
  reason?: string
}

export function useWebSocket(url: string | null, options: WebSocketOptions = {}) {
  const [isConnected, setIsConnected] = useState(false)
  const wsRef = useRef<WebSocket | null>(null)
  const reconnectAttempts = useRef(0)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>()
  const isMounted = useRef(true)
  const lastErrorTime = useRef(0)
  const lastReconnectTime = useRef(0)
  
  const {
    onMessage,
    onConnect,
    onDisconnect,
    onError,
    autoReconnect = true,
    maxRetries = 5,
    retryDelay = 1000
  } = options

  const handleError = useCallback((error: WebSocketError) => {
    if (!isMounted.current) return
    
    console.error('WebSocket error:', error)
    
    // Rate limit error callbacks and toasts
    const now = Date.now()
    if (now - lastErrorTime.current >= 5000) {
      onError?.(error)
      lastErrorTime.current = now
    }
  }, [onError])

  const cleanup = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
    }
    if (wsRef.current) {
      // Remove listeners to prevent duplicate events
      wsRef.current.onclose = null
      wsRef.current.onerror = null
      wsRef.current.onmessage = null
      wsRef.current.onopen = null
      wsRef.current.close()
      wsRef.current = null
    }
    if (isMounted.current) {
      setIsConnected(false)
    }
  }, [])

  const connect = useCallback(() => {
    if (!url || !isMounted.current || wsRef.current?.readyState === WebSocket.OPEN) {
      return
    }

    // Rate limit reconnection attempts
    const now = Date.now()
    if (now - lastReconnectTime.current < retryDelay) {
      return
    }
    lastReconnectTime.current = now

    cleanup()

    try {
      const ws = new WebSocket(url)
      wsRef.current = ws

      ws.onopen = () => {
        if (!isMounted.current) return
        console.log('WebSocket connected')
        setIsConnected(true)
        reconnectAttempts.current = 0
        onConnect?.()
      }

      ws.onclose = (event) => {
        if (!isMounted.current) return
        console.log('WebSocket disconnected:', event.code, event.reason)
        setIsConnected(false)
        onDisconnect?.()

        // Only attempt reconnection on abnormal closure
        if (autoReconnect && event.code !== 1000 && event.code !== 1001) {
          if (reconnectAttempts.current < maxRetries) {
            const delay = Math.min(retryDelay * Math.pow(2, reconnectAttempts.current), 10000)
            console.log(`Reconnecting in ${delay}ms (attempt ${reconnectAttempts.current + 1}/${maxRetries})`)
            
            reconnectTimeoutRef.current = setTimeout(() => {
              if (isMounted.current) {
                reconnectAttempts.current++
                connect()
              }
            }, delay)
          } else {
            const error = new Error(`Max reconnection attempts (${maxRetries}) reached`) as WebSocketError
            error.code = event.code
            error.reason = event.reason
            handleError(error)
          }
        }
      }

      ws.onerror = (event) => {
        if (!isMounted.current) return
        
        const error = event instanceof ErrorEvent 
          ? event.error 
          : new Error('WebSocket connection failed')
        
        handleError(error as WebSocketError)
        
        if (ws.readyState === WebSocket.OPEN) {
          ws.close()
        }
      }

      ws.onmessage = (event) => {
        if (!isMounted.current) return
        try {
          const data = JSON.parse(event.data)
          onMessage?.(data)
        } catch (error) {
          handleError(error as WebSocketError)
        }
      }
    } catch (error) {
      if (!isMounted.current) return
      handleError(error as WebSocketError)
    }
  }, [url, onMessage, onConnect, onDisconnect, autoReconnect, maxRetries, retryDelay, cleanup, handleError])

  const disconnect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.close(1000, 'Normal closure')
    }
    cleanup()
  }, [cleanup])

  const send = useCallback((data: unknown) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      try {
        wsRef.current.send(JSON.stringify(data))
      } catch (error) {
        handleError(error as WebSocketError)
      }
    }
  }, [handleError])

  useEffect(() => {
    isMounted.current = true
    
    if (url) {
      connect()
    } else {
      cleanup()
    }

    return () => {
      isMounted.current = false
      cleanup()
    }
  }, [url, connect, cleanup])

  return {
    isConnected,
    send,
    disconnect,
  }
}
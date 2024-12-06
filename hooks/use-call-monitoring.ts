"use client"

import { useState, useCallback, useEffect, useRef } from 'react'
import { useWebSocket } from './use-websocket'
import { getCallStatus } from '@/lib/vapi'
import { VapiCall } from '@/types/vapi'
import { toast } from 'sonner'

interface CallStats {
  duration: number
  status: VapiCall['status']
  quality: number
  packetLoss: number
  latency: number
  events: Array<{
    type: string
    timestamp: string
  }>
}

interface TranscriptMessage {
  role: 'agent' | 'customer'
  content: string
  timestamp: string
}

interface MonitorMessage {
  type: 'audio' | 'transcript' | 'status'
  level?: number
  role?: string
  text?: string
  status?: VapiCall['status']
  error?: string
}

interface VapiMessage {
  role: string
  message: string
  time: number
  endTime: number
  secondsFromStart: number
}

const AUDIO_LEVEL_DECAY = 0.95
const AUDIO_LEVEL_THRESHOLD = 0.1
const POLL_INTERVAL = 1000
const MAX_EVENTS = 10
const MAX_POLL_ERRORS = 3
const ERROR_TOAST_COOLDOWN = 5000
const RECONNECT_DELAY = 2000
const MAX_RECONNECT_ATTEMPTS = 3

export function useCallMonitoring(callId: string) {
  const [stats, setStats] = useState<CallStats>({
    duration: 0,
    status: 'queued',
    quality: 100,
    packetLoss: 0,
    latency: 0,
    events: [],
  })
  const [transcript, setTranscript] = useState<TranscriptMessage[]>([])
  const [audioLevel, setAudioLevel] = useState(0)
  const [error, setError] = useState<Error | null>(null)
  const pollErrorCount = useRef(0)
  const lastErrorTime = useRef(0)
  const isMounted = useRef(true)
  const reconnectAttempts = useRef(0)

  const addEvent = useCallback((type: string) => {
    if (!isMounted.current) return
    setStats(prev => ({
      ...prev,
      events: [
        ...prev.events,
        { type, timestamp: new Date().toLocaleTimeString() }
      ].slice(-MAX_EVENTS)
    }))
  }, [])

  const showErrorToast = useCallback((message: string) => {
    const now = Date.now()
    if (now - lastErrorTime.current >= ERROR_TOAST_COOLDOWN) {
      toast.error(message)
      lastErrorTime.current = now
    }
  }, [])

  const handleMonitorMessage = useCallback((data: unknown) => {
    if (!isMounted.current) return

    try {
      if (!data || typeof data !== 'object') {
        throw new Error('Invalid message format')
      }

      const message = data as MonitorMessage
      if (!message.type) {
        throw new Error('Missing message type')
      }

      switch (message.type) {
        case 'audio':
          if (typeof message.level === 'number') {
            setAudioLevel(prev => {
              const newLevel = Math.max(prev, message.level! * 100)
              return newLevel > AUDIO_LEVEL_THRESHOLD ? newLevel : 0
            })
          }
          break

        case 'transcript':
          if (message.role && message.text) {
            // Skip system messages
            if (!message.text.toLowerCase().includes("you are matt") && 
                !message.text.toLowerCase().includes("you are ben")) {
              setTranscript(prev => [...prev, {
                role: message.role as 'agent' | 'customer',
                content: message.text!,
                timestamp: new Date().toLocaleTimeString()
              }])
            }
          }
          break

        case 'status':
          if (message.status) {
            setStats(prev => ({
              ...prev,
              status: message.status!
            }))
          }
          break
      }

      setError(null)
      reconnectAttempts.current = 0
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to handle monitor message')
      console.error('Monitor message error:', error)
      setError(error)
    }
  }, [])

  const { isConnected } = useWebSocket(
    callId ? `wss://api.vapi.ai/call/${callId}/monitor` : null,
    {
      onMessage: handleMonitorMessage,
      onConnect: () => {
        if (!isMounted.current) return
        setError(null)
        reconnectAttempts.current = 0
        addEvent('Monitor Connected')
        toast.success('Call monitoring connected')
      },
      onDisconnect: () => {
        if (!isMounted.current) return
        setAudioLevel(0)
        addEvent('Monitor Disconnected')
      },
      onError: (err) => {
        if (!isMounted.current) return
        setError(err)
        
        reconnectAttempts.current++
        if (reconnectAttempts.current <= MAX_RECONNECT_ATTEMPTS) {
          setTimeout(() => {
            // Attempt to reconnect
          }, RECONNECT_DELAY * reconnectAttempts.current)
        } else {
          showErrorToast('Call monitoring error: ' + err.message)
        }
      },
      autoReconnect: true,
      maxRetries: MAX_RECONNECT_ATTEMPTS,
      retryDelay: RECONNECT_DELAY
    }
  )

  useEffect(() => {
    if (!callId) return

    const pollStatus = async () => {
      try {
        const response = await getCallStatus(callId)
        if (!response.success) throw new Error(response.error)

        const call = response.data
        if (!call || !isMounted.current) return

        pollErrorCount.current = 0
        setError(null)
        reconnectAttempts.current = 0

        setStats(prev => ({
          ...prev,
          status: call.status,
          duration: call.startedAt 
            ? Math.floor((Date.now() - new Date(call.startedAt).getTime()) / 1000)
            : 0,
        }))

        if (call.artifact?.messages) {
          // Filter out system messages
          const filteredMessages = call.artifact.messages.filter((msg: VapiMessage) =>
            !msg.message.toLowerCase().includes("you are matt") &&
            !msg.message.toLowerCase().includes("you are ben")
          )
          
          setTranscript(filteredMessages.map((msg: VapiMessage) => ({
            role: msg.role as 'agent' | 'customer',
            content: msg.message,
            timestamp: new Date(msg.time * 1000).toLocaleTimeString(),
          })))
        }

        setAudioLevel(prev => Math.max(0, prev * AUDIO_LEVEL_DECAY))
      } catch (err) {
        if (!isMounted.current) return

        pollErrorCount.current++
        const error = err instanceof Error ? err : new Error('Failed to get call status')
        console.error('Poll status error:', error)
        
        if (pollErrorCount.current >= MAX_POLL_ERRORS) {
          setError(error)
          showErrorToast('Lost connection to call. Please try again.')
        }
      }
    }

    isMounted.current = true
    const intervalId = setInterval(pollStatus, POLL_INTERVAL)

    return () => {
      isMounted.current = false
      clearInterval(intervalId)
      setError(null)
      setAudioLevel(0)
      pollErrorCount.current = 0
      reconnectAttempts.current = 0
    }
  }, [callId, showErrorToast])

  return {
    isConnected,
    stats,
    transcript,
    audioLevel,
    error
  }
}
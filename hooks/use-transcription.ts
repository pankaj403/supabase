"use client"

import { useState, useEffect } from 'react'
import { toast } from 'sonner'

interface Message {
  role: "agent" | "customer"
  content: string
  timestamp: string
}

export function useTranscription(callId: string | null) {
  const [messages, setMessages] = useState<Message[]>([])
  const [isConnected, setIsConnected] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!callId) return

    const wsUrl = `wss://6436-2001-8003-e99c-200-24f4-ddd4-6565-6070.ngrok-free.app/media-stream-eleven`
    const ws = new WebSocket(wsUrl)

    ws.onopen = () => {
      setIsConnected(true)
      console.log('WebSocket connected')
    }

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        
        if (data.event === 'transcript') {
          setMessages(prev => [...prev, {
            role: data.role,
            content: data.text,
            timestamp: new Date().toLocaleTimeString()
          }])
        }
      } catch (error) {
        console.error('WebSocket message error:', error)
      }
    }

    ws.onerror = (event) => {
      console.error('WebSocket error:', event)
      setError('Failed to connect to transcription service')
      toast.error('Transcription service connection failed')
    }

    ws.onclose = () => {
      setIsConnected(false)
      console.log('WebSocket disconnected')
    }

    return () => {
      ws.close()
    }
  }, [callId])

  return {
    messages,
    isConnected,
    error
  }
}
"use client"

import { useState, useCallback } from 'react'
import { createCall, endCall, getCallStatus } from '@/lib/vapi'
import { useClientStore } from '@/lib/data'
import { toast } from 'sonner'
import { VapiCall } from '@/types/vapi'

interface UseCallOptions {
  onCallStart?: (callId: string) => void
  onCallEnd?: (data?: VapiCall) => void
  clientId?: string
  clientHistory?: string[]
}

export function useCall({ 
  onCallStart, 
  onCallEnd, 
  clientId,
  clientHistory = []
}: UseCallOptions = {}) {
  const [isLoading, setIsLoading] = useState(false)
  const [currentCallId, setCurrentCallId] = useState<string | null>(null)
  const [callStatus, setCallStatus] = useState<string | null>(null)
  const { incrementCalls } = useClientStore()

  const formatHistoryContext = (history: string[]) => {
    if (history.length === 0) return ""
    
    const recentHistory = history
      .slice(-3) // Get last 3 interactions
      .map(entry => {
        const [timestamp, content] = entry.split("] ")
        return `${timestamp.replace("[", "")}: ${content}`
      })
      .join("\n")

    return `Previous interactions with this contact:\n${recentHistory}\n\nUse this context to personalize the conversation and reference relevant past interactions when appropriate.`
  }

  const startCall = useCallback(async (phoneNumber: string) => {
    setIsLoading(true)
    
    try {
      const assistantId = process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID
      
      if (!assistantId) {
        throw new Error("Missing VAPI_ASSISTANT_ID environment variable")
      }

      const context = formatHistoryContext(clientHistory)
      
      const response = await createCall({
        phoneNumber,
        assistantId,
        context: context || undefined
      })

      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to create call')
      }

      setCurrentCallId(response.data.id)
      setCallStatus(response.data.status)
      onCallStart?.(response.data.id)

      // Start polling for status updates
      pollCallStatus(response.data.id)

      // Increment call counters if clientId is provided
      if (clientId) {
        incrementCalls(clientId)
      }

      return response.data.id
    } catch (error) {
      console.error('Failed to start call:', error)
      toast.error('Failed to start call. Please try again.')
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [onCallStart, clientId, incrementCalls, clientHistory])

  const stopCall = useCallback(async () => {
    if (!currentCallId) return

    setIsLoading(true)
    try {
      const statusResponse = await getCallStatus(currentCallId)
      if (!statusResponse.success) {
        throw new Error(statusResponse.error || 'Failed to get call status')
      }

      const response = await endCall(currentCallId)
      if (!response.success) {
        throw new Error(response.error || 'Failed to end call')
      }
      
      setCallStatus("ended")
      onCallEnd?.(statusResponse.data)
      setCurrentCallId(null)
    } catch (error) {
      console.error('Failed to end call:', error)
      toast.error('Failed to end call. Please try again.')
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [currentCallId, onCallEnd])

  const pollCallStatus = async (callId: string) => {
    const pollInterval = setInterval(async () => {
      if (!callId) {
        clearInterval(pollInterval)
        return
      }

      try {
        const response = await getCallStatus(callId)
        if (!response.success || !response.data) {
          throw new Error(response.error || 'Failed to get call status')
        }

        const status = response.data.status
        setCallStatus(status)

        if (status === "ended") {
          clearInterval(pollInterval)
          onCallEnd?.(response.data)
          setCurrentCallId(null)
        }
      } catch (error) {
        console.error('Error polling call status:', error)
        clearInterval(pollInterval)
      }
    }, 2000) // Poll every 2 seconds

    // Cleanup on unmount
    return () => clearInterval(pollInterval)
  }

  return {
    isLoading,
    currentCallId,
    callStatus,
    startCall,
    stopCall,
  }
}
"use client"

import { useState } from "react"
import { toast } from "sonner"

interface UseApiOptions<T> {
  onSuccess?: (data: T) => void
  onError?: (error: string) => void
}

export function useApi<T>({ onSuccess, onError }: UseApiOptions<T> = {}) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const execute = async (
    apiCall: () => Promise<{ success: boolean; data?: T; error?: string }>
  ) => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await apiCall()

      if (!response.success) {
        throw new Error(response.error || 'An error occurred')
      }

      if (response.data && onSuccess) {
        onSuccess(response.data)
      }

      return response.data
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred'
      setError(errorMessage)
      
      if (onError) {
        onError(errorMessage)
      } else {
        toast.error(errorMessage)
      }
      
      return null
    } finally {
      setIsLoading(false)
    }
  }

  return {
    isLoading,
    error,
    execute,
  }
}
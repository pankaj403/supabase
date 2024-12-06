const API_BASE = `https://6436-2001-8003-e99c-200-24f4-ddd4-6565-6070.ngrok-free.app`

export class ApiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public code?: string
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

interface ApiOptions extends RequestInit {
  timeout?: number
}

interface ApiResponse<T = any> {
  status: 'success' | 'error'
  message?: string
  data?: T
  code?: string
}

export async function apiRequest<T>(
  endpoint: string,
  options: ApiOptions = {}
): Promise<ApiResponse<T>> {
  const url = `${API_BASE}${endpoint}`
  
  const defaultHeaders = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  }
  
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
      mode: 'cors',
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({
        message: `HTTP error! status: ${response.status}`
      }))
      
      throw new ApiError(
        error.message || `HTTP error! status: ${response.status}`,
        response.status,
        error.code
      )
    }

    const data = await response.json()
    return data
  } catch (error) {
    if (error instanceof ApiError) {
      throw error
    }
    
    if (!navigator.onLine) {
      throw new ApiError('No internet connection')
    }
    
    throw new ApiError(
      error instanceof Error ? error.message : 'An unexpected error occurred'
    )
  }
}
"use client"

const API_BASE = 'https://api.vapi.ai'

interface VapiCallOptions {
  phoneNumber: string
  assistantId: string
  context?: string
}

export async function createCall({
  phoneNumber,
  assistantId,
  context
}: VapiCallOptions) {
  try {
    const token = process.env.NEXT_PUBLIC_VAPI_TOKEN
    const phoneNumberId = process.env.NEXT_PUBLIC_VAPI_PHONE_NUMBER_ID
    
    if (!token) {
      throw new Error("Missing VAPI_TOKEN environment variable")
    }

    if (!assistantId) {
      throw new Error("Missing VAPI_ASSISTANT_ID environment variable")
    }

    if (!phoneNumberId) {
      throw new Error("Missing VAPI_PHONE_NUMBER_ID environment variable")
    }

    // Ensure phone number is in correct format
    if (!phoneNumber.startsWith('+61') || phoneNumber.length !== 12) {
      throw new Error("Invalid phone number format. Must be +61 followed by 9 digits")
    }

    const response = await fetch(`${API_BASE}/call`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        type: "outboundPhoneCall",
        phoneNumberId,
        customer: {
          number: phoneNumber,
        },
        assistantId,
        name: `Call to ${phoneNumber}`,
        assistantOverrides: context ? {
          messages: [
            {
              role: "system",
              content: context
            }
          ]
        } : undefined
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to create call')
    }

    const data = await response.json()
    
    if (!data?.id) {
      throw new Error("Invalid response from Vapi API")
    }
    
    return {
      success: true,
      data,
    }
  } catch (error) {
    const message = error instanceof Error 
      ? error.message 
      : "Failed to create call"
      
    console.error("Vapi createCall error:", { error, message })
    
    return {
      success: false,
      error: message,
    }
  }
}

export async function endCall(callId: string) {
  try {
    if (!callId) {
      throw new Error("Call ID is required")
    }

    const token = process.env.NEXT_PUBLIC_VAPI_TOKEN
    
    if (!token) {
      throw new Error("Missing VAPI_TOKEN environment variable")
    }

    const response = await fetch(`${API_BASE}/call/${callId}/hang`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to end call')
    }

    return { success: true }
  } catch (error) {
    const message = error instanceof Error 
      ? error.message 
      : "Failed to end call"
      
    console.error("Vapi endCall error:", { error, message })
    
    return {
      success: false,
      error: message,
    }
  }
}

export async function getCallStatus(callId: string) {
  try {
    if (!callId) {
      throw new Error("Call ID is required")
    }

    const token = process.env.NEXT_PUBLIC_VAPI_TOKEN
    
    if (!token) {
      throw new Error("Missing VAPI_TOKEN environment variable")
    }

    const response = await fetch(`${API_BASE}/call/${callId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to get call status')
    }

    const data = await response.json()
    
    if (!data?.id) {
      throw new Error("Invalid response from Vapi API")
    }
    
    return {
      success: true,
      data,
    }
  } catch (error) {
    const message = error instanceof Error 
      ? error.message 
      : "Failed to get call status"
      
    console.error("Vapi getCallStatus error:", { error, message })
    
    return {
      success: false,
      error: message,
    }
  }
}

export async function updateCall(callId: string, updates: Record<string, any>) {
  try {
    if (!callId) {
      throw new Error("Call ID is required")
    }

    const token = process.env.NEXT_PUBLIC_VAPI_TOKEN
    
    if (!token) {
      throw new Error("Missing VAPI_TOKEN environment variable")
    }

    const response = await fetch(`${API_BASE}/call/${callId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(updates)
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to update call')
    }

    const data = await response.json()
    
    if (!data?.id) {
      throw new Error("Invalid response from Vapi API")
    }
    
    return {
      success: true,
      data,
    }
  } catch (error) {
    const message = error instanceof Error 
      ? error.message 
      : "Failed to update call"
      
    console.error("Vapi updateCall error:", { error, message })
    
    return {
      success: false,
      error: message,
    }
  }
}
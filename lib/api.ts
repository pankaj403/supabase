import { createCall, endCall as vapiEndCall } from './vapi'

const VAPI_ASSISTANT_ID = process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID

export interface CallResponse {
  call_sid: string
  status: string
}

export async function initiateCall(phoneNumber: string): Promise<CallResponse> {
  try {
    if (!VAPI_ASSISTANT_ID) {
      throw new Error("Missing VAPI_ASSISTANT_ID environment variable")
    }

    // Format phone number for Vapi (remove spaces, ensure +61 prefix)
    const formattedNumber = phoneNumber
      .replace(/\s+/g, '')
      .replace(/^0/, '+61')
      .replace(/^\+?61?/, '+61')

    console.log('Initiating call to:', formattedNumber)

    const response = await createCall({
      phoneNumber: formattedNumber,
      assistantId: VAPI_ASSISTANT_ID
    })

    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to initiate call')
    }

    return {
      call_sid: response.data.id,
      status: response.data.status || 'unknown',
    }
  } catch (error) {
    const message = error instanceof Error 
      ? error.message 
      : 'An unexpected error occurred'
      
    console.error('Call initiation error:', { error, message })
    throw new Error(message)
  }
}

export async function endCall(callId: string): Promise<void> {
  try {
    if (!callId) {
      throw new Error('Call ID is required')
    }

    const response = await vapiEndCall(callId)
    
    if (!response.success) {
      throw new Error(response.error || 'Failed to end call')
    }
  } catch (error) {
    const message = error instanceof Error 
      ? error.message 
      : 'An unexpected error occurred'
      
    console.error('End call error:', { error, message })
    throw new Error(message)
  }
}
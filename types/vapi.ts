export interface VapiCall {
  id: string
  orgId: string
  createdAt: string
  updatedAt: string
  type: "inboundPhoneCall" | "outboundPhoneCall" | "webCall"
  status: "queued" | "ringing" | "in-progress" | "forwarding" | "ended"
  endedReason?: string
  startedAt?: string
  endedAt?: string
  cost?: number
  phoneNumber?: {
    number: string
  }
  customer?: {
    number: string
    phoneNumber?: string
  }
  artifact?: {
    transcript?: string
    messages?: Array<{
      role: string
      message: string
      time: number
      endTime: number
      secondsFromStart: number
    }>
    recordingUrl?: string
  }
  analysis?: {
    summary?: string
    structuredData?: Record<string, any>
    successEvaluation?: string
  }
  monitor?: {
    listenUrl?: string
    controlUrl?: string
  }
  costBreakdown?: {
    transport: number
    stt: number
    llm: number
    tts: number
    vapi: number
    total: number
  }
}

export interface VapiResponse<T> {
  success: boolean
  data?: T
  error?: string
}

export interface VapiCallFilters {
  limit?: number
  createdAtGe?: string
  createdAtLe?: string
  assistantId?: string
  phoneNumberId?: string
}
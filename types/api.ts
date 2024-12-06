export interface CampaignSettings {
  name: string
  callsPerDay: number
  startTime: string
  endTime: string
  timezone: string
  voicemailDetection: boolean
  maxAttempts: number
  callInterval: number
}

export interface Lead {
  id: string
  name: string
  company: string
  phone: string
  status: "pending" | "contacted" | "success" | "failed"
  lastContact: string
  notes: string
}

export interface CallRecord {
  id: string
  timestamp: string
  duration: string
  outcome: "connected" | "voicemail" | "no-answer"
  transcript: string
  sentiment: "positive" | "neutral" | "negative"
  notes: string
}
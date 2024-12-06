// Field Types
export interface ClientFields {
  ClientId: string;
  Name: string;
  ActiveCampaigns: number;
  TotalCalls: number;
  CallsThisMonth: number;
  ConnectedCalls: number;
  Voicemails: number;
  SuccessRate: number;
  AverageCallDuration: number;
  MonthlyCallDuration: number;
  LastMonthReset: string;
}

export interface CampaignFields {
  Name: string;
  ClientId: string;
  Status: 'active' | 'paused';
  StartDate: string;
  EndDate: string;
  Leads: number;
  Calls: number;
  SuccessRate: number;
  Goals: string;
  Results: string;
  Notes: string;
  DailyCallLimit: number;
  CallWindowStart: string;
  CallWindowEnd: string;
  TimeZone: string;
  VoicemailDetection: boolean;
  MaxAttempts: number;
  CallInterval: number;
}

export interface CustomerFields {
  Name: string;
  Phone: string;
  CampaignId: string;
  Status: 'pending' | 'contacted' | 'success' | 'failed';
  LastContact: string;
  Notes: string;
  ImportDate: string;
}

export interface CallLogFields {
  CampaignId: string;
  ClientId: string;
  Name: string;
  Phone: string;
  Status: string;
  CallId: string;
  DateTime: string;
  CallType: 'incoming' | 'outgoing';
  CallStatus: 'completed' | 'missed';
  Duration: number;
  VoicemailLeft: boolean;
  CallNotes: string;
  LastContact: string;
  FollowUpRequired: boolean;
  FollowUpDate?: string;
  ImportDate: string;
  AgentId: string;
}
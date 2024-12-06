export interface Client {
  id: string;
  name: string;
  phone: string;
  status: 'active' | 'inactive';
  dateAdded: string;
  activeCampaigns: number;
  totalCalls: number;
  callsThisMonth: number;
  connectedCalls: number;
  voicemails: number;
  successRate: number;
  averageCallDuration: string;
  monthlyCallDuration: number;
  lastMonthlyReset: string;
}

export interface Campaign {
  id: string;
  name: string;
  clientId: string | string[];
  status: "active" | "completed" | "pending" | "aborted" | "paused";
  startDate: string;
  endDate: string;
  goals: string;
  results: string;
  notes: string;
  dailyCallLimit: number;
  callWindowStart: string;
  callWindowEnd: string;
  timeZone: string;
  voicemailDetection: boolean;
  maxAttempts: number;
  callInterval: number;
  calls: number;
  successRate: number;
  totalCallsSent: number;
  callsThisMonth: number;
  totalCost: number;
  callsPickedUp: number;
  voiceMailsLeft: number;
  averageCallTime: number;
}

export interface Lead {
  id: string;
  name: string;
  phone: string;
  status: "pending" | "contacted" | "success" | "failed";
  lastContact: string;
  notes: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  status: "pending" | "contacted" | "success" | "failed";
  lastContact: string;
  notes: string;
  campaignId?: string;
  importTime: string;
}
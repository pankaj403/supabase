export interface AirtableClient {
  id: string;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  status: 'active' | 'inactive';
  dateAdded: string;
}

export interface AirtableCallLog {
  id: string;
  clientId: string;
  dateTime: string;
  callType: 'incoming' | 'outgoing';
  callStatus: 'completed' | 'missed';
  duration: number;
  voicemailLeft: boolean;
  callNotes: string;
  agentId: string;
}

export interface AirtableCampaign {
  id: string;
  clientId: string;
  name: string;
  startDate: string;
  endDate: string;
  status: 'active' | 'completed' | 'pending';
  goals: string;
  results: string;
  notes: string;
}

export interface AirtableCustomerInteraction {
  id: string;
  clientId: string;
  dateTime: string;
  interactionType: string;
  notes: string;
  callTranscript?: string;
  followUpRequired: boolean;
  followUpDate?: string;
  agentId: string;
}
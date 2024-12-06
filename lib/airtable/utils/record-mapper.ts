import { Campaign, Client, Customer } from '@/types';
import { CampaignFields, ClientFields, CustomerFields } from '../types/fields';
import { CAMPAIGN_FIELDS, CLIENT_FIELDS, CUSTOMER_FIELDS } from '../field-mappings';

export function mapCampaignRecord(record: any): Campaign {
  return {
    id: record.id,
    name: record.get(CAMPAIGN_FIELDS.name) as string,
    clientId: Array.isArray(record.get(CAMPAIGN_FIELDS.clientId)) 
      ? record.get(CAMPAIGN_FIELDS.clientId)[0] 
      : record.get(CAMPAIGN_FIELDS.clientId) as string,
    status: record.get(CAMPAIGN_FIELDS.status) as Campaign['status'],
    startDate: record.get(CAMPAIGN_FIELDS.startDate) as string,
    endDate: record.get(CAMPAIGN_FIELDS.endDate) as string,
    calls: Number(record.get(CAMPAIGN_FIELDS.calls)) || 0,
    successRate: Number(record.get(CAMPAIGN_FIELDS.successRate)) || 0,
    goals: record.get(CAMPAIGN_FIELDS.goals) as string || '',
    results: record.get(CAMPAIGN_FIELDS.results) as string || '',
    notes: record.get(CAMPAIGN_FIELDS.notes) as string || '',
    dailyCallLimit: Number(record.get(CAMPAIGN_FIELDS.dailyCallLimit)) || 50,
    callWindowStart: record.get(CAMPAIGN_FIELDS.callWindowStart) as string || '09:00',
    callWindowEnd: record.get(CAMPAIGN_FIELDS.callWindowEnd) as string || '17:00',
    timeZone: record.get(CAMPAIGN_FIELDS.timeZone) as string || 'America/New_York',
    voicemailDetection: Boolean(record.get(CAMPAIGN_FIELDS.voicemailDetection)) || false,
    maxAttempts: Number(record.get(CAMPAIGN_FIELDS.maxAttempts)) || 3,
    callInterval: Number(record.get(CAMPAIGN_FIELDS.callInterval)) || 24,
    totalCallsSent: Number(record.get(CAMPAIGN_FIELDS.totalCallsSent)) || 0,
    callsThisMonth: Number(record.get(CAMPAIGN_FIELDS.callsThisMonth)) || 0,
    totalCost: Number(record.get(CAMPAIGN_FIELDS.totalCost)) || 0,
    callsPickedUp: Number(record.get(CAMPAIGN_FIELDS.callsPickedUp)) || 0,
    voiceMailsLeft: Number(record.get(CAMPAIGN_FIELDS.voiceMailsLeft)) || 0,
    averageCallTime: Number(record.get(CAMPAIGN_FIELDS.averageCallTime)) || 0
  };
}

export function mapCustomerRecord(record: any): Customer {
  // Get the raw fields from the record
  const fields = record.fields;
  
  // Log the raw fields for debugging
  console.log('Raw Airtable fields:', fields);
  
  // Map the fields to our Customer type
  const customer: Customer = {
    id: record.id,
    name: String(fields.name || fields.Name || ''),
    phone: String(fields.phone || fields.Phone || ''),
    status: (fields.status || fields.Status || 'pending') as Customer['status'],
    lastContact: String(fields.lastContact || fields.LastContact || new Date().toISOString().split('T')[0]),
    notes: String(fields.notes || fields.Notes || ''),
    importTime: String(fields.importTime || fields.ImportTime || fields.ImportDate || new Date().toISOString().split('T')[0]),
    campaignId: Array.isArray(fields.campaignId || fields.CampaignId) 
      ? (fields.campaignId || fields.CampaignId)[0] 
      : fields.campaignId || fields.CampaignId
  };

  // Log the mapped customer for debugging
  console.log('Mapped customer:', customer);

  return customer;
}

export function mapClientRecord(record: any): Client {
  return {
    id: record.id,
    name: record.get(CLIENT_FIELDS.NAME) as string,
    phone: '',
    status: 'active',
    dateAdded: new Date().toISOString().split('T')[0],
    activeCampaigns: Number(record.get(CLIENT_FIELDS.ACTIVE_CAMPAIGNS)) || 0,
    totalCalls: Number(record.get(CLIENT_FIELDS.TOTAL_CALLS)) || 0,
    callsThisMonth: Number(record.get(CLIENT_FIELDS.CALLS_THIS_MONTH)) || 0,
    connectedCalls: Number(record.get(CLIENT_FIELDS.CONNECTED_CALLS)) || 0,
    voicemails: Number(record.get(CLIENT_FIELDS.VOICEMAILS)) || 0,
    successRate: Number(record.get(CLIENT_FIELDS.SUCCESS_RATE)) || 0,
    averageCallDuration: String(record.get(CLIENT_FIELDS.AVERAGE_CALL_DURATION)) || '0:00',
    monthlyCallDuration: Number(record.get(CLIENT_FIELDS.MONTHLY_CALL_DURATION)) || 0,
    lastMonthlyReset: record.get(CLIENT_FIELDS.LAST_MONTH_RESET) as string || new Date().toISOString().split('T')[0]
  };
}
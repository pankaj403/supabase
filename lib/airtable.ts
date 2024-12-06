import { Client, Campaign } from '@/types'
import { AirtableCallLog } from '@/types/airtable'
import { TABLE_IDS } from './airtable/field-mappings'
import { createCustomer, updateCustomer, getCustomers } from './airtable/customers'

interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
}

// Add your Airtable API key and base ID here
const AIRTABLE_API_KEY = process.env.NEXT_PUBLIC_AIRTABLE_API_KEY
const AIRTABLE_BASE_ID = process.env.NEXT_PUBLIC_AIRTABLE_BASE_ID

if (!AIRTABLE_API_KEY || !AIRTABLE_BASE_ID) {
  console.error('Missing Airtable credentials in environment variables')
}

const AIRTABLE_URL = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}`

async function fetchFromAirtable<T>(endpoint: string): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(`https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${endpoint}`, {
      headers: {
        'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    
    if (endpoint === 'Campaigns') {
      return {
        success: true,
        data: data.records.map((record: any) => ({
          id: record.id,
          name: record.fields['name'],
          clientId: record.fields['clientId']?.[0] || '',
          status: record.fields['status'] || 'pending',
          startDate: record.fields['startDate'],
          endDate: record.fields['endDate'],
          calls: record.fields['totalCallsSent'] || 0,
          successRate: 0,
          goals: record.fields['goals'] || '',
          results: record.fields['results'] || '',
          notes: record.fields['notes'] || '',
          dailyCallLimit: 0,
          callWindowStart: '09:00',
          callWindowEnd: '17:00',
          timeZone: 'America/New_York',
          voicemailDetection: true,
          maxAttempts: 3,
          callInterval: 60
        }))
      } as ApiResponse<T>
    }

    // Default mapping for other endpoints
    return { 
      success: true, 
      data: data.records.map((record: any) => ({ 
        id: record.id, 
        ...record.fields 
      }))
    }
  } catch (error) {
    console.error(`Error fetching from Airtable: ${error}`)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error occurred' }
  }
}

async function getClients(): Promise<ApiResponse<Client[]>> {
  return fetchFromAirtable<Client[]>('Clients')
}

async function getCampaigns(): Promise<ApiResponse<Campaign[]>> {
  return fetchFromAirtable<Campaign[]>('Campaigns')
}

async function updateCampaign(campaignId: string, fields: Partial<Campaign>): Promise<ApiResponse<Campaign>> {
  try {
    const response = await fetch(`${AIRTABLE_URL}/Campaigns/${campaignId}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ fields }),
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    return { success: true, data: { id: data.id, ...data.fields } }
  } catch (error) {
    console.error(`Error updating campaign: ${error}`)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error occurred' }
  }
}

async function createClient(client: Omit<Client, 'id'>): Promise<ApiResponse<Client>> {
  try {
    // Only send the essential fields that exist in Airtable
    const response = await fetch(`https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/Clients`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        records: [{
          fields: {
            'name': client.name,
            'phone': client.phone,
            'status': client.status || 'active'
          }
        }],
        typecast: true
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Airtable error response:', errorData);
      throw new Error(`HTTP error! status: ${response.status} - ${JSON.stringify(errorData)}`);
    }

    const data = await response.json();
    const record = data.records[0];

    // Return a complete Client object with default values for missing fields
    return {
      success: true,
      data: {
        id: record.id,
        name: record.fields['name'],
        phone: record.fields['phone'],
        status: record.fields['status'] || 'active',
        dateAdded: new Date().toISOString(),
        activeCampaigns: 0,
        totalCalls: 0,
        callsThisMonth: 0,
        connectedCalls: 0,
        voicemails: 0,
        successRate: 0,
        averageCallDuration: '0:00',
        monthlyCallDuration: 0,
        lastMonthlyReset: new Date().toISOString()
      }
    };
  } catch (error) {
    console.error(`Error creating client: ${error}`);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error occurred' };
  }
}

async function getCallLogs(clientId?: string): Promise<ApiResponse<AirtableCallLog[]>> {
  let endpoint = TABLE_IDS.CALL_LOGS
  if (clientId) {
    // Use Airtable formula to filter by clientId
    endpoint += `?filterByFormula={clientId}="${clientId}"`
  }
  return fetchFromAirtable<AirtableCallLog[]>(endpoint)
}

enum CAMPAIGN_FIELDS {
  NAME = 'Name',
  CLIENT_ID = 'ClientId',
  STATUS = 'Status',
  START_DATE = 'StartDate',
  END_DATE = 'EndDate',
  GOALS = 'Goals',
  NOTES = 'Notes',
  DAILY_CALL_LIMIT = 'DailyCallLimit',
  CALL_WINDOW_START = 'CallWindowStart',
  CALL_WINDOW_END = 'CallWindowEnd',
  TIME_ZONE = 'TimeZone',
  VOICEMAIL_DETECTION = 'VoicemailDetection',
  MAX_ATTEMPTS = 'MaxAttempts',
  CALL_INTERVAL = 'CallInterval',
  CALLS = 'Calls',
  SUCCESS_RATE = 'SuccessRate',
  RESULTS = 'Results'
}

async function createCampaign(campaign: Omit<Campaign, 'id'>): Promise<ApiResponse<Campaign>> {
  try {
    // First create a temporary client if needed
    let clientId = campaign.clientId;
    
    // Validate and ensure clientId is a valid Airtable record ID
    if (Array.isArray(clientId)) {
      clientId = clientId[0];
    }
    
    if (!clientId || !clientId.startsWith('rec')) {
      const tempClientResult = await createClient({
        name: 'Temporary Client',
        phone: '',
        status: 'active',
        dateAdded: new Date().toISOString(),
        activeCampaigns: 0,
        totalCalls: 0,
        callsThisMonth: 0,
        connectedCalls: 0,
        voicemails: 0,
        successRate: 0,
        averageCallDuration: '0:00',
        monthlyCallDuration: 0,
        lastMonthlyReset: new Date().toISOString(),
      });

      if (!tempClientResult.success || !tempClientResult.data) {
        throw new Error('Failed to create temporary client');
      }

      clientId = tempClientResult.data.id;
    }

    // Ensure clientId is an array for Airtable
    const clientIdArray = Array.isArray(campaign.clientId) 
      ? campaign.clientId 
      : [clientId];

    const response = await fetch(`${AIRTABLE_URL}/${TABLE_IDS.CAMPAIGNS}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        records: [{
          fields: {
            'name': campaign.name,
            'clientId': clientIdArray,
            'startDate': campaign.startDate || new Date().toISOString().split('T')[0],
            'endDate': campaign.endDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            'status': campaign.status || 'active',
            'goals': campaign.goals || '',
            'results': campaign.results || '',
            'notes': campaign.notes || '',
            'totalCallsSent': campaign.totalCallsSent || 0,
            'callsThisMonth': campaign.callsThisMonth || 0,
            'totalCost': campaign.totalCost || 0,
            'callsPickedUp': campaign.callsPickedUp || 0,
            'voiceMailsLeft': campaign.voiceMailsLeft || 0,
            'averageCallTime': campaign.averageCallTime || 0
          }
        }],
        typecast: true
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`HTTP error! status: ${response.status} - ${JSON.stringify(errorData)}`);
    }

    const data = await response.json();
    const record = data.records[0];
    
    return {
      success: true,
      data: {
        id: record.id,
        name: record.fields.name,
        clientId: record.fields.clientId?.[0] || clientId,
        status: record.fields.status,
        startDate: record.fields.startDate,
        endDate: record.fields.endDate,
        goals: record.fields.goals || '',
        results: record.fields.results || '',
        notes: record.fields.notes || '',
        dailyCallLimit: record.fields.dailyCallLimit || 50,
        callWindowStart: record.fields.callWindowStart || '09:00',
        callWindowEnd: record.fields.callWindowEnd || '17:00',
        timeZone: record.fields.timeZone || 'America/New_York',
        voicemailDetection: record.fields.voicemailDetection || false,
        maxAttempts: record.fields.maxAttempts || 3,
        callInterval: record.fields.callInterval || 24,
        calls: record.fields.calls || 0,
        successRate: record.fields.successRate || 0,
        totalCallsSent: record.fields.totalCallsSent || 0,
        callsThisMonth: record.fields.callsThisMonth || 0,
        totalCost: record.fields.totalCost || 0,
        callsPickedUp: record.fields.callsPickedUp || 0,
        voiceMailsLeft: record.fields.voiceMailsLeft || 0,
        averageCallTime: record.fields.averageCallTime || 0
      }
    };
  } catch (error) {
    console.error('Error creating campaign:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error occurred' };
  }
}

export { 
  getClients,
  getCampaigns,
  updateCampaign,
  createClient,
  getCallLogs,
  createCampaign,
  createCustomer,
  updateCustomer,
  getCustomers
}

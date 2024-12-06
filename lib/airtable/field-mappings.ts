// Table IDs
export const TABLE_IDS = {
  CAMPAIGNS: 'tblNrJfIqFw2RjvV6',
  CLIENTS: 'tblClients',
  CUSTOMERS: 'tbl0Q106vvpkCEJzI',
  CALL_LOGS: 'tblCallLogs'
} as const;

// Campaign Fields
export const CAMPAIGN_FIELDS = {
  TABLE_ID: TABLE_IDS.CAMPAIGNS,
  id: 'id',
  clientId: 'clientId',
  name: 'name',
  startDate: 'startDate',
  endDate: 'endDate',
  status: 'status',
  goals: 'goals',
  results: 'results',
  notes: 'notes',
  callWindowStart: 'callWindowStart',
  callWindowEnd: 'callWindowEnd',
  timeZone: 'timeZone',
  voicemailDetection: 'voicemailDetection',
  maxAttempts: 'maxAttempts',
  callInterval: 'callInterval',
  totalCallsSent: 'totalCallsSent',
  callsThisMonth: 'callsThisMonth',
  totalCost: 'totalCost',
  callsPickedUp: 'callsPickedUp',
  voiceMailsLeft: 'voiceMailsLeft',
  averageCallTime: 'averageCallTime',
  customers: 'Customers',
  callLogs: 'Call_Logs',
  calls: 'calls',
  successRate: 'successRate',
  dailyCallLimit: 'dailyCallLimit',
} as const;

// Campaign Status Options
export const CAMPAIGN_STATUS = {
  active: 'active',
  completed: 'completed',
  pending: 'pending',
  aborted: 'aborted',
  paused: 'paused'
} as const;

// Customer Fields with proper field IDs
export const CUSTOMER_FIELDS = {
  TABLE_ID: TABLE_IDS.CUSTOMERS,
  id: 'fldU1Rr8DTYIlv65V',
  campaignId: 'fldB5HsCc4sNfoTzO',
  name: 'fldtJ562IDLLlVnLH',
  phone: 'fldf4HczDEDkttidl',
  status: 'fldBVAfbaHM5wUIBC',
  lastContact: 'fldLBpTqOew4L00As',
  notes: 'fldzCbGv8J9mIyWES',
  importTime: 'fldvSY0FCmhClXzru'
} as const;

// Customer Status Options
export const CUSTOMER_STATUS = {
  pending: 'pending',
  contacted: 'contacted',
  success: 'success',
  failed: 'failed'
} as const;

// Field mapping helper type
export type FieldKey = keyof typeof CUSTOMER_FIELDS | keyof typeof CAMPAIGN_FIELDS;

// Export all constants
export const FIELD_MAPPINGS = {
  TABLES: TABLE_IDS,
  CAMPAIGN: CAMPAIGN_FIELDS,
  STATUS: {
    CAMPAIGN: CAMPAIGN_STATUS,
    CUSTOMER: CUSTOMER_STATUS
  }
} as const;

// Client Fields
export const CLIENT_FIELDS = {
  TABLE_ID: TABLE_IDS.CLIENTS,
  CLIENT_ID: 'ClientId',
  NAME: 'Name',
  ACTIVE_CAMPAIGNS: 'ActiveCampaigns',
  TOTAL_CALLS: 'TotalCalls',
  CALLS_THIS_MONTH: 'CallsThisMonth',
  CONNECTED_CALLS: 'ConnectedCalls',
  VOICEMAILS: 'Voicemails',
  SUCCESS_RATE: 'SuccessRate',
  AVERAGE_CALL_DURATION: 'AverageCallDuration',
  MONTHLY_CALL_DURATION: 'MonthlyCallDuration',
  LAST_MONTH_RESET: 'LastMonthReset'
} as const;

// Call Log Fields
export const CALL_LOG_FIELDS = {
  TABLE_ID: TABLE_IDS.CALL_LOGS,
  ID: 'fldgw1uVFhy0gEP0V', // Long text field for record ID
  CAMPAIGN_ID: 'fldAHLNFiIGUb2gFT', // Link to Campaigns table
  CAMPAIGN_ID_LOOKUP: 'fldNU6JvAn9SI2frz', // Lookup of Campaign IDs
  NAME: 'fld8rvZMwg2NHj9w', // Text field for name
  PHONE: 'fldT34np9R754nghU', // Long text field for phone
  STATUS: 'fldFb0xZkL9ZiMk9t', // Single select for status
  CALL_ID: 'fld4TqPadOBUMwO2J', // Text field for call ID
  CLIENT_ID: 'fldj0Yw4Z0t0yipWU', // Long text field for client ID
  DATE_TIME: 'fldn9RdjM5PbFXbgF', // Date field
  CALL_TYPE: 'fldRx6RFS882pPpgy', // Single select for call type
  CALL_STATUS: 'fld5G2Oab1H2giMB5', // Single select for call status
  DURATION: 'fldFdggmDUJ7mrIlq', // Number field
  VOICEMAIL_LEFT: 'fldnY47XZT0NmulKU', // Checkbox field
  CALL_NOTES: 'fldHbh6ssEJMGB6ML', // Long text field
  LAST_CONTACT: 'fldKRz0OsqOnWoKBr', // Date field
  FOLLOW_UP_REQUIRED: 'flduhm4Bxto68LSLh', // Checkbox field
  FOLLOW_UP_DATE: 'fldF4q9iDKcPHEGlY', // Date field
  IMPORT_TIME: 'fldfnKOwhVnMTyUDP', // Date and time field
  AGENT_ID: 'fldABdAkaLaKafCFr', // Text field
} as const;

// Helper function to format record data for Airtable
export function formatRecordForAirtable(
  data: Record<string, any>,
  type: 'CLIENT' | 'CAMPAIGN' | 'CUSTOMER' | 'CALL_LOG'
): Record<string, any> {
  const fieldMappings = {
    CLIENT: CLIENT_FIELDS,
    CAMPAIGN: CAMPAIGN_FIELDS,
    CUSTOMER: CUSTOMER_FIELDS,
    CALL_LOG: CALL_LOG_FIELDS
  };

  const mapping = fieldMappings[type];
  const formattedData: Record<string, any> = {};

  for (const [key, value] of Object.entries(data)) {
    if (key in mapping) {
      formattedData[mapping[key as keyof typeof mapping]] = value;
    }
  }

  return formattedData;
}
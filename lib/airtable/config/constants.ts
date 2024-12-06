export const AIRTABLE_CONFIG = {
  API_URL: 'https://api.airtable.com',
  MAX_RECORDS_PER_REQUEST: 10,
  DEFAULT_PAGE_SIZE: 100,
  MAX_FORMULA_LENGTH: 16000,
  RATE_LIMIT_DELAY: 200,
} as const;

export const ERROR_MESSAGES = {
  MISSING_CREDENTIALS: 'Missing Airtable credentials',
  NOT_CONFIGURED: 'Airtable not configured',
  INVALID_FIELD: 'Invalid field name in request',
  RECORD_NOT_FOUND: 'Record not found',
  UNAUTHORIZED: 'You do not have permission to perform this action',
  UNKNOWN_ERROR: 'An unexpected error occurred',
} as const;

export const FIELD_MAPPINGS = {
  STATUS: {
    active: 'active',
    paused: 'paused',
    Active: 'active',
    Paused: 'paused'
  },
  CUSTOMER_STATUS: {
    pending: 'Pending',
    contacted: 'Contacted',
    success: 'Success',
    failed: 'Failed'
  }
} as const;

export const DEFAULT_VALUES = {
  CAMPAIGN: {
    leads: 0,
    calls: 0,
    successRate: 0,
    results: '',
    dailyCallLimit: 50,
    callWindowStart: '09:00',
    callWindowEnd: '17:00',
    timeZone: 'Australia/Sydney',
    voicemailDetection: false,
    maxAttempts: 3,
    callInterval: 24
  }
} as const;
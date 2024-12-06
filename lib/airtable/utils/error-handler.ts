import { AirtableError } from '../types/responses';

export function handleAirtableError(error: any): { error: string; statusCode?: number } {
  console.error('Airtable error:', error);
  
  // Handle specific Airtable error types
  if (error.error?.type === 'UNKNOWN_FIELD_NAME') {
    return {
      error: 'Invalid field name in request. Please check field mappings.',
      statusCode: 422
    };
  }
  
  if (error.error?.type === 'INVALID_PERMISSIONS') {
    return {
      error: 'You do not have permission to perform this action',
      statusCode: 403
    };
  }
  
  if (error.error?.type === 'ROW_DOES_NOT_EXIST') {
    return {
      error: 'Record not found',
      statusCode: 404
    };
  }

  if (error.error?.type === 'INVALID_MULTIPLE_CHOICE_OPTIONS') {
    return {
      error: 'Invalid status value provided',
      statusCode: 422
    };
  }

  // Handle general error cases
  if (error.error) {
    return {
      error: error.error.message || 'An error occurred with Airtable',
      statusCode: error.statusCode
    };
  }
  
  if (error.message) {
    return {
      error: error.message,
      statusCode: error.statusCode
    };
  }
  
  return {
    error: 'An unexpected error occurred',
    statusCode: 500
  };
}
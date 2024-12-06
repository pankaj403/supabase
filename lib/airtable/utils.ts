import { AirtableError } from './types';

export function handleAirtableError(error: any): { error: string; statusCode?: number } {
  console.error('Airtable error:', error);
  
  if (error.error?.type === 'INVALID_PERMISSIONS') {
    return {
      error: 'You do not have permission to perform this action',
      statusCode: 403
    };
  }
  
  if (error.error?.type === 'INVALID_REQUEST_UNKNOWN_FIELD') {
    return {
      error: 'Invalid field name in request',
      statusCode: 422
    };
  }
  
  if (error.error?.type === 'ROW_DOES_NOT_EXIST') {
    return {
      error: 'Record not found',
      statusCode: 404
    };
  }

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

export function formatAirtableDate(date: Date | string): string {
  if (typeof date === 'string') {
    date = new Date(date);
  }
  return date.toISOString().split('T')[0];
}

export function formatAirtableDateTime(date: Date | string): string {
  if (typeof date === 'string') {
    date = new Date(date);
  }
  return date.toISOString();
}

export function formatAirtableNumber(value: number): number {
  return Math.round(value * 100) / 100;
}

export function formatAirtableDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

export function parseAirtableDuration(duration: string): number {
  const [minutes, seconds] = duration.split(':').map(Number);
  return (minutes * 60) + (seconds || 0);
}
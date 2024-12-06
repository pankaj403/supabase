import { FIELD_MAPPINGS } from '../config/constants';

export function formatAirtableStatus(status: string, type: 'campaign' | 'customer'): string {
  const mappings = type === 'campaign' ? FIELD_MAPPINGS.STATUS : FIELD_MAPPINGS.CUSTOMER_STATUS;
  return mappings[status as keyof typeof mappings] || status;
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

export function formatRecordFields<T extends Record<string, any>>(
  data: Partial<T>,
  fieldMap: Record<string, string>
): Record<string, any> {
  const fields: Record<string, any> = {};
  
  Object.entries(data).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      const fieldName = fieldMap[key] || key;
      fields[fieldName] = value;
    }
  });
  
  return fields;
}
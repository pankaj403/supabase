import { AirtableQueryOptions } from '../types/responses';

export function buildFilterFormula(conditions: Record<string, any>): string {
  const filters = Object.entries(conditions)
    .filter(([_, value]) => value !== undefined && value !== null)
    .map(([field, value]) => {
      // Handle different value types
      if (typeof value === 'string') {
        return `{${field}} = '${value.replace(/'/g, "\\'")}'`;
      }
      if (typeof value === 'boolean') {
        return `{${field}} = ${value ? 1 : 0}`;
      }
      if (Array.isArray(value)) {
        return `OR(${value.map(v => `{${field}} = '${v}'`).join(', ')})`;
      }
      return `{${field}} = ${value}`;
    });

  return filters.length > 1 
    ? `AND(${filters.join(', ')})`
    : filters[0] || '';
}

export function buildQueryOptions(options: Partial<AirtableQueryOptions>): AirtableQueryOptions {
  const defaultOptions: AirtableQueryOptions = {
    pageSize: 100,
    cellFormat: 'json',
    returnFieldsByFieldId: false,
    timeZone: 'Australia/Sydney',
    userLocale: 'en-AU'
  };

  return {
    ...defaultOptions,
    ...options,
    sort: options.sort?.map(sort => ({
      field: sort.field,
      direction: sort.direction || 'asc'
    }))
  };
}
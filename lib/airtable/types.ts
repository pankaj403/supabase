export interface AirtableResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  statusCode?: number;
}

export interface AirtableError extends Error {
  statusCode?: number;
  error?: {
    type?: string;
    message?: string;
  };
}

export interface AirtableQueryOptions {
  fields?: string[];
  filterByFormula?: string;
  maxRecords?: number;
  pageSize?: number;
  sort?: Array<{
    field: string;
    direction?: 'asc' | 'desc';
  }>;
  view?: string;
  cellFormat?: 'json' | 'string';
  timeZone?: string;
  userLocale?: string;
  returnFieldsByFieldId?: boolean;
}

export interface AirtableRecord {
  id: string;
  fields: Record<string, any>;
  createdTime: string;
}

export interface AirtableCreateFields {
  fields: Record<string, any>;
}

export interface AirtableUpdateFields {
  id: string;
  fields: Record<string, any>;
}
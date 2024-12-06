import { base } from './config';
import { AirtableResponse } from './types';
import { Client } from '@/types';
import { handleAirtableError } from './utils';
import { formatDuration } from '@/lib/utils';
import { CLIENT_FIELDS, formatRecordForAirtable } from './field-mappings';

export async function createClient(client: Omit<Client, 'id'>): Promise<AirtableResponse<Client>> {
  try {
    if (!base) {
      throw new Error('Airtable not configured');
    }

    // Create client with confirmed fields
    const fields = {
      'fldcBU3qAbN7nOENi': client.name, // name field
      'fldYuWbJIV8HiHVrN': client.phone || '', // phone field
      'fldSBJ7fxeg36BjOU': client.status || 'active', // status field
      'fld5BYDmF3pbJWPQj': new Date().toISOString().split('T')[0], // dateAdded field
      'fldIamvP2m6Lj50Xz': 0, // activeCampaigns field
      'fldA2k38Ad6F6TizK': 0, // callsThisMonth field
      'fldAzuLD4IwGJYcP8': 0, // totalCalls field
      'fld4Wn8Tk9q0rV8rc': 0, // connectedCalls field
      'fldh047UU6RyOrgdn': 0, // voicemails field
      'fld4fFDsxaRG3bDhH': 0, // successRate field
      'fldZ4Aao6bwcMS1iP': 0, // avgDuration field
    };

    // Create the record
    const record = await base('Clients').create([{ fields }], { typecast: true });

    if (!record || !record[0]) {
      throw new Error('Failed to create client record');
    }

    // Map the response to our Client type
    const newClient: Client = {
      id: record[0].id,
      name: record[0].fields['fldcBU3qAbN7nOENi'] as string,
      phone: record[0].fields['fldYuWbJIV8HiHVrN'] as string || '',
      status: record[0].fields['fldSBJ7fxeg36BjOU'] as 'active' | 'inactive',
      dateAdded: record[0].fields['fld5BYDmF3pbJWPQj'] as string,
      activeCampaigns: Number(record[0].fields['fldIamvP2m6Lj50Xz']) || 0,
      totalCalls: Number(record[0].fields['fldAzuLD4IwGJYcP8']) || 0,
      callsThisMonth: Number(record[0].fields['fldA2k38Ad6F6TizK']) || 0,
      connectedCalls: Number(record[0].fields['fld4Wn8Tk9q0rV8rc']) || 0,
      voicemails: Number(record[0].fields['fldh047UU6RyOrgdn']) || 0,
      successRate: Number(record[0].fields['fld4fFDsxaRG3bDhH']) || 0,
      averageCallDuration: formatDuration(Number(record[0].fields['fldZ4Aao6bwcMS1iP']) || 0),
      monthlyCallDuration: 0, // Not in the provided field list
      lastMonthlyReset: new Date().toISOString().split('T')[0]
    };

    return {
      success: true,
      data: newClient
    };
  } catch (error) {
    console.error(`Error creating client: ${error}`);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error occurred' 
    };
  }
}

export async function updateClient(id: string, updates: Record<string, any>): Promise<AirtableResponse<Client>> {
  try {
    if (!base) {
      throw new Error('Airtable not configured');
    }

    // Get current record first for calculations
    const currentRecord = await base(CLIENT_FIELDS.TABLE_ID).find(id);
    
    // Prepare fields to update
    const fields: Record<string, any> = {};
    
    Object.entries(updates).forEach(([key, value]) => {
      if (typeof value === 'object' && value !== null) {
        if ('increment' in value) {
          const currentValue = Number(currentRecord.get(key)) || 0;
          fields[key] = currentValue + value.increment;
        } else if ('decrement' in value) {
          const currentValue = Number(currentRecord.get(key)) || 0;
          fields[key] = Math.max(0, currentValue - value.decrement);
        }
      } else {
        fields[key] = value;
      }
    });

    // Format fields for Airtable
    const formattedFields = formatRecordForAirtable(fields, 'CLIENT');

    // Update record
    const record = await base(CLIENT_FIELDS.TABLE_ID).update(id, formattedFields, { typecast: true });

    const updatedClient: Client = {
      id: record.id,
      name: record.get('name') as string || '',
      phone: record.get('phone') as string || '',
      status: record.get('status') as 'active' | 'inactive' || 'active',
      dateAdded: record.get('dateAdded') as string || new Date().toISOString(),
      activeCampaigns: Number(record.get('activeCampaigns')) || 0,
      totalCalls: Number(record.get('totalCallsSent')) || 0,
      callsThisMonth: Number(record.get('callsThisMonth')) || 0,
      connectedCalls: Number(record.get('callsPickedUp')) || 0,
      voicemails: Number(record.get('voiceMailsLeft')) || 0,
      successRate: Number(record.get('successRate')) || 0,
      averageCallDuration: formatDuration(Number(record.get('averageCallTime')) || 0),
      monthlyCallDuration: Number(record.get('monthlyCallDuration')) || 0,
      lastMonthlyReset: record.get('lastMonthlyReset') as string || new Date().toISOString(),
    };

    return {
      success: true,
      data: updatedClient
    };
  } catch (error) {
    return {
      success: false,
      ...handleAirtableError(error)
    };
  }
}
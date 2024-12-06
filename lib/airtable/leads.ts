import { base } from './config';
import { AirtableRecord, AirtableResponse } from './types';
import { Lead } from '@/types';

const TABLE_NAME = 'Leads';

export async function getLeads(): Promise<AirtableResponse<Lead[]>> {
  try {
    if (!base) {
      throw new Error('Airtable not configured');
    }

    const records = await base(TABLE_NAME).select({
      view: 'Grid view'
    }).all();

    const leads = records.map(record => ({
      id: record.id,
      name: record.get('Name') as string,
      phone: record.get('Phone') as string,
      status: record.get('Status') as Lead['status'],
      lastContact: record.get('LastContact') as string || '-',
      notes: record.get('Notes') as string || '',
    }));

    return {
      success: true,
      data: leads
    };
  } catch (error: any) {
    console.error('Airtable getLeads error:', error);
    return {
      success: false,
      error: error.message || 'Failed to fetch leads',
      statusCode: error.statusCode
    };
  }
}

export async function createLead(lead: Omit<Lead, 'id'>): Promise<AirtableResponse<Lead>> {
  try {
    if (!base) {
      throw new Error('Airtable not configured');
    }

    const record = await base(TABLE_NAME).create({
      Name: lead.name,
      Phone: lead.phone,
      Status: lead.status,
      LastContact: lead.lastContact,
      Notes: lead.notes
    });

    const newLead: Lead = {
      id: record.id,
      name: record.get('Name') as string,
      phone: record.get('Phone') as string,
      status: record.get('Status') as Lead['status'],
      lastContact: record.get('LastContact') as string || '-',
      notes: record.get('Notes') as string || '',
    };

    return {
      success: true,
      data: newLead
    };
  } catch (error: any) {
    console.error('Airtable createLead error:', error);
    return {
      success: false,
      error: error.message || 'Failed to create lead',
      statusCode: error.statusCode
    };
  }
}

export async function updateLead(id: string, lead: Partial<Lead>): Promise<AirtableResponse<Lead>> {
  try {
    if (!base) {
      throw new Error('Airtable not configured');
    }

    const record = await base(TABLE_NAME).update(id, {
      ...(lead.name && { Name: lead.name }),
      ...(lead.phone && { Phone: lead.phone }),
      ...(lead.status && { Status: lead.status }),
      ...(lead.lastContact && { LastContact: lead.lastContact }),
      ...(lead.notes && { Notes: lead.notes })
    });

    const updatedLead: Lead = {
      id: record.id,
      name: record.get('Name') as string,
      phone: record.get('Phone') as string,
      status: record.get('Status') as Lead['status'],
      lastContact: record.get('LastContact') as string || '-',
      notes: record.get('Notes') as string || '',
    };

    return {
      success: true,
      data: updatedLead
    };
  } catch (error: any) {
    console.error('Airtable updateLead error:', error);
    return {
      success: false,
      error: error.message || 'Failed to update lead',
      statusCode: error.statusCode
    };
  }
}

export async function deleteLead(id: string): Promise<AirtableResponse<void>> {
  try {
    if (!base) {
      throw new Error('Airtable not configured');
    }

    await base(TABLE_NAME).destroy(id);
    return {
      success: true
    };
  } catch (error: any) {
    console.error('Airtable deleteLead error:', error);
    return {
      success: false,
      error: error.message || 'Failed to delete lead',
      statusCode: error.statusCode
    };
  }
}
import { base } from './config';
import { AirtableResponse } from './types';
import { AirtableCustomerInteraction } from '@/types/airtable';

const TABLE_NAME = 'Customer_Interactions';

export async function getCustomerInteractions(clientId?: string): Promise<AirtableResponse<AirtableCustomerInteraction[]>> {
  try {
    if (!base) {
      throw new Error('Airtable not configured');
    }

    const filterFormula = clientId ? `{ClientId} = '${clientId}'` : '';
    
    const records = await base(TABLE_NAME).select({
      filterByFormula: filterFormula,
      sort: [{ field: 'DateTime', direction: 'desc' }],
      view: 'Grid view'
    }).all();

    const interactions = records.map(record => ({
      id: record.id,
      clientId: record.get('ClientId') as string,
      dateTime: record.get('DateTime') as string,
      interactionType: record.get('InteractionType') as string,
      notes: record.get('Notes') as string,
      callTranscript: record.get('CallTranscript') as string,
      followUpRequired: record.get('FollowUpRequired') as boolean,
      followUpDate: record.get('FollowUpDate') as string,
      agentId: record.get('AgentId') as string,
    }));

    return {
      success: true,
      data: interactions
    };
  } catch (error: any) {
    console.error('Airtable getCustomerInteractions error:', error);
    return {
      success: false,
      error: error.message || 'Failed to fetch customer interactions',
      statusCode: error.statusCode
    };
  }
}

export async function createCustomerInteraction(
  interaction: Omit<AirtableCustomerInteraction, 'id'>
): Promise<AirtableResponse<AirtableCustomerInteraction>> {
  try {
    if (!base) {
      throw new Error('Airtable not configured');
    }

    // Map the interaction to Airtable field names
    const record = await base(TABLE_NAME).create({
      'ClientId': interaction.clientId,
      'DateTime': interaction.dateTime,
      'InteractionType': interaction.interactionType,
      'Notes': interaction.notes,
      'CallTranscript': interaction.callTranscript,
      'FollowUpRequired': interaction.followUpRequired,
      'FollowUpDate': interaction.followUpDate,
      'AgentId': interaction.agentId,
    }, { typecast: true }); // Enable typecast for handling single select options

    const newInteraction: AirtableCustomerInteraction = {
      id: record.id,
      clientId: record.get('ClientId') as string,
      dateTime: record.get('DateTime') as string,
      interactionType: record.get('InteractionType') as string,
      notes: record.get('Notes') as string,
      callTranscript: record.get('CallTranscript') as string,
      followUpRequired: record.get('FollowUpRequired') as boolean,
      followUpDate: record.get('FollowUpDate') as string,
      agentId: record.get('AgentId') as string,
    };

    return {
      success: true,
      data: newInteraction
    };
  } catch (error: any) {
    console.error('Airtable createCustomerInteraction error:', error);
    return {
      success: false,
      error: error.message || 'Failed to create customer interaction',
      statusCode: error.statusCode
    };
  }
}

export async function updateCustomerInteraction(
  id: string,
  interaction: Partial<AirtableCustomerInteraction>
): Promise<AirtableResponse<AirtableCustomerInteraction>> {
  try {
    if (!base) {
      throw new Error('Airtable not configured');
    }

    // Map the interaction to Airtable field names
    const record = await base(TABLE_NAME).update(id, {
      ...(interaction.interactionType && { 'InteractionType': interaction.interactionType }),
      ...(interaction.notes && { 'Notes': interaction.notes }),
      ...(interaction.callTranscript && { 'CallTranscript': interaction.callTranscript }),
      ...(interaction.followUpRequired !== undefined && { 'FollowUpRequired': interaction.followUpRequired }),
      ...(interaction.followUpDate && { 'FollowUpDate': interaction.followUpDate }),
    }, { typecast: true }); // Enable typecast for handling single select options

    const updatedInteraction: AirtableCustomerInteraction = {
      id: record.id,
      clientId: record.get('ClientId') as string,
      dateTime: record.get('DateTime') as string,
      interactionType: record.get('InteractionType') as string,
      notes: record.get('Notes') as string,
      callTranscript: record.get('CallTranscript') as string,
      followUpRequired: record.get('FollowUpRequired') as boolean,
      followUpDate: record.get('FollowUpDate') as string,
      agentId: record.get('AgentId') as string,
    };

    return {
      success: true,
      data: updatedInteraction
    };
  } catch (error: any) {
    console.error('Airtable updateCustomerInteraction error:', error);
    return {
      success: false,
      error: error.message || 'Failed to update customer interaction',
      statusCode: error.statusCode
    };
  }
}
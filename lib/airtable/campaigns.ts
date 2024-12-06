import { base } from './config';
import { AirtableResponse } from './types/responses';
import { Campaign } from '@/types';
import { TABLE_IDS, CAMPAIGN_FIELDS, formatRecordForAirtable } from './field-mappings';
import { ERROR_MESSAGES } from './config/constants';
import { validateCampaignFields } from './utils/field-validator';
import { mapCampaignRecord } from './utils/record-mapper';
import { FieldSet } from 'airtable';

interface CampaignFields extends FieldSet {
  name: string;
  clientId: string[];
  status: string;
  startDate: string;
  endDate: string;
  goals?: string;
  results?: string;
  notes?: string;
  totalCallsSent?: number;
  callsThisMonth?: number;
  totalCost?: number;
  callsPickedUp?: number;
  voiceMailsLeft?: number;
  averageCallTime?: number;
}

export async function createCampaign(campaignData: Omit<Campaign, 'id'>): Promise<AirtableResponse<Campaign>> {
  try {
    if (!base) {
      throw new Error(ERROR_MESSAGES.NOT_CONFIGURED);
    }

    console.log('Creating campaign with data:', campaignData);

    // Validate fields before creation
    const validationErrors = validateCampaignFields(campaignData);
    if (validationErrors.length > 0) {
      console.error('Campaign validation errors:', validationErrors);
      return {
        success: false,
        error: validationErrors.join(', ')
      };
    }

    // Format the data for Airtable
    const fields = formatRecordForAirtable(campaignData, 'CAMPAIGN');

    // Create the record
    const record = await base(TABLE_IDS.CAMPAIGNS).create([
      { fields }
    ]);

    if (!record || record.length === 0) {
      throw new Error('Failed to create campaign record');
    }

    // Map the record back to our Campaign type
    const campaign = mapCampaignRecord(record[0]);

    return {
      success: true,
      data: campaign
    };

  } catch (error: unknown) {
    console.error('Error creating campaign:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return {
      success: false,
      error: errorMessage
    };
  }
}

export async function updateCampaign(
  id: string,
  updates: Partial<Campaign>
): Promise<AirtableResponse<Campaign>> {
  try {
    if (!base) {
      throw new Error(ERROR_MESSAGES.NOT_CONFIGURED);
    }

    // Format the data for Airtable
    const fields = formatRecordForAirtable(updates, 'CAMPAIGN');

    // Update the record
    const record = await base(TABLE_IDS.CAMPAIGNS).update([
      { id, fields }
    ]);

    if (!record || record.length === 0) {
      throw new Error('Failed to update campaign record');
    }

    // Map the record back to our Campaign type
    const campaign = mapCampaignRecord(record[0]);

    return {
      success: true,
      data: campaign
    };

  } catch (error: unknown) {
    console.error('Error updating campaign:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return {
      success: false,
      error: errorMessage
    };
  }
}

export async function getCampaigns(clientId?: string): Promise<AirtableResponse<Campaign[]>> {
  try {
    if (!base) {
      throw new Error(ERROR_MESSAGES.NOT_CONFIGURED);
    }

    let filterByFormula = '';
    if (clientId) {
      filterByFormula = `FIND("${clientId}", {${CAMPAIGN_FIELDS.clientId}})`;
    }

    const records = await base(TABLE_IDS.CAMPAIGNS)
      .select({
        filterByFormula
      })
      .all();

    const campaigns = records.map(mapCampaignRecord);

    return {
      success: true,
      data: campaigns
    };

  } catch (error: unknown) {
    console.error('Error fetching campaigns:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return {
      success: false,
      error: errorMessage
    };
  }
}
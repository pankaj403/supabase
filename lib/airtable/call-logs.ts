import { base } from './config';
import { AirtableResponse } from './types';
import { handleAirtableError } from './utils';
import { VapiCall } from '@/types/vapi';
import { TABLE_IDS, CALL_LOG_FIELDS, formatRecordForAirtable } from './field-mappings';
import { logger } from '../utils/logger';

export interface CallLog {
  id: string;
  campaignId: string;
  clientId: string;
  name?: string;
  phone: string;
  status: string;
  callId: string;
  dateTime: string;
  callType: 'incoming' | 'outgoing' | 'missed';
  callStatus: 'completed' | 'missed' | 'voicemail';
  duration: number;
  voicemailLeft: boolean;
  callNotes: string;
  lastContact: string;
  followUpRequired: boolean;
  followUpDate?: string;
  importTime: string;
  agentId: string;
}

export async function createCallLog(
  clientId: string,
  campaignId: string | undefined,
  call: VapiCall,
  transcript: string[],
  notes: string = ''
): Promise<AirtableResponse<CallLog>> {
  try {
    if (!base) {
      throw new Error('Airtable not configured');
    }

    const duration = call.startedAt && call.endedAt 
      ? Math.round((new Date(call.endedAt).getTime() - new Date(call.startedAt).getTime()) / 1000)
      : 0;

    const now = new Date().toISOString();
    
    // Prepare fields, only including non-empty values
    const callLogData: Record<string, any> = {
      campaignId: campaignId || '',
      clientId: clientId,
      phone: call.customer?.number || '',
      status: call.status,
      callId: call.id,
      dateTime: now,
      callType: 'outgoing',
      callStatus: call.status === 'ended' ? 'completed' : 'missed',
      duration: duration,
      voicemailLeft: call.endedReason?.includes('voicemail') || false,
      callNotes: notes,
      lastContact: now.split('T')[0],
      followUpRequired: false,
      importTime: now,
      agentId: 'system',
    };

    // Log the initial call log data for debugging
    logger.debug('Initial Call Log Data', callLogData);

    // Remove any fields with empty or undefined values
    const filteredCallLogData = Object.fromEntries(
      Object.entries(callLogData).filter(([_, v]) => 
        v !== '' && v !== null && v !== undefined
      )
    );

    // Log the filtered call log data
    logger.debug('Filtered Call Log Data', filteredCallLogData);

    const fields = formatRecordForAirtable(filteredCallLogData, 'CALL_LOG');

    // Log the formatted fields
    logger.debug('Formatted Airtable Fields', fields);

    // Add transcript to notes if available
    if (transcript.length > 0) {
      fields[CALL_LOG_FIELDS.CALL_NOTES] = `${notes}\n\nTranscript:\n${transcript.join('\n')}`;
    }

    // Add call cost if available
    if (call.cost) {
      fields[CALL_LOG_FIELDS.CALL_NOTES] = `${fields[CALL_LOG_FIELDS.CALL_NOTES]}\n\nCall Cost: $${call.cost.toFixed(2)}`;
    }

    try {
      const record = await base(TABLE_IDS.CALL_LOGS).create(fields, { typecast: true });

      // Log the successful record creation
      logger.info('Call Log Record Created', { recordId: record.id });

      const callLog: CallLog = {
        id: record.id,
        campaignId: record.get(CALL_LOG_FIELDS.CAMPAIGN_ID) as string,
        clientId: record.get(CALL_LOG_FIELDS.CLIENT_ID) as string,
        name: record.get(CALL_LOG_FIELDS.NAME) as string,
        phone: record.get(CALL_LOG_FIELDS.PHONE) as string,
        status: record.get(CALL_LOG_FIELDS.STATUS) as string,
        callId: record.get(CALL_LOG_FIELDS.CALL_ID) as string,
        dateTime: record.get(CALL_LOG_FIELDS.DATE_TIME) as string,
        callType: record.get(CALL_LOG_FIELDS.CALL_TYPE) as CallLog['callType'],
        callStatus: record.get(CALL_LOG_FIELDS.CALL_STATUS) as CallLog['callStatus'],
        duration: record.get(CALL_LOG_FIELDS.DURATION) as number,
        voicemailLeft: record.get(CALL_LOG_FIELDS.VOICEMAIL_LEFT) as boolean,
        callNotes: record.get(CALL_LOG_FIELDS.CALL_NOTES) as string,
        lastContact: record.get(CALL_LOG_FIELDS.LAST_CONTACT) as string,
        followUpRequired: record.get(CALL_LOG_FIELDS.FOLLOW_UP_REQUIRED) as boolean,
        followUpDate: record.get(CALL_LOG_FIELDS.FOLLOW_UP_DATE) as string,
        importTime: record.get(CALL_LOG_FIELDS.IMPORT_TIME) as string,
        agentId: record.get(CALL_LOG_FIELDS.AGENT_ID) as string,
      };

      return {
        success: true,
        data: callLog
      };
    } catch (airtableError) {
      // Log the specific Airtable error details
      logger.error('Airtable Record Creation Error', { 
        error: airtableError, 
        fields: fields 
      });
      throw airtableError;
    }
  } catch (error) {
    // Log the general error
    logger.error('Call Log Creation Error', error);
    return {
      success: false,
      ...handleAirtableError(error)
    };
  }
}

export async function getCallLogs(
  clientId?: string,
  campaignId?: string,
  limit?: number
): Promise<AirtableResponse<CallLog[]>> {
  try {
    if (!base) {
      throw new Error('Airtable not configured');
    }

    let filterFormula = '';
    
    if (clientId && campaignId) {
      filterFormula = `AND({${CALL_LOG_FIELDS.CLIENT_ID}} = '${clientId}', {${CALL_LOG_FIELDS.CAMPAIGN_ID}} = '${campaignId}')`;
    } else if (clientId) {
      filterFormula = `{${CALL_LOG_FIELDS.CLIENT_ID}} = '${clientId}'`;
    } else if (campaignId) {
      filterFormula = `{${CALL_LOG_FIELDS.CAMPAIGN_ID}} = '${campaignId}'`;
    }

    const records = await base(TABLE_IDS.CALL_LOGS).select({
      filterByFormula: filterFormula,
      sort: [{ field: CALL_LOG_FIELDS.DATE_TIME, direction: 'desc' }],
      maxRecords: limit,
    }).all();

    const callLogs = records.map(record => ({
      id: record.id,
      campaignId: record.get(CALL_LOG_FIELDS.CAMPAIGN_ID) as string,
      clientId: record.get(CALL_LOG_FIELDS.CLIENT_ID) as string,
      name: record.get(CALL_LOG_FIELDS.NAME) as string,
      phone: record.get(CALL_LOG_FIELDS.PHONE) as string,
      status: record.get(CALL_LOG_FIELDS.STATUS) as string,
      callId: record.get(CALL_LOG_FIELDS.CALL_ID) as string,
      dateTime: record.get(CALL_LOG_FIELDS.DATE_TIME) as string,
      callType: record.get(CALL_LOG_FIELDS.CALL_TYPE) as CallLog['callType'],
      callStatus: record.get(CALL_LOG_FIELDS.CALL_STATUS) as CallLog['callStatus'],
      duration: record.get(CALL_LOG_FIELDS.DURATION) as number,
      voicemailLeft: record.get(CALL_LOG_FIELDS.VOICEMAIL_LEFT) as boolean,
      callNotes: record.get(CALL_LOG_FIELDS.CALL_NOTES) as string,
      lastContact: record.get(CALL_LOG_FIELDS.LAST_CONTACT) as string,
      followUpRequired: record.get(CALL_LOG_FIELDS.FOLLOW_UP_REQUIRED) as boolean,
      followUpDate: record.get(CALL_LOG_FIELDS.FOLLOW_UP_DATE) as string,
      importTime: record.get(CALL_LOG_FIELDS.IMPORT_TIME) as string,
      agentId: record.get(CALL_LOG_FIELDS.AGENT_ID) as string,
    }));

    return {
      success: true,
      data: callLogs
    };
  } catch (error) {
    return {
      success: false,
      ...handleAirtableError(error)
    };
  }
}
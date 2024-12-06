import { base } from './config';
import { AirtableResponse } from './types';
import { handleAirtableError } from './utils';
import { TABLE_IDS, CALL_LOG_FIELDS } from './field-mappings';
import { subDays, format, startOfDay, endOfDay } from 'date-fns';

export interface CampaignAnalytics {
  date: string;
  calls: number;
  connected: number;
  duration: number;
}

export async function getCampaignAnalytics(campaignId: string, days: number = 7): Promise<AirtableResponse<CampaignAnalytics[]>> {
  try {
    if (!base) {
      throw new Error('Airtable not configured');
    }

    // Calculate date range
    const endDate = endOfDay(new Date());
    const startDate = startOfDay(subDays(endDate, days - 1));
    
    // Create filter formula for date range and campaign
    const filterFormula = `AND(
      {campaignId} = '${campaignId}',
      IS_AFTER({dateTime}, '${format(startDate, "yyyy-MM-dd")}'),
      IS_BEFORE({dateTime}, '${format(endDate, "yyyy-MM-dd")}')
    )`;

    // Fetch call logs
    const records = await base(TABLE_IDS.CALL_LOGS).select({
      filterByFormula: filterFormula,
      sort: [{ field: CALL_LOG_FIELDS.DATE_TIME, direction: 'asc' }],
      fields: [
        CALL_LOG_FIELDS.DATE_TIME,
        CALL_LOG_FIELDS.CALL_STATUS,
        CALL_LOG_FIELDS.DURATION,
        CALL_LOG_FIELDS.VOICEMAIL_LEFT
      ]
    }).all();

    // Initialize analytics map with all dates
    const analyticsMap = new Map<string, CampaignAnalytics>();
    
    for (let i = 0; i < days; i++) {
      const date = format(subDays(endDate, i), 'yyyy-MM-dd');
      analyticsMap.set(date, {
        date,
        calls: 0,
        connected: 0,
        duration: 0
      });
    }

    // Aggregate call data
    records.forEach(record => {
      const dateTime = record.get(CALL_LOG_FIELDS.DATE_TIME) as string;
      if (!dateTime) return;

      const date = format(new Date(dateTime), 'yyyy-MM-dd');
      const current = analyticsMap.get(date) || {
        date,
        calls: 0,
        connected: 0,
        duration: 0
      };

      // Increment counters
      current.calls++;
      
      if (record.get(CALL_LOG_FIELDS.CALL_STATUS) === 'completed') {
        current.connected++;
      }
      
      current.duration += Number(record.get(CALL_LOG_FIELDS.DURATION)) || 0;
      
      analyticsMap.set(date, current);
    });

    // Convert map to sorted array
    const analytics = Array.from(analyticsMap.values())
      .sort((a, b) => a.date.localeCompare(b.date));

    return {
      success: true,
      data: analytics
    };
  } catch (error) {
    return {
      success: false,
      ...handleAirtableError(error)
    };
  }
}
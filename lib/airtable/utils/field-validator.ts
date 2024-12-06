import { Campaign } from '@/types';
import { CAMPAIGN_STATUS, CUSTOMER_STATUS } from '../field-mappings';

type CampaignStatusType = keyof typeof CAMPAIGN_STATUS;
type CustomerStatusType = keyof typeof CUSTOMER_STATUS;

export function validateCampaignStatus(status: string): status is CampaignStatusType {
  return Object.keys(CAMPAIGN_STATUS).includes(status as CampaignStatusType);
}

export function validateCustomerStatus(status: string): status is CustomerStatusType {
  return Object.keys(CUSTOMER_STATUS).includes(status as CustomerStatusType);
}

export function validateTimeFormat(time: string): boolean {
  return /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(time);
}

export function validateTimezone(timezone: string): boolean {
  try {
    Intl.DateTimeFormat(undefined, { timeZone: timezone });
    return true;
  } catch (error) {
    return false;
  }
}

export function validateCampaignFields(data: Partial<Campaign>): string[] {
  const errors: string[] = [];

  // Validate required fields
  if (!data.name || typeof data.name !== 'string' || !data.name.trim()) {
    errors.push('Name is required');
  }

  if (!data.clientId || (typeof data.clientId === 'string' && !data.clientId.trim())) {
    errors.push('Client ID is required');
  }

  if (!data.status) {
    errors.push('Status is required');
  }

  if (!data.startDate) {
    errors.push('Start date is required');
  }

  if (!data.endDate) {
    errors.push('End date is required');
  }

  // Validate status if provided
  if (data.status && !validateCampaignStatus(data.status)) {
    errors.push('Invalid campaign status');
  }

  // Validate dates if provided
  if (data.startDate && isNaN(Date.parse(data.startDate))) {
    errors.push('Invalid start date format');
  }

  if (data.endDate) {
    if (isNaN(Date.parse(data.endDate))) {
      errors.push('Invalid end date format');
    }
    if (data.startDate && new Date(data.endDate) < new Date(data.startDate)) {
      errors.push('End date must be after start date');
    }
  }

  // Validate numeric fields
  if (data.totalCallsSent !== undefined && (isNaN(data.totalCallsSent) || data.totalCallsSent < 0)) {
    errors.push('Total calls sent must be a non-negative number');
  }

  if (data.callsThisMonth !== undefined && (isNaN(data.callsThisMonth) || data.callsThisMonth < 0)) {
    errors.push('Calls this month must be a non-negative number');
  }

  if (data.totalCost !== undefined && (isNaN(data.totalCost) || data.totalCost < 0)) {
    errors.push('Total cost must be a non-negative number');
  }

  if (data.callsPickedUp !== undefined && (isNaN(data.callsPickedUp) || data.callsPickedUp < 0)) {
    errors.push('Calls picked up must be a non-negative number');
  }

  if (data.voiceMailsLeft !== undefined && (isNaN(data.voiceMailsLeft) || data.voiceMailsLeft < 0)) {
    errors.push('Voice mails left must be a non-negative number');
  }

  if (data.averageCallTime !== undefined && (isNaN(data.averageCallTime) || data.averageCallTime < 0)) {
    errors.push('Average call time must be a non-negative number');
  }

  return errors;
}
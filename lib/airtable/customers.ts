import { base } from './config';
import { AirtableResponse } from './types';
import { Customer } from '@/types';
import { handleAirtableError } from './utils';
import { CUSTOMER_FIELDS, CUSTOMER_STATUS } from './field-mappings';
import { mapCustomerRecord } from './utils/record-mapper';

type CustomerFieldKey = keyof typeof CUSTOMER_FIELDS;

export async function getCustomers(
  filters?: Partial<Record<CustomerFieldKey, any>>
): Promise<AirtableResponse<Customer[]>> {
  try {
    if (!base) {
      throw new Error('Airtable not configured');
    }

    const query = base(CUSTOMER_FIELDS.TABLE_ID).select({
      filterByFormula: filters ? Object.entries(filters)
        .map(([key, value]) => {
          const fieldKey = key as CustomerFieldKey;
          // Handle array values (like campaignId) differently
          if (Array.isArray(value)) {
            return `FIND("${value[0]}", {${CUSTOMER_FIELDS[fieldKey]}})`;
          }
          return `{${CUSTOMER_FIELDS[fieldKey]}} = "${value}"`;
        })
        .join(' AND ') : '',
    });

    const records = await query.all();

    // Map the records using the record mapper
    const customers: Customer[] = records.map(record => {
      const customer = mapCustomerRecord(record);
      
      // Log for debugging
      console.log('Mapped customer:', {
        id: customer.id,
        name: customer.name,
        phone: customer.phone,
        status: customer.status
      });
      
      return customer;
    });

    return {
      success: true,
      data: customers
    };
  } catch (error) {
    console.error('Error in getCustomers:', error);
    return {
      success: false,
      ...handleAirtableError(error)
    };
  }
}

export async function createCustomer(
  customer: Omit<Customer, 'id'>
): Promise<AirtableResponse<Customer>> {
  try {
    if (!base) {
      throw new Error('Airtable not configured');
    }

    console.log('Creating customer with data:', JSON.stringify(customer, null, 2));

    // Validate required fields
    if (!customer.name || !customer.phone) {
      console.error('Missing required fields:', {
        name: customer.name,
        phone: customer.phone
      });
      throw new Error('Name and phone are required');
    }

    // Format the fields using the correct field IDs
    const fields = {
      [CUSTOMER_FIELDS.name]: customer.name.trim(),
      [CUSTOMER_FIELDS.phone]: customer.phone.trim(),
      [CUSTOMER_FIELDS.status]: customer.status || CUSTOMER_STATUS.pending,
      [CUSTOMER_FIELDS.importTime]: customer.importTime ? new Date(customer.importTime).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      [CUSTOMER_FIELDS.notes]: customer.notes ? customer.notes.trim() : '',
      [CUSTOMER_FIELDS.lastContact]: customer.lastContact ? new Date(customer.lastContact).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      [CUSTOMER_FIELDS.campaignId]: customer.campaignId ? [customer.campaignId] : []
    };

    console.log('Formatted fields for Airtable:', JSON.stringify(fields, null, 2));

    // Create record using the array format as required by Airtable API
    const records = await base(CUSTOMER_FIELDS.TABLE_ID).create([{ fields }]);
    const record = records[0];

    if (!record) {
      throw new Error('Failed to create customer record');
    }

    console.log('Record created:', record.id);
    console.log('Record fields from Airtable:', JSON.stringify(record.fields, null, 2));

    // Use the record mapper to ensure consistent data structure
    const createdCustomer = mapCustomerRecord(record);

    return {
      success: true,
      data: createdCustomer
    };
  } catch (error) {
    console.error('Error in createCustomer:', error);
    return {
      success: false,
      ...handleAirtableError(error)
    };
  }
}

export async function updateCustomer(
  id: string,
  updates: Partial<Customer>
): Promise<AirtableResponse<Customer>> {
  try {
    if (!base) {
      throw new Error('Airtable not configured');
    }

    // Format the fields using the correct field IDs
    const fields = {
      ...(updates.name !== undefined && { [CUSTOMER_FIELDS.name]: updates.name }),
      ...(updates.phone !== undefined && { [CUSTOMER_FIELDS.phone]: updates.phone }),
      ...(updates.status !== undefined && { [CUSTOMER_FIELDS.status]: updates.status }),
      ...(updates.importTime !== undefined && { [CUSTOMER_FIELDS.importTime]: new Date(updates.importTime).toISOString().split('T')[0] }),
      ...(updates.notes !== undefined && { [CUSTOMER_FIELDS.notes]: updates.notes }),
      ...(updates.lastContact !== undefined && { [CUSTOMER_FIELDS.lastContact]: new Date(updates.lastContact).toISOString().split('T')[0] }),
      ...(updates.campaignId !== undefined && { [CUSTOMER_FIELDS.campaignId]: updates.campaignId ? [updates.campaignId] : [] })
    };

    // Update record using the array format as required by Airtable API
    const records = await base(CUSTOMER_FIELDS.TABLE_ID).update([
      { id, fields }
    ]);
    const record = records[0];

    if (!record) {
      throw new Error('Failed to update customer record');
    }

    const campaignIds = record.fields[CUSTOMER_FIELDS.campaignId];
    const updatedCustomer: Customer = {
      id: record.id,
      name: String(record.fields[CUSTOMER_FIELDS.name]),
      phone: String(record.fields[CUSTOMER_FIELDS.phone]),
      status: record.fields[CUSTOMER_FIELDS.status] as keyof typeof CUSTOMER_STATUS,
      importTime: String(record.fields[CUSTOMER_FIELDS.importTime]),
      notes: String(record.fields[CUSTOMER_FIELDS.notes] || ''),
      lastContact: String(record.fields[CUSTOMER_FIELDS.lastContact] || ''),
      campaignId: Array.isArray(campaignIds) && campaignIds.length > 0 ? campaignIds[0] : undefined
    };

    return {
      success: true,
      data: updatedCustomer
    };
  } catch (error) {
    return {
      success: false,
      ...handleAirtableError(error)
    };
  }
}
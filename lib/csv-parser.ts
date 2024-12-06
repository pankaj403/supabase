import { Customer } from '@/types';
import { validateAustralianPhone, formatPhoneNumber } from './utils';

interface ParseResult {
  success: boolean;
  data?: Omit<Customer, 'id'>[];
  errors?: string[];
}

export function parseCustomerCSV(file: File): Promise<ParseResult> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    const customers: Omit<Customer, 'id'>[] = [];
    const errors: string[] = [];

    reader.onload = (event) => {
      const text = event.target?.result as string;
      const lines = text.split('\n');
      
      // Get and validate headers
      const headers = lines[0].trim().split(',').map(h => h.trim());
      const requiredHeaders = ['name', 'phone'];
      
      const missingHeaders = requiredHeaders.filter(
        header => !headers.map(h => h.toLowerCase()).includes(header)
      );

      if (missingHeaders.length > 0) {
        resolve({
          success: false,
          errors: [`Missing required headers: ${missingHeaders.join(', ')}`]
        });
        return;
      }

      // Process each line
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        const values = line.split(',').map(v => v.trim());
        const name = values[headers.findIndex(h => h.toLowerCase() === 'name')];
        const phone = values[headers.findIndex(h => h.toLowerCase() === 'phone')];

        if (!name || !phone) {
          errors.push(`Line ${i + 1}: Missing required fields`);
          continue;
        }

        if (!validateAustralianPhone(phone)) {
          errors.push(
            `Line ${i + 1}: Invalid phone number format. Must be an Australian number (e.g., 0412345678 or +61412345678)`
          );
          continue;
        }

        customers.push({
          name,
          phone: formatPhoneNumber(phone),
          status: 'pending',
          lastContact: new Date().toISOString().split('T')[0],
          notes: '',
          importTime: new Date().toISOString()
        });
      }

      resolve({
        success: errors.length === 0,
        data: customers,
        errors: errors.length > 0 ? errors : undefined
      });
    };

    reader.readAsText(file);
  });
}

export function generateCustomerCSV(customers: Customer[]): string {
  const headers = ['Name', 'Phone', 'Status', 'Last Contact', 'Notes', 'Import Time'];
  const rows = customers.map(customer => [
    customer.name,
    customer.phone,
    customer.status,
    customer.lastContact,
    `"${customer.notes.replace(/"/g, '""')}"`,
    customer.importTime
  ]);

  return [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n');
}
import Airtable from 'airtable';

// Initialize Airtable with error handling
let base: ReturnType<typeof Airtable.prototype.base> | null = null;

try {
  const apiKey = process.env.NEXT_PUBLIC_AIRTABLE_API_KEY;
  const baseId = process.env.NEXT_PUBLIC_AIRTABLE_BASE_ID;

  if (!apiKey || !baseId) {
    console.warn('Missing Airtable credentials');
  } else {
    Airtable.configure({
      apiKey,
      endpointUrl: 'https://api.airtable.com',
    });
    base = Airtable.base(baseId);
  }
} catch (error) {
  console.error('Failed to initialize Airtable:', error);
}

export { base };
import { createClient } from '@supabase/supabase-js'

// Get the environment variables for Supabase URL and anon key
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
// Ensure both URL and key are defined
if (!supabaseUrl || !supabaseKey) {
  throw new Error('Supabase URL or API key is not defined in environment variables.')
}

// Initialize the Supabase client with environment variables
export const supabase = createClient(supabaseUrl, supabaseKey)

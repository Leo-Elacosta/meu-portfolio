import { createClient } from '@supabase/supabase-js';

// Fetching environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;

// Creating and exporting the Supabase client to use in our components
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
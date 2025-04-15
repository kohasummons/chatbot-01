import { createClient } from '@supabase/supabase-js';

// These values should come from environment variables in a production app
// For now, we'll use placeholder values since we'll be setting up the actual
// Supabase project as part of Step 1
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://your-supabase-url.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'your-supabase-anon-key';

// Create a single supabase client for the entire app
const supabase = createClient(supabaseUrl, supabaseKey);

export default supabase; 
import { createClient } from '@supabase/supabase-js';

console.log({ a: process.env.REACT_APP_SUPABASE_PROJECT_URL, b: process.env.REACT_APP_SUPABASE_API_KEY });
export const supabaseClient = createClient(
  process.env.REACT_APP_SUPABASE_PROJECT_URL,
  process.env.REACT_APP_SUPABASE_API_KEY,
);

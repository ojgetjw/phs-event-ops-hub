// Load Supabase config - can be overridden by environment variables or runtime config
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 
  (window.__CONFIG__?.SUPABASE_URL) || 
  'https://lnwqxssihtgbtcainemd.supabase.co';

const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 
  (window.__CONFIG__?.SUPABASE_ANON_KEY) || 
  'AhIzlfJDMpmqrak6hvUFAQ_HUuLIaDv';

export { SUPABASE_URL, SUPABASE_ANON_KEY };

const { createClient } = require('@supabase/supabase-js');

let supabase;

function getSupabase() {
  if (supabase) return supabase;

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY; // service role — server only

  if (!url || !key) {
    throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY env vars');
  }

  supabase = createClient(url, key, {
    auth: { persistSession: false },
  });

  console.log('✅ Supabase client initialized');
  return supabase;
}

module.exports = { getSupabase };

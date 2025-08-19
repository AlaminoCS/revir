const { createClient } = require('@supabase/supabase-js')

// Read from environment variables. Prefer SERVICE_ROLE for server operations,
// fall back to SUPABASE_KEY or SUPABASE_ANON_KEY if provided (not recommended for server).
const url = process.env.SUPABASE_URL || ''
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY || process.env.SUPABASE_ANON_KEY || ''

if (!url || !key) {
  console.warn('Supabase URL or service role key not set in env; Supabase client will be a noop. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY to enable.')
  // Export null so callers can check and fall back to mock DBs
  module.exports = null
} else {
  // Determine which key is being used (don't print the key itself)
  let keyType = 'unknown'
  if (process.env.SUPABASE_SERVICE_ROLE_KEY) keyType = 'service_role'
  else if (process.env.SUPABASE_KEY) keyType = 'supabase_key'
  else if (process.env.SUPABASE_ANON_KEY) keyType = 'anon'

  console.log(`Supabase client initialized using ${keyType} key (url: ${url})`)
  const supabase = createClient(url, key, { global: { headers: { 'x-my-app': 'revir-backend' } } })
  module.exports = supabase
}

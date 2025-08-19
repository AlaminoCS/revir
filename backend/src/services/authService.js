const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const db = require('../db/mockDb')
const supabase = require('../lib/supabase')

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change'
const TOKEN_EXP = '2h'

async function login(email, password) {
  // Demo-only quick auth: allow local demo login for development with a known credential.
  // This is intentionally simple and only used for authentication (not DB operations).
  const demoPassword = process.env.DEMO_PASSWORD || 'Revir123$'
  if (email === 'cleide@revir.com.br' && password === demoPassword) {
    const demoUser = { id: 'local-demo-cleide', email }
    const token = jwt.sign({ sub: demoUser.id, email: demoUser.email }, JWT_SECRET, { expiresIn: TOKEN_EXP })
    return { token, user: { id: demoUser.id, email: demoUser.email } }
  }
  // Prefer Supabase auth lookup when configured
  try {
  if (supabase && process.env.SUPABASE_URL && (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY || process.env.SUPABASE_ANON_KEY)) {
      // Supabase stores users in auth.users (internal). Use the admin service role key to fetch by email.
      const { data, error } = await supabase.from('auth.users').select('*').eq('email', email).limit(1).maybeSingle()
      if (error) {
        console.error('Supabase lookup error', error)
      }
      const user = data || null
      if (user && user.encrypted_password) {
        const match = await bcrypt.compare(password, user.encrypted_password)
        if (!match) return null
        const token = jwt.sign({ sub: user.id, email: user.email }, JWT_SECRET, { expiresIn: TOKEN_EXP })
        return { token, user: { id: user.id, email: user.email } }
      }
      // If supabase present but user not found, fallthrough to mock DB
    }
  } catch (err) {
    console.error('Supabase auth check failed', err)
  }

  // Fallback to mock DB for local dev
  const user = await db.findUserByEmail(email)
  if (!user || !user.passwordHash) return null
  const match = await bcrypt.compare(password, user.passwordHash)
  if (!match) return null
  const token = jwt.sign({ sub: user.id, email: user.email }, JWT_SECRET, { expiresIn: TOKEN_EXP })
  return { token, user: { id: user.id, email: user.email } }
}

module.exports = { login }

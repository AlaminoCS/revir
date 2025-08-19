const authService = require('../services/authService')

async function postLogin(req, res) {
  const { email, password } = req.body || {}
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' })

  try {
    const result = await authService.login(email, password)
    if (!result) return res.status(401).json({ error: 'Invalid credentials' })
    return res.json(result)
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'Server error' })
  }
}

module.exports = { postLogin }

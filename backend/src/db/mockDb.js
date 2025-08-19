// Mock database that mimics async DB operations
const users = [
  {
    id: '1',
    email: 'cleide@revir.com.br',
    // passwordHash will be initialized on server start if placeholder
    passwordHash: null
  }
]

module.exports = {
  findUserByEmail: async (email) => {
    // Simulate DB latency
    await new Promise(r => setTimeout(r, 50))
    return users.find(u => u.email === email) || null
  },
  getAllUsers: async () => {
    await new Promise(r => setTimeout(r, 50))
    return users.slice()
  },
  // helper to set password hash in mock DB
  setUserPasswordHash: (email, hash) => {
    const u = users.find(x => x.email === email)
    if (u) u.passwordHash = hash
  }
}

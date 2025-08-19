// purchases mock DB
let purchases = [
  { id: 1, supplierId: 1, type: 'venda', qty: 10, value: 1500.00, createdAt: new Date().toISOString() }
]

module.exports = {
  list: async () => { await new Promise(r=>setTimeout(r,40)); return purchases.slice() },
  get: async (id) => { await new Promise(r=>setTimeout(r,40)); return purchases.find(p => p.id === Number(id)) || null },
  create: async (data) => { await new Promise(r=>setTimeout(r,60)); const id = Date.now(); const item = { id, createdAt: new Date().toISOString(), ...data }; purchases.push(item); return item },
  update: async (id, data) => { await new Promise(r=>setTimeout(r,60)); purchases = purchases.map(p => p.id === Number(id) ? { ...p, ...data, id: Number(id) } : p); return purchases.find(p => p.id === Number(id)) },
  remove: async (id) => { await new Promise(r=>setTimeout(r,40)); const before = purchases.length; purchases = purchases.filter(p => p.id !== Number(id)); return before !== purchases.length }
}

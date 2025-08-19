// suppliers mock DB
let suppliers = [
  { id: 1, name: 'Acme Ltda', isCNPJ: true, doc: '12345678000195', phone: '(11) 98888-7777', email: 'contact@acme.com' }
]

module.exports = {
  list: async () => { await new Promise(r=>setTimeout(r,40)); return suppliers.slice() },
  get: async (id) => { await new Promise(r=>setTimeout(r,40)); return suppliers.find(s => s.id === Number(id)) || null },
  create: async (data) => { await new Promise(r=>setTimeout(r,60)); const id = Date.now(); const item = { id, ...data }; suppliers.push(item); return item },
  update: async (id, data) => { await new Promise(r=>setTimeout(r,60)); suppliers = suppliers.map(s => s.id === Number(id) ? { ...s, ...data, id: Number(id) } : s); return suppliers.find(s => s.id === Number(id)) },
  remove: async (id) => { await new Promise(r=>setTimeout(r,40)); const before = suppliers.length; suppliers = suppliers.filter(s => s.id !== Number(id)); return before !== suppliers.length }
}

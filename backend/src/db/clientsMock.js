// clients mock DB
let clients = [
  { id: 1, name: 'João Silva', phone: '(11) 99999-0000', dob: '1985-02-14', cpf: '12345678909' }
]

module.exports = {
  list: async () => { await new Promise(r=>setTimeout(r,40)); return clients.slice() },
  get: async (id) => { await new Promise(r=>setTimeout(r,40)); return clients.find(c => c.id === Number(id)) || null },
  create: async (data) => { await new Promise(r=>setTimeout(r,60)); const id = Date.now(); const item = { id, ...data }; clients.push(item); return item },
  update: async (id, data) => { await new Promise(r=>setTimeout(r,60)); clients = clients.map(c => c.id === Number(id) ? { ...c, ...data, id: Number(id) } : c); return clients.find(c => c.id === Number(id)) },
  remove: async (id) => { await new Promise(r=>setTimeout(r,40)); const before = clients.length; clients = clients.filter(c => c.id !== Number(id)); return before !== clients.length }
}

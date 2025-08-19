const supabase = require('../lib/supabase')

async function list(req, res){
  try {
    if (!supabase) return res.status(500).json({ error: 'Supabase not configured on server' })
    const { data, error } = await supabase.from('suppliers').select('*')
    if (error) return res.status(500).json({ error: 'DB error', details: error.message || error })
    return res.json({ items: data })
  } catch (err) {
    console.error('suppliers.list error', err)
    res.status(500).json({ error: 'Server error', details: err.message })
  }
}

async function get(req, res){
  try {
    const { id } = req.params
    if (!supabase) return res.status(500).json({ error: 'Supabase not configured on server' })
    const { data, error } = await supabase.from('suppliers').select('*').eq('id', id).maybeSingle()
    if (error) return res.status(500).json({ error: 'DB error', details: error.message || error })
    if (!data) return res.status(404).json({ error: 'Not found' })
    return res.json({ item: data })
  } catch (err) {
    console.error('suppliers.get error', err)
    res.status(500).json({ error: 'Server error', details: err.message })
  }
}

async function create(req, res){
  try {
    const body = req.body || {}
    if (!supabase) return res.status(500).json({ error: 'Supabase not configured on server' })
    if (typeof body.isCNPJ !== 'undefined') {
      body.doc_type = body.isCNPJ ? 'cnpj' : 'cpf'
      delete body.isCNPJ
    }
    const allowed = ['name', 'doc', 'doc_type', 'phone', 'email', 'notes']
    const payload = {}
    for (const k of allowed) if (k in body) payload[k] = body[k]
    const { data: item, error } = await supabase.from('suppliers').insert([payload]).select().single()
    if (error) return res.status(500).json({ error: 'DB error', details: error.message || error })
    return res.status(201).json({ item })
  } catch (err) {
    console.error('suppliers.create error', err)
    res.status(500).json({ error: 'Server error', details: err.message })
  }
}

async function update(req, res){
  try {
    const { id } = req.params
    const body = req.body || {}
    if (!supabase) return res.status(500).json({ error: 'Supabase not configured on server' })
    if (typeof body.isCNPJ !== 'undefined') {
      body.doc_type = body.isCNPJ ? 'cnpj' : 'cpf'
      delete body.isCNPJ
    }
    const allowed = ['name', 'doc', 'doc_type', 'phone', 'email', 'notes']
    const payload = {}
    for (const k of allowed) if (k in body) payload[k] = body[k]
    const { data: item, error } = await supabase.from('suppliers').update(payload).eq('id', id).select().maybeSingle()
    if (error) return res.status(500).json({ error: 'DB error', details: error.message || error })
    return res.json({ item })
  } catch (err) {
    console.error('suppliers.update error', err)
    res.status(500).json({ error: 'Server error', details: err.message })
  }
}

async function remove(req, res){
  try {
    const { id } = req.params
  if (!supabase) return res.status(500).json({ error: 'Supabase not configured on server' })
  const { error } = await supabase.from('suppliers').delete().eq('id', id)
  if (error) return res.status(500).json({ error: 'DB error', details: error.message || error })
  return res.json({ success: true })
  } catch (err) {
    console.error('suppliers.remove error', err)
    res.status(500).json({ error: 'Server error', details: err.message })
  }
}

module.exports = { list, get, create, update, remove }

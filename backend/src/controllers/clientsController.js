const supabase = require('../lib/supabase')

function ensureSupabase(res) {
  if (!supabase) {
    res.status(500).json({ error: 'Supabase not configured on server' })
    return false
  }
  return true
}

async function list(req, res){
  try {
    if (!ensureSupabase(res)) return
    const { data, error } = await supabase.from('clients').select('*')
    if (error) return res.status(500).json({ error: 'DB error', details: error.message || error })
    return res.json({ items: data })
  } catch (err) {
    console.error('clients.list error', err)
    res.status(500).json({ error: 'Server error', details: err.message })
  }
}

async function get(req, res){
  try {
    if (!ensureSupabase(res)) return
    const { id } = req.params
    const { data, error } = await supabase.from('clients').select('*').eq('id', id).maybeSingle()
    if (error) return res.status(500).json({ error: 'DB error', details: error.message || error })
    if (!data) return res.status(404).json({ error: 'Not found' })
    res.json({ item: data })
  } catch (err) {
    console.error('clients.get error', err)
    res.status(500).json({ error: 'Server error', details: err.message })
  }
}

async function getByCpf(req, res) {
  try {
    if (!ensureSupabase(res)) return
    const raw = req.params.cpf || ''
    const digits = String(raw).replace(/\D/g, '')

    // Try several equality checks using OR
    const exprParts = []
    if (raw) {
      exprParts.push(`cpf.eq.${raw}`)
    }
    if (digits) {
      exprParts.push(`cpf.eq.${digits}`)
    }
    const expr = exprParts.join(',')

    let data = null
    if (expr) {
      const { data: rows, error } = await supabase.from('clients').select('*').or(expr).limit(1)
      if (error) return res.status(500).json({ error: 'DB error', details: error.message || error })
      if (rows && rows.length) data = rows[0]
    }

    if (!data) return res.status(404).json({ error: 'Not found' })
    return res.json({ item: data })
  } catch (err) {
    console.error('clients.getByCpf error', err)
    return res.status(500).json({ error: 'Server error', details: err && err.message ? err.message : String(err) })
  }
}

async function create(req, res){
  try {
    if (!ensureSupabase(res)) return
    const data = req.body
    const { data: item, error } = await supabase.from('clients').insert([data]).select().single()
    if (error) return res.status(500).json({ error: 'DB error', details: error.message || error })
    res.status(201).json({ item })
  } catch (err) {
    console.error('clients.create error', err)
    res.status(500).json({ error: 'Server error', details: err.message })
  }
}

async function update(req, res){
  try {
    if (!ensureSupabase(res)) return
    const { id } = req.params
    const data = req.body
    const { data: item, error } = await supabase.from('clients').update(data).eq('id', id).select().maybeSingle()
    if (error) return res.status(500).json({ error: 'DB error', details: error.message || error })
    res.json({ item })
  } catch (err) {
    console.error('clients.update error', err)
    res.status(500).json({ error: 'Server error', details: err.message })
  }
}

async function remove(req, res){
  try {
    if (!ensureSupabase(res)) return
    const { id } = req.params
    const { error } = await supabase.from('clients').delete().eq('id', id)
    if (error) return res.status(500).json({ error: 'DB error', details: error.message || error })
    res.json({ success: true })
  } catch (err) {
    console.error('clients.remove error', err)
    res.status(500).json({ error: 'Server error', details: err.message })
  }
}

module.exports = { list, get, getByCpf, create, update, remove }

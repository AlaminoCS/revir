const supabase = require('../lib/supabase')

function ensureSupabase(res) {
  if (!supabase) {
    res.status(500).json({ error: 'Supabase not configured on server' })
    return false
  }
  return true
}

async function getProducts(req, res) {
  try {
    if (!ensureSupabase(res)) return
  const { data, error } = await supabase.from('products').select('*')
  if (error) return res.status(500).json({ error: 'DB error', details: error.message || error })
  // map DB 'title' -> API 'name' for frontend compatibility
  const items = (data || []).map(d => ({ ...d, name: d.title }))
  return res.json({ items })
  } catch (err) {
    console.error('products.getProducts error', err)
    return res.status(500).json({ error: 'Server error', details: err.message })
  }
}

async function getProduct(req, res) {
  try {
    if (!ensureSupabase(res)) return
    const { id } = req.params
  const { data, error } = await supabase.from('products').select('*').eq('id', id).maybeSingle()
  if (error) return res.status(500).json({ error: 'DB error', details: error.message || error })
  if (!data) return res.status(404).json({ error: 'Not found' })
  const item = { ...data, name: data.title }
  return res.json({ item })
  } catch (err) {
    console.error('products.getProduct error', err)
    return res.status(500).json({ error: 'Server error', details: err.message })
  }
}

async function createProduct(req, res) {
  try {
    if (!ensureSupabase(res)) return
    const body = req.body || {}
    // Accept API field 'name' but map to DB column 'title'
    const allowed = ['name', 'description', 'price', 'stock', 'images', 'notes']
    const payload = {}
    for (const k of allowed) {
      if (!(k in body)) continue
      if (k === 'name') payload['title'] = body[k]
      else payload[k] = body[k]
    }
    const { data, error } = await supabase.from('products').insert([payload]).select().single()
    if (error) return res.status(500).json({ error: 'DB error', details: error.message || error })
    const item = { ...data, name: data.title }
    return res.status(201).json({ item })
  } catch (err) {
    console.error('products.createProduct error', err)
    return res.status(500).json({ error: 'Server error', details: err.message })
  }
}

async function updateProduct(req, res) {
  try {
    if (!ensureSupabase(res)) return
    const { id } = req.params
    const body = req.body || {}
    const allowed = ['name', 'description', 'price', 'stock', 'images', 'notes']
    const payload = {}
    for (const k of allowed) {
      if (!(k in body)) continue
      if (k === 'name') payload['title'] = body[k]
      else payload[k] = body[k]
    }
    const { data, error } = await supabase.from('products').update(payload).eq('id', id).select().maybeSingle()
    if (error) return res.status(500).json({ error: 'DB error', details: error.message || error })
    const item = data ? { ...data, name: data.title } : null
    return res.json({ item })
  } catch (err) {
    console.error('products.updateProduct error', err)
    return res.status(500).json({ error: 'Server error', details: err.message })
  }
}

async function removeProduct(req, res) {
  try {
    if (!ensureSupabase(res)) return
    const { id } = req.params
    const { error } = await supabase.from('products').delete().eq('id', id)
    if (error) return res.status(500).json({ error: 'DB error', details: error.message || error })
    return res.json({ success: true })
  } catch (err) {
    console.error('products.removeProduct error', err)
    return res.status(500).json({ error: 'Server error', details: err.message })
  }
}

module.exports = { getProducts, getProduct, createProduct, updateProduct, removeProduct }

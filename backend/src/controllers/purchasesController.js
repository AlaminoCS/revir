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
    const { data, error } = await supabase.from('purchases').select('*')
    if (error) return res.status(500).json({ error: 'DB error', details: error.message || error })
    return res.json({ items: data })
  } catch (err) {
    console.error('purchases.list error', err)
    res.status(500).json({ error: 'Server error', details: err.message })
  }
}

async function get(req, res){
  try {
    if (!ensureSupabase(res)) return
    const { id } = req.params
    const { data, error } = await supabase.from('purchases').select('*').eq('id', id).maybeSingle()
    if (error) return res.status(500).json({ error: 'DB error', details: error.message || error })
    if (!data) return res.status(404).json({ error: 'Not found' })
    res.json({ item: data })
  } catch (err) {
    console.error('purchases.get error', err)
    res.status(500).json({ error: 'Server error', details: err.message })
  }
}

async function create(req, res){
  try {
  if (!ensureSupabase(res)) return
  const body = req.body || {}
  // map frontend camelCase to DB snake_case
  if (typeof body.supplierId !== 'undefined') { body.supplier_id = body.supplierId; delete body.supplierId }
  if (typeof body.clientId !== 'undefined') { body.client_id = body.clientId; delete body.clientId }
  if (typeof body.paymentMethod !== 'undefined') { body.payment_met = body.paymentMethod; delete body.paymentMethod }

  const allowed = ['supplier_id', 'client_id', 'type', 'qty', 'value', 'payment_met', 'notes']
  const payload = {}
  for (const k of allowed) if (k in body) payload[k] = body[k]

  const { data: item, error } = await supabase.from('purchases').insert([payload]).select().single()
  if (error) return res.status(500).json({ error: 'DB error', details: error.message || error })
  res.status(201).json({ item })
  } catch (err) {
    console.error('purchases.create error', err)
    res.status(500).json({ error: 'Server error', details: err.message })
  }
}

async function update(req, res){
  try {
  if (!ensureSupabase(res)) return
  const { id } = req.params
  const body = req.body || {}
  if (typeof body.supplierId !== 'undefined') { body.supplier_id = body.supplierId; delete body.supplierId }
  if (typeof body.clientId !== 'undefined') { body.client_id = body.clientId; delete body.clientId }
  if (typeof body.paymentMethod !== 'undefined') { body.payment_met = body.paymentMethod; delete body.paymentMethod }
  const allowed = ['supplier_id', 'client_id', 'type', 'qty', 'value', 'payment_met', 'notes']
  const payload = {}
  for (const k of allowed) if (k in body) payload[k] = body[k]
  const { data: item, error } = await supabase.from('purchases').update(payload).eq('id', id).select().maybeSingle()
  if (error) return res.status(500).json({ error: 'DB error', details: error.message || error })
  res.json({ item })
  } catch (err) {
    console.error('purchases.update error', err)
    res.status(500).json({ error: 'Server error', details: err.message })
  }
}

async function remove(req, res){
  try {
    if (!ensureSupabase(res)) return
    const { id } = req.params
    const { error } = await supabase.from('purchases').delete().eq('id', id)
    if (error) return res.status(500).json({ error: 'DB error', details: error.message || error })
    res.json({ success: true })
  } catch (err) {
    console.error('purchases.remove error', err)
    res.status(500).json({ error: 'Server error', details: err.message })
  }
}

module.exports = { list, get, create, update, remove }

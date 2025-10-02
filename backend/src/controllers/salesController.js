const supabase = require('../lib/supabase')

function ensureSupabase(res) {
  if (!supabase) {
    res.status(500).json({ error: 'Supabase not configured on server' })
    return false
  }
  return true
}

const validPaymentMethods = ['pix', 'dinheiro', 'crédito', 'débito', 'outro']

function normalizePaymentMethod(input) {
  if (!input) return null
  // remove accents and normalize
  const raw = String(input).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  // map common variants to canonical values
  if (raw === 'pix') return 'pix'
  if (raw === 'dinheiro') return 'dinheiro'
  if (raw === 'credito' || raw.includes('credito') || raw.includes('cartao') || raw.includes('cartao de credito')) return 'crédito'
  if (raw === 'debito' || raw.includes('debito') || raw.includes('cartao de debito')) return 'débito'
  return 'outro'
}

async function getSales(req, res) {
  try {
    if (!ensureSupabase(res)) return
    const { data, error } = await supabase
      .from('sales')
      .select(`
        *,
        client:clients(id, name, cpf)  -- join automático com tabela clients
      `)
      .order('created_at', { ascending: false })

    if (error) {
      return res.status(500).json({ error: 'DB error', details: error.message || error })
    }

    return res.json({ items: data || [] })
  } catch (err) {
    console.error('sales.getSales error', err)
    return res.status(500).json({ error: 'Server error', details: err?.message || String(err) })
  }
}

async function registerSale(req, res) {
  try {
    if (!ensureSupabase(res)) return
    const body = req.body || {}

    // Accept frontend shape: items ([{id, qty}]), paymentMethod, discount, clientId, cpf, clientInfoType, clientInfoValue
    const itemsInput = Array.isArray(body.items) ? body.items : null
  const paymentMethodRaw = body.paymentMethod || body.payment_method
  const paymentMethod = normalizePaymentMethod(paymentMethodRaw)
    const discount = Number(body.discount || 0)
    const clientId = body.clientId || null
    const clientCpf = body.cpf || null
    const clientInfoType = body.client_info_type || null
    const clientInfoValue = body.client_info_value || null
    let products = Array.isArray(body.products) ? body.products : null
    let total = typeof body.total === 'number' ? body.total : null

    // Validate payment method
    if (!validPaymentMethods.includes(String(paymentMethod || ''))) {
      return res.status(400).json({ error: 'Forma de pagamento inválida', validMethods: validPaymentMethods })
    }

    // If frontend sent items (ids), fetch product data
    if (itemsInput) {
      const ids = itemsInput.map(i => i.id)
      const { data: prods, error: prodErr } = await supabase
        .from('products')
        .select('id,title,price')
        .in('id', ids)

      if (prodErr) return res.status(500).json({ error: 'DB error', details: prodErr.message || prodErr })

      const prodMap = {}
      for (const p of prods || []) prodMap[p.id] = p

      products = itemsInput.map(it => {
        const p = prodMap[it.id]
        if (!p) return null
        return { id: p.id, name: p.title, price: Number(p.price || 0), qty: Number(it.qty || 0) }
      })
      if (products.some(p => p === null)) return res.status(400).json({ error: 'Invalid product id in items' })

      // compute total if not provided
      if (total === null) {
        total = products.reduce((s, p) => s + (p.price * (p.qty || 0)), 0) - discount
      }
    }

    if (!Array.isArray(products) || products.length === 0) {
      return res.status(400).json({ error: 'Lista de produtos inválida', details: 'O campo "products" deve ser um array não vazio (ou envie items)' })
    }

    if (typeof total !== 'number' || total <= 0) {
      return res.status(400).json({ error: 'Total inválido', details: 'O campo "total" deve ser um número positivo' })
    }

    // Insert sale into DB
    const payload = {
      products,
      total,
      payment_method: paymentMethod,
      client_id: clientId || null,
      client_cpf: clientCpf || null,
      client_info_type: clientInfoType || null,
      client_info_value: clientInfoValue || null,
      created_at: new Date().toISOString()
    }

    const { data, error } = await supabase.from('sales').insert([payload]).select().single()
    if (error) return res.status(500).json({ error: 'DB error', details: error.message || error })

    return res.status(201).json({ message: 'Venda registrada com sucesso', sale: data })
  } catch (err) {
    console.error('sales.registerSale error', err)
    return res.status(500).json({ error: 'Server error', details: err?.message || String(err) })
  }
}

module.exports = { getSales, registerSale }

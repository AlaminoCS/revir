export function generateAndPrintReport({ items = [], type = 'day', date, month, shopName = 'Revir, Moda sustentàvel' } = {}) {
  const formatCurrency = (n) => Number(n || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

  const rows = []
  if (type === 'day') {
    const target = date ? new Date(date + 'T00:00:00') : new Date()
    const start = new Date(target); start.setHours(0,0,0,0)
    const end = new Date(target); end.setHours(23,59,59,999)
    const sel = items.filter(it => {
      const d = it.createdAt ? new Date(it.createdAt) : it.created_at ? new Date(it.created_at) : new Date()
      return d >= start && d <= end
    })
    sel.forEach(s => {
      const d = s.createdAt ? new Date(s.createdAt) : s.created_at ? new Date(s.created_at) : new Date()
      rows.push({
        date: d.toLocaleString(),
        client: s.client?.name || s.client?.nome || s.client_cpf || '-',
        payment: s.payment_method || s.paymentMethod || '-',
        total: Number(s.total || s.amount || s.value || (Array.isArray(s.products) ? s.products.reduce((acc,p) => acc + (Number(p.price||0) * (Number(p.qty||0)||0)),0) : 0))
      })
    })
  } else {
    // month
    const [y, m] = (month||'').split('-').map(Number)
    const from = (!y || !m) ? new Date(0) : new Date(y, m-1, 1)
    const to = (!y || !m) ? new Date() : new Date(y, m, 0); to.setHours(23,59,59,999)
    const sel = items.filter(it => {
      const d = it.createdAt ? new Date(it.createdAt) : it.created_at ? new Date(it.created_at) : new Date()
      return d >= from && d <= to
    })
    const map = {}
    sel.forEach(s => { const key = (s.createdAt ? new Date(s.createdAt) : s.created_at ? new Date(s.created_at) : new Date()).toISOString().slice(0,10); map[key] = (map[key] || 0) + Number(s.total || 0) })
    Object.keys(map).sort().forEach(k => rows.push({ date: k, total: map[k] }))
  }

  const totalSum = rows.reduce((s, r) => s + (Number(r.total || 0)), 0)
  const salesCount = rows.length

  const win = window.open('', '_blank')
  if (!win) {
    alert('Não foi possível abrir nova janela. Permita popups.');
    return
  }

  const style = `
  <style>
    body{font-family: 'Times New Roman', Georgia, serif; color:#111; padding:24px}
    header{display:flex;justify-content:space-between;align-items:center}
    h1{font-size:20px;margin:0}
    .meta{font-size:12px;color:#555}
    table{width:100%;border-collapse:collapse;margin-top:18px}
    th,td{border-bottom:1px solid #ddd;padding:8px}
    th{background:#f7f7f7;text-align:left}
    td.number{text-align:right;font-variant-numeric:tabular-nums}
    tfoot td{font-weight:700;border-top:2px solid #222}
    .right{text-align:right}
  </style>
  `

  let title = shopName ? `${shopName} — ` : ''
  title += type === 'day' ? `Relatório diário ${date || ''}` : `Relatório mensal ${month || ''}`

  let html = `<!doctype html><html><head><meta charset="utf-8"><title>${title}</title>${style}</head><body>`
  html += `<header><div><h1>${shopName}</h1><div class="meta">${type === 'day' ? 'Relatório diário' : 'Relatório mensal'}</div></div><div class="meta">Gerado em: ${new Date().toLocaleString()}</div></header>`

  if (type === 'day') {
    html += `<div style="margin-top:12px">Data: <strong>${date}</strong> — Vendas: <strong>${salesCount}</strong></div>`
    html += `<table><thead><tr><th>Data</th><th>Cliente</th><th>Forma</th><th class="right">Total</th></tr></thead><tbody>`
    rows.forEach(r => {
      html += `<tr><td>${r.date}</td><td>${r.client}</td><td>${r.payment}</td><td class="number">${formatCurrency(r.total)}</td></tr>`
    })
    html += `</tbody><tfoot><tr><td colspan="3">Total do dia</td><td class="number">${formatCurrency(totalSum)}</td></tr></tfoot></table>`
  } else {
    html += `<div style="margin-top:12px">Mês: <strong>${month}</strong> — Dias com vendas: <strong>${salesCount}</strong></div>`
    html += `<table><thead><tr><th>Dia</th><th class="right">Total</th></tr></thead><tbody>`
    rows.forEach(r => { html += `<tr><td>${r.date}</td><td class="number">${formatCurrency(r.total)}</td></tr>` })
    html += `</tbody><tfoot><tr><td>Total do mês</td><td class="number">${formatCurrency(totalSum)}</td></tr></tfoot></table>`
  }

  html += `<script>setTimeout(()=>{window.print();},200);</script></body></html>`
  win.document.write(html)
  win.document.close()
}

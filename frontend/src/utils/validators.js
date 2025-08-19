// Validators and formatters for CPF, CNPJ and Phone (Brazilian formats)
export const MAX_LENGTH_CPF = 14 // 000.000.000-00
export const MAX_LENGTH_CNPJ = 18 // 00.000.000/0000-00
export const MAX_LENGTH_PHONE = 15 // (00) 00000-0000

export function unformat(v = '') {
  return String(v || '').replace(/\D/g, '')
}

// CPF
export function unformatCPF(v = '') { return unformat(v) }
export function formatCPF(v = '') {
  const d = unformatCPF(v).slice(0, 11)
  if (!d) return ''
  const part1 = d.slice(0,3)
  const part2 = d.slice(3,6)
  const part3 = d.slice(6,9)
  const part4 = d.slice(9,11)
  if (d.length <= 3) return part1
  if (d.length <= 6) return `${part1}.${part2}`
  if (d.length <= 9) return `${part1}.${part2}.${part3}`
  return `${part1}.${part2}.${part3}-${part4}`
}

export function isValidCPF(v = '') {
  const cpf = unformatCPF(v)
  if (!cpf || cpf.length !== 11) return false
  if (/^(\d)\1{10}$/.test(cpf)) return false

  const calc = (t) => {
    let sum = 0
    for (let i = 0; i < t - 1; i++) sum += Number(cpf[i]) * (t - i)
    const d = (sum * 10) % 11
    return d === 10 ? 0 : d
  }

  return calc(10) === Number(cpf[9]) && calc(11) === Number(cpf[10])
}

// CNPJ
export function unformatCNPJ(v = '') { return unformat(v) }
export function formatCNPJ(v = '') {
  const d = unformatCNPJ(v).slice(0,14)
  if (!d) return ''
  const p1 = d.slice(0,2)
  const p2 = d.slice(2,5)
  const p3 = d.slice(5,8)
  const p4 = d.slice(8,12)
  const p5 = d.slice(12,14)
  if (d.length <= 2) return p1
  if (d.length <= 5) return `${p1}.${p2}`
  if (d.length <= 8) return `${p1}.${p2}.${p3}`
  if (d.length <= 12) return `${p1}.${p2}.${p3}/${p4}`
  return `${p1}.${p2}.${p3}/${p4}-${p5}`
}

// Valid CNPJ algorithm
export function isValidCNPJ(v = '') {
  const cnpj = unformatCNPJ(v)
  if (!cnpj || cnpj.length !== 14) return false
  if (/^(\d)\1{13}$/.test(cnpj)) return false

  const calc = (cnpjStr, pos) => {
    let sum = 0
    let length = pos - 7
    for (let i = pos; i >= 1; i--) {
      sum += Number(cnpjStr[pos - i]) * length--
      if (length < 2) length = 9
    }
    const res = sum % 11
    return res < 2 ? 0 : 11 - res
  }

  const digit1 = calc(cnpj, 12)
  const digit2 = calc(cnpj + digit1, 13)
  return Number(cnpj[12]) === digit1 && Number(cnpj[13]) === digit2
}

// Phone (Brazil)
export function unformatPhone(v = '') { return unformat(v) }
export function formatPhone(v = '') {
  const d = unformatPhone(v).slice(0,11) // support 10 or 11 digits
  if (!d) return ''
  const dLen = d.length
  const area = d.slice(0,2)
  if (dLen <= 2) return `(${area}`
  if (dLen <= 6) return `(${area}) ${d.slice(2)}`
  if (dLen <= 10) return `(${area}) ${d.slice(2,6)}-${d.slice(6)}`
  // 11 digits
  return `(${area}) ${d.slice(2,7)}-${d.slice(7)}`
}

export function isValidPhone(v = '') {
  const p = unformatPhone(v)
  return p.length === 10 || p.length === 11
}

export default {
  MAX_LENGTH_CPF,
  MAX_LENGTH_CNPJ,
  MAX_LENGTH_PHONE,
  unformatCPF, formatCPF, isValidCPF,
  unformatCNPJ, formatCNPJ, isValidCNPJ,
  unformatPhone, formatPhone, isValidPhone
}

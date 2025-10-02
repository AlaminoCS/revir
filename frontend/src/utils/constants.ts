// API Configuration
export const API_BASE_URL = (import.meta as any).env.VITE_API_BASE_URL || 'http://localhost:4000'

// Navigation Items
export const navItems = [
    { to: '/home', label: 'Home' },
    { to: '/vendas', label: 'Vendas' },
    { to: '/relatorios', label: 'Relatórios' },
    { to: '/produtos', label: 'Produtos' },
    { to: '/clientes', label: 'Clientes' },
    { to: '/compras', label: 'Compras' },
    { to: '/fornecedores', label: 'Fornecedores' }
  ]
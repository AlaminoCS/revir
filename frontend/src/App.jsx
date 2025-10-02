import React, { useMemo } from 'react'
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { Header } from './components/header/Header'
import {
  Home,
  Login,
  Vendas,
  Relatorios,
  Produtos,
  Clientes,
  Compras,
  Fornecedores,
  NotFound,
  Cart
} from './pages'
import {
  AccessibilityProvider,
  AuthProvider,
  useAuth,
  CartProvider
} from './context'
import { useAccessibility } from './context/AccessibilityContext'
import { ThemeProvider, CssBaseline } from '@mui/material'
import { buildTheme } from './theme/muiTheme'
import PrivateRoute from './components/PrivateRoute'
import { ThemeModeProvider, useThemeMode } from './context/ThemeModeContext'
import { Footer } from './components/Footer'

// Lista de rotas privadas para melhor organização
const privateRoutes = [
  { path: '/home', element: <Home /> },
  { path: '/vendas', element: <Vendas /> },
  { path: '/relatorios', element: <Relatorios /> },
  { path: '/produtos', element: <Produtos /> },
  { path: '/clientes', element: <Clientes /> },
  { path: '/compras', element: <Compras /> },
  { path: '/fornecedores', element: <Fornecedores /> },
  { path: '/cart', element: <Cart /> }
]

function AppLayout() {
  const location = useLocation()
  const { isAuthenticated } = useAuth()
  
  // Páginas onde o header não deve aparecer
  const noHeaderPages = ['/']
  const shouldShowHeader = isAuthenticated && !noHeaderPages.includes(location.pathname)

  return (
    <>
      {shouldShowHeader && <Header />}
      <main style={{ 
        padding: '1.5rem',
        paddingTop: shouldShowHeader ? '6rem' : '1.5rem',
        minHeight: 'calc(100vh - 6rem)',
        backgroundColor: '#f5f5f5'
      }}>
        <Routes>
          <Route path="/" element={<Login />} />
          
          {privateRoutes.map((route) => (
            <Route 
              key={route.path} 
              path={route.path} 
              element={<PrivateRoute>{route.element}</PrivateRoute>} 
            />
          ))}
          
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
  <Footer />
    </>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AccessibilityProvider>
        {/* ThemeProvider must be inside AccessibilityProvider so it can react to scale changes */}
        <ThemeModeProvider>
          <ThemeInner>
            <AuthProvider>
              <CartProvider>
                <AppLayout />
              </CartProvider>
            </AuthProvider>
          </ThemeInner>
        </ThemeModeProvider>
      </AccessibilityProvider>
    </BrowserRouter>
  )
}

function ThemeInner({ children }) {
  // read scale from accessibility context and rebuild theme on change
  const { scale } = useAccessibility()
  const { mode } = useThemeMode()
  const theme = useMemo(() => buildTheme(scale || 1, mode || 'light'), [scale, mode])
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  )
}
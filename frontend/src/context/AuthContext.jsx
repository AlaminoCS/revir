import React, { createContext, useContext, useEffect, useState } from 'react'
import axios from 'axios'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => {
    try {
      return typeof window !== 'undefined' ? window.localStorage.getItem('revir_token') : null
    } catch (e) { return null }
  })

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
      try { window.localStorage.setItem('revir_token', token) } catch (e) {}
    } else {
      delete axios.defaults.headers.common['Authorization']
      try { window.localStorage.removeItem('revir_token') } catch (e) {}
    }
  }, [token])

  const login = (newToken) => setToken(newToken)
  const logout = () => setToken(null)

  const value = {
    token,
    isAuthenticated: !!token,
    login,
    logout
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  return useContext(AuthContext)
}



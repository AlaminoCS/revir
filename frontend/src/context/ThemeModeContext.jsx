import React, { createContext, useContext, useState, useEffect } from 'react'

const ThemeModeContext = createContext()

export function ThemeModeProvider({ children }) {
  const [mode, setMode] = useState(() => {
    try {
      return localStorage.getItem('revir_theme_mode') || 'light'
    } catch (e) {
      return 'light'
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem('revir_theme_mode', mode)
    } catch (e) {}
  }, [mode])

  const toggle = () => setMode((m) => (m === 'light' ? 'dark' : 'light'))

  return (
    <ThemeModeContext.Provider value={{ mode, toggle }}>
      {children}
    </ThemeModeContext.Provider>
  )
}

export function useThemeMode() {
  return useContext(ThemeModeContext)
}

export default ThemeModeContext

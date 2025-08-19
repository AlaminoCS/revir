import React, { createContext, useState, useContext, useEffect } from 'react'

const AccessibilityContext = createContext()

export function AccessibilityProvider({ children }) {
  const [scale, setScale] = useState(() => {
    const saved = typeof window !== 'undefined' && window.localStorage.getItem('revir_scale')
    return saved ? Number(saved) : 1
  })

  useEffect(() => {
    if (typeof window !== 'undefined') window.localStorage.setItem('revir_scale', String(scale))
  }, [scale])

  const increase = () => setScale(s => Math.min(1.5, +(s + 0.1).toFixed(2)))
  const decrease = () => setScale(s => Math.max(0.8, +(s - 0.1).toFixed(2)))
  const reset = () => setScale(1)

  return (
    <AccessibilityContext.Provider value={{ scale, increase, decrease, reset }}>
      {children}
    </AccessibilityContext.Provider>
  )
}

export function useAccessibility() {
  return useContext(AccessibilityContext)
}

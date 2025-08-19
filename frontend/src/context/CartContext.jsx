// src/context/CartContext.jsx

import React, { createContext, useContext, useState } from 'react'
import axios from 'axios'

// Crie o contexto
const CartContext = createContext(null)

// Provider que envolve a aplicação
export function CartProvider({ children }) {
  const [items, setItems] = useState([]) // { id, title, price, qty, image }
  const [cpf, setCpf] = useState('')
  const [clientId, setClientId] = useState(null)
  const [paymentMethod, setPaymentMethod] = useState('pix')
  const [discount, setDiscount] = useState(0)
  const [discountType, setDiscountType] = useState('value') // 'value' ou 'percent'

  const addItem = (product, qty = 1) => {
    setItems((prev) => {
      const found = prev.find((p) => p.id === product.id)
      if (found) {
        return prev.map((p) =>
          p.id === product.id ? { ...p, qty: p.qty + qty } : p
        )
      }
      return [
        ...prev,
        {
          id: product.id,
          title: product.title || product.name || 'Produto',
          price: Number(product.price || 0),
          qty,
          image: product.image || product.imageUrl || '',
        },
      ]
    })
  }

  const updateQty = (id, qty) => {
    const n = Math.max(0, Number(qty) || 0)
    if (n === 0) {
      return removeItem(id)
    }
    setItems((prev) => prev.map((p) => (p.id === id ? { ...p, qty: n } : p)))
  }

  const removeItem = (id) => {
    setItems((prev) => prev.filter((p) => p.id !== id))
  }

  const clearCart = () => {
    setItems([])
    setCpf('')
    setClientId(null)
    setPaymentMethod('pix')
    setDiscount(0)
    setDiscountType('value')
  }

  const subtotal = () => {
    return items.reduce(
      (s, it) => s + (Number(it.price || 0) * Number(it.qty || 0)),
      0
    )
  }

  const total = () => {
    const sub = subtotal()
    let discountValue = Number(discount) || 0
    if (discountType === 'percent') {
      discountValue = (sub * discountValue) / 100
    }
    return Math.max(0, sub - discountValue)
  }

  const checkout = async () => {
    const sub = subtotal()
    const discountValue = discountType === 'percent'
      ? (sub * (Number(discount) || 0)) / 100
      : Number(discount) || 0

    const payload = {
      items: items.map((i) => ({ id: i.id, qty: Number(i.qty || 0) })),
      payment_method: paymentMethod,
      discount: discountValue,
      client_cpf: cpf || null,
      client_id: clientId || null,
    }

    const token = window.localStorage.getItem('revir_token')
    const res = await axios.post('http://localhost:4000/sales', payload, {
      headers: { Authorization: token ? `Bearer ${token}` : '' },
    })
    return res.data
  }

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        updateQty,
        removeItem,
        clearCart,
        cpf,
        setCpf,
        clientId,
        setClientId,
        paymentMethod,
        setPaymentMethod,
        discount,
        setDiscount,
        discountType,
        setDiscountType,
        subtotal,
        total,
        checkout,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

// Hook personalizado para usar o contexto
export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}
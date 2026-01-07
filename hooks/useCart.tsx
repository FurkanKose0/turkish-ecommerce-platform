'use client'

import { createContext, useContext, ReactNode } from 'react'

interface CartContextType {
  // Basit cart context - gerçek veri API'den çekiliyor
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
  return (
    <CartContext.Provider value={{}}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}

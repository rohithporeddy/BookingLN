import { createContext, useContext, useState } from 'react'

const CartContext = createContext(null)

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([])

  function addToCart(product, litres) {
    setCartItems(prev => {
      const existing = prev.find(item => item.product.id === product.id)
      if (existing) {
        // Accumulate litres if product already in cart
        return prev.map(item =>
          item.product.id === product.id
            ? { ...item, litres: parseFloat((item.litres + litres).toFixed(2)) }
            : item
        )
      }
      return [...prev, { product, litres }]
    })
  }

  function removeFromCart(productId) {
    setCartItems(prev => prev.filter(item => item.product.id !== productId))
  }

  function clearCart() {
    setCartItems([])
  }

  return (
    <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, clearCart }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  return useContext(CartContext)
}

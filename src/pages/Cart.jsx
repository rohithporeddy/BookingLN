import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import Navbar from '../components/Navbar'
import OrderModal from '../components/OrderModal'

export default function Cart() {
  const navigate = useNavigate()
  const { cartItems, removeFromCart, clearCart } = useCart()
  const [showModal, setShowModal] = useState(false)
  const [placedOrder, setPlacedOrder] = useState(null)

  // Protect route
  const user = JSON.parse(localStorage.getItem('user') || 'null')
  if (!user) {
    navigate('/login', { replace: true })
    return null
  }

  const total = cartItems.reduce(
    (sum, item) => sum + item.product.price_per_litre * item.litres,
    0
  )

  function handleOrderSuccess(order) {
    setShowModal(false)
    setPlacedOrder(order)
    console.log('Order placed successfully:', order)
  }

  // --- Success screen after order placed ---
  if (placedOrder) {
    return (
      <div style={{ minHeight: '100vh', background: '#080a14' }}>
        <Navbar />
        <main style={{ maxWidth: '500px', margin: '0 auto', padding: '80px 24px', textAlign: 'center' }}>
          <div style={{
            background: '#0f1120', border: '1px solid rgba(34,197,94,0.3)',
            borderRadius: '24px', padding: '48px 32px',
          }}>
            <p style={{ fontSize: '52px', margin: '0 0 16px' }}>✅</p>
            <h2 style={{ color: '#ffffff', fontSize: '22px', fontWeight: '800', margin: '0 0 8px' }}>
              Order Placed!
            </h2>
            <p style={{ color: '#4b5563', fontSize: '14px', margin: '0 0 24px' }}>
              Your order <span style={{ color: '#60a5fa', fontWeight: '600' }}>#{placedOrder.id.slice(0, 8).toUpperCase()}</span> has been received.
            </p>
            <button
              onClick={() => navigate('/home')}
              style={{
                background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
                border: 'none', borderRadius: '12px', color: '#fff',
                fontSize: '14px', fontWeight: '700', padding: '13px 32px',
                cursor: 'pointer', letterSpacing: '1px', textTransform: 'uppercase',
              }}
            >
              Back to Home
            </button>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: '#080a14' }}>
      <Navbar />

      <main style={{ maxWidth: '700px', margin: '0 auto', padding: '48px 24px' }}>

        <h1 style={{ color: '#ffffff', fontSize: '32px', fontWeight: '900', letterSpacing: '-0.5px', margin: '0 0 8px' }}>
          Cart
        </h1>
        <p style={{ color: '#4b5563', fontSize: '14px', margin: '0 0 40px' }}>
          {cartItems.length === 0
            ? 'Your cart is empty.'
            : `${cartItems.length} item${cartItems.length > 1 ? 's' : ''} in your cart`}
        </p>

        {/* Empty state */}
        {cartItems.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <p style={{ color: '#374151', fontSize: '48px', margin: '0 0 16px' }}>🛒</p>
            <p style={{ color: '#4b5563', fontSize: '15px', margin: '0 0 24px' }}>No items added yet</p>
            <button
              onClick={() => navigate('/products')}
              style={{
                background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
                border: 'none', borderRadius: '12px', color: '#fff',
                fontSize: '14px', fontWeight: '700', padding: '12px 28px',
                cursor: 'pointer', letterSpacing: '1px', textTransform: 'uppercase',
              }}
            >
              Browse Products
            </button>
          </div>
        )}

        {/* Cart items */}
        {cartItems.length > 0 && (
          <>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
              {cartItems.map(({ product, litres }) => (
                <div
                  key={product.id}
                  style={{
                    background: '#0f1120', border: '1px solid #1e2236',
                    borderRadius: '16px', padding: '20px 24px',
                    display: 'flex', alignItems: 'center', gap: '16px',
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <p style={{ color: '#ffffff', fontSize: '15px', fontWeight: '700', margin: '0 0 4px' }}>
                      {product.name}
                    </p>
                    <p style={{ color: '#6b7280', fontSize: '13px', margin: 0 }}>
                      ₹{product.price_per_litre}/L × {litres}L
                    </p>
                  </div>
                  <span style={{ color: '#a78bfa', fontSize: '16px', fontWeight: '800', flexShrink: 0 }}>
                    ₹{(product.price_per_litre * litres).toFixed(2)}
                  </span>
                  <button
                    onClick={() => removeFromCart(product.id)}
                    title="Remove"
                    style={{
                      background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)',
                      borderRadius: '8px', color: '#f87171', fontSize: '16px',
                      width: '34px', height: '34px', cursor: 'pointer', flexShrink: 0,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>

            {/* Total section */}
            <div style={{
              background: '#0f1120', border: '1px solid #1e2236',
              borderRadius: '16px', padding: '20px 24px', marginBottom: '16px',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <span style={{ color: '#6b7280', fontSize: '14px' }}>Subtotal</span>
                <span style={{ color: '#ffffff', fontSize: '14px' }}>₹{total.toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <span style={{ color: '#6b7280', fontSize: '14px' }}>Delivery</span>
                <span style={{ color: '#4b5563', fontSize: '14px' }}>TBD</span>
              </div>
              <div style={{ width: '100%', height: '1px', background: '#1e2236', margin: '12px 0' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#ffffff', fontSize: '16px', fontWeight: '700' }}>Total</span>
                <span style={{ color: '#60a5fa', fontSize: '22px', fontWeight: '900' }}>₹{total.toFixed(2)}</span>
              </div>
            </div>

            <p style={{ textAlign: 'right', margin: '0 0 20px' }}>
              <span
                onClick={clearCart}
                style={{ color: '#374151', fontSize: '13px', cursor: 'pointer', textDecoration: 'underline' }}
              >
                Clear cart
              </span>
            </p>

            {/* Place Order — opens the delivery modal */}
            <button
              onClick={() => setShowModal(true)}
              style={{
                width: '100%', padding: '16px',
                background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                border: 'none', borderRadius: '14px', color: '#ffffff',
                fontSize: '15px', fontWeight: '700', letterSpacing: '1.5px',
                textTransform: 'uppercase', cursor: 'pointer',
              }}
            >
              Place Order
            </button>
          </>
        )}

      </main>

      {/* Delivery details modal */}
      {showModal && (
        <OrderModal
          total={total}
          onClose={() => setShowModal(false)}
          onSuccess={handleOrderSuccess}
        />
      )}
    </div>
  )
}

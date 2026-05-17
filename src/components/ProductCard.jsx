import { useState } from 'react'
import { useCart } from '../context/CartContext'

export default function ProductCard({ product }) {
  const [litres, setLitres] = useState(1)
  const [added, setAdded] = useState(false)
  const { addToCart } = useCart()

  function handleLitresChange(e) {
    const val = parseFloat(e.target.value)
    setLitres(val < 1 ? 1 : val)
  }

  function handleAddToCart() {
    if (added) return
    addToCart(product, litres)
    // Trigger animation — reset after 1.5s
    setAdded(true)
    setTimeout(() => setAdded(false), 1500)
  }

  const subtotal = (product.price_per_litre * litres).toFixed(2)

  return (
    <div style={{
      background: '#0f1120',
      border: `1px solid ${added ? 'rgba(34,197,94,0.4)' : '#1e2236'}`,
      borderRadius: '20px',
      padding: '24px',
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
      transition: 'border-color 0.3s',
    }}>

      {/* Product name */}
      <h2 style={{ color: '#ffffff', fontSize: '18px', fontWeight: '700', margin: 0, letterSpacing: '-0.2px' }}>
        {product.name}
      </h2>

      {/* Description */}
      <p style={{ color: '#6b7280', fontSize: '14px', margin: 0, lineHeight: '1.5' }}>
        {product.description}
      </p>

      {/* Price */}
      <div style={{ display: 'inline-flex', alignItems: 'baseline', gap: '4px' }}>
        <span style={{ color: '#60a5fa', fontSize: '22px', fontWeight: '800' }}>
          ₹{product.price_per_litre}
        </span>
        <span style={{ color: '#4b5563', fontSize: '13px' }}>/litre</span>
      </div>

      {/* Litres input */}
      <div>
        <label style={{ display: 'block', color: '#9ca3af', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>
          Litres
        </label>
        <input
          type="number"
          min="1"
          step="0.5"
          value={litres}
          onChange={handleLitresChange}
          className="phone-input"
          style={{
            width: '100%',
            background: '#12141e',
            border: '1px solid #1e2236',
            borderRadius: '10px',
            color: '#ffffff',
            fontSize: '15px',
            padding: '10px 14px',
            outline: 'none',
            boxSizing: 'border-box',
          }}
        />
      </div>

      {/* Total preview */}
      <p style={{ color: '#4b5563', fontSize: '13px', margin: 0 }}>
        Total:{' '}
        <span style={{ color: '#a78bfa', fontWeight: '700' }}>₹{subtotal}</span>
      </p>

      {/* Add to Cart button with animation */}
      <button
        onClick={handleAddToCart}
        className={added ? 'btn-added' : 'btn-cart'}
        style={{
          width: '100%',
          padding: '13px',
          border: 'none',
          borderRadius: '12px',
          color: '#ffffff',
          fontSize: '14px',
          fontWeight: '700',
          letterSpacing: '1px',
          textTransform: 'uppercase',
          cursor: added ? 'default' : 'pointer',
          marginTop: 'auto',
          background: added
            ? 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)'
            : 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
          transition: 'background 0.3s',
        }}
      >
        {added ? '✓ Added' : 'Add to Cart'}
      </button>
    </div>
  )
}

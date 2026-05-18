import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import ProductCard from '../components/ProductCard'
import Navbar from '../components/Navbar'

export default function Products() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    fetchProducts()
  }, [])

  async function fetchProducts() {
    setLoading(true)
    setError(null)

    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('is_active', true)

    if (error) {
      setError(error.message)
    } else {
      setProducts(data || [])
    }
    setLoading(false)
  }

  return (
    <div style={{ minHeight: '100vh', background: '#080a14' }}>

      <Navbar />

      {/* Page content */}
      <main style={{ maxWidth: '1100px', margin: '0 auto', padding: '40px 24px' }}>

        {/* Heading */}
        <h1 style={{
          color: '#ffffff',
          fontSize: '32px',
          fontWeight: '900',
          letterSpacing: '-0.5px',
          margin: '0 0 8px',
        }}>
          Products
        </h1>
        <p style={{ color: '#4b5563', fontSize: '14px', margin: '0 0 40px' }}>
          Select a product and quantity to add to your cart
        </p>

        {/* Loading state */}
        {loading && (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <div style={{
              width: '40px',
              height: '40px',
              border: '3px solid #1e2236',
              borderTop: '3px solid #3b82f6',
              borderRadius: '50%',
              margin: '0 auto 16px',
              animation: 'spin 0.8s linear infinite',
            }} />
            <p style={{ color: '#4b5563', fontSize: '14px' }}>Loading products...</p>
          </div>
        )}

        {/* Error state */}
        {!loading && error && (
          <div style={{
            background: 'rgba(239,68,68,0.1)',
            border: '1px solid rgba(239,68,68,0.3)',
            borderRadius: '14px',
            padding: '20px 24px',
            textAlign: 'center',
          }}>
            <p style={{ color: '#f87171', fontSize: '14px', margin: '0 0 12px' }}>
              Failed to load products: {error}
            </p>
            <button
              onClick={fetchProducts}
              style={{
                background: 'transparent',
                border: '1px solid #374151',
                borderRadius: '8px',
                color: '#9ca3af',
                fontSize: '13px',
                padding: '8px 16px',
                cursor: 'pointer',
              }}
            >
              Try again
            </button>
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && products.length === 0 && (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <p style={{ color: '#4b5563', fontSize: '16px' }}>No products available</p>
          </div>
        )}

        {/* Product grid */}
        {!loading && !error && products.length > 0 && (
          <>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: '20px',
              marginBottom: '40px',
            }}>
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            {/* Proceed to Buy */}
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button
                onClick={() => navigate('/cart')}
                style={{
                  padding: '14px 36px',
                  background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                  border: 'none',
                  borderRadius: '14px',
                  color: '#ffffff',
                  fontSize: '15px',
                  fontWeight: '700',
                  letterSpacing: '1px',
                  textTransform: 'uppercase',
                  cursor: 'pointer',
                }}
              >
                Proceed to Buy →
              </button>
            </div>
          </>
        )}

      </main>

      {/* Spinner keyframe */}
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}

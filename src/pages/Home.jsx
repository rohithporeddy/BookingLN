import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import Navbar from '../components/Navbar'

function StatCard({ label, value, sub, accent }) {
  return (
    <div style={{
      background: '#0f1120', border: '1px solid #1e2236',
      borderRadius: '20px', padding: '28px 24px',
      display: 'flex', flexDirection: 'column', gap: '8px',
    }}>
      <p style={{ color: '#4b5563', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1.2px', margin: 0 }}>
        {label}
      </p>
      <p style={{ color: accent || '#ffffff', fontSize: '36px', fontWeight: '900', margin: 0, letterSpacing: '-1px', lineHeight: 1 }}>
        {value}
      </p>
      <p style={{ color: '#374151', fontSize: '12px', margin: 0 }}>{sub}</p>
    </div>
  )
}

export default function Home() {
  const navigate = useNavigate()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  const user = JSON.parse(localStorage.getItem('user') || 'null')
  if (!user) {
    navigate('/login', { replace: true })
    return null
  }

  useEffect(() => { fetchOrders() }, [])

  async function fetchOrders() {
    setLoading(true)
    const { data } = await supabase
      .from('orders')
      .select('total_amount, status')
      .eq('phone', user.phone)
    setOrders(data || [])
    setLoading(false)
  }

  const total      = orders.length
  const pending    = orders.filter(o => o.status === 'placed' || o.status === 'confirmed').length
  const delivered  = orders.filter(o => o.status === 'delivered').length
  const totalSpent = orders.reduce((sum, o) => sum + parseFloat(o.total_amount || 0), 0)

  const stats = [
    { label: 'Total Orders',       value: loading ? '…' : total,                          sub: 'All time',              accent: '#ffffff'  },
    { label: 'Pending',            value: loading ? '…' : pending,                        sub: 'Placed or confirmed',   accent: '#60a5fa'  },
    { label: 'Delivered',          value: loading ? '…' : delivered,                      sub: 'Successfully delivered', accent: '#4ade80' },
    { label: 'Total Spent',        value: loading ? '…' : `₹${totalSpent.toFixed(0)}`,   sub: 'Across all orders',     accent: '#a78bfa'  },
  ]

  return (
    <div style={{ minHeight: '100vh', background: '#080a14' }}>
      <Navbar />

      <main style={{ maxWidth: '900px', margin: '0 auto', padding: '48px 24px' }}>

        {/* Heading */}
        <h1 style={{ color: '#ffffff', fontSize: '32px', fontWeight: '900', letterSpacing: '-0.5px', margin: '0 0 6px' }}>
          Welcome back{user.name ? `, ${user.name}` : user.phone ? `, +91 ${user.phone}` : ''}
        </h1>
        <p style={{ color: '#4b5563', fontSize: '14px', margin: '0 0 40px' }}>
          Here's your account at a glance.
        </p>

        {/* Role badge */}
        <div style={{ marginBottom: '32px' }}>
          <span style={{
            background: 'rgba(59,130,246,0.15)', border: '1px solid rgba(59,130,246,0.3)',
            color: '#60a5fa', fontSize: '11px', fontWeight: '600',
            textTransform: 'uppercase', letterSpacing: '1px',
            padding: '5px 12px', borderRadius: '999px',
          }}>
            {user.role}
          </span>
        </div>

        {/* Analytics grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
          gap: '16px',
          marginBottom: '40px',
        }}>
          {stats.map(s => (
            <StatCard key={s.label} {...s} />
          ))}
        </div>

        {/* Quick actions */}
        <div style={{
          background: '#0f1120', border: '1px solid #1e2236',
          borderRadius: '20px', padding: '28px 32px',
          display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div>
            <p style={{ color: '#ffffff', fontSize: '15px', fontWeight: '700', margin: '0 0 4px' }}>Ready to order?</p>
            <p style={{ color: '#4b5563', fontSize: '13px', margin: 0 }}>Browse products or check your order history.</p>
          </div>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button
              onClick={() => navigate('/products')}
              style={{
                background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
                border: 'none', borderRadius: '10px', color: '#fff',
                fontSize: '13px', fontWeight: '700', padding: '10px 20px',
                cursor: 'pointer', letterSpacing: '0.5px',
              }}
            >
              Browse Products
            </button>
            <button
              onClick={() => navigate('/orders')}
              style={{
                background: 'transparent', border: '1px solid #1e2236',
                borderRadius: '10px', color: '#9ca3af',
                fontSize: '13px', fontWeight: '600', padding: '10px 20px',
                cursor: 'pointer',
              }}
            >
              View Orders
            </button>
          </div>
        </div>

      </main>
    </div>
  )
}

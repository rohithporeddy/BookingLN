import { useEffect, useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import Navbar from '../components/Navbar'

// ── helpers ──────────────────────────────────────────────────────────────────

function daysAgo(n) {
  const d = new Date()
  d.setDate(d.getDate() - n)
  d.setHours(0, 0, 0, 0)
  return d
}

function fmtDate(iso) {
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
}

function groupByDay(orders) {
  const map = {}
  orders.forEach(o => {
    const day = o.created_at.slice(0, 10)
    if (!map[day]) map[day] = { day, revenue: 0, count: 0 }
    map[day].revenue += parseFloat(o.total_amount || 0)
    map[day].count++
  })
  return Object.values(map).sort((a, b) => a.day.localeCompare(b.day))
}

// ── sub-components ────────────────────────────────────────────────────────────

function KPICard({ label, value, sub, accent }) {
  return (
    <div style={{
      background: '#0f1120', border: '1px solid #1e2236', borderRadius: '18px',
      padding: '24px 20px', display: 'flex', flexDirection: 'column', gap: '6px',
    }}>
      <p style={{ color: '#4b5563', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1.2px', margin: 0 }}>{label}</p>
      <p style={{ color: accent || '#ffffff', fontSize: '32px', fontWeight: '900', margin: 0, letterSpacing: '-1px', lineHeight: 1 }}>{value}</p>
      <p style={{ color: '#374151', fontSize: '12px', margin: 0 }}>{sub}</p>
    </div>
  )
}

function BarChart({ rows, height = 160 }) {
  if (!rows.length) return <p style={{ color: '#374151', fontSize: '13px', padding: '20px 0' }}>No data</p>
  const max = Math.max(...rows.map(r => r.value), 1)
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: '6px', height: `${height}px`, paddingTop: '8px' }}>
      {rows.map(r => (
        <div key={r.label} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', gap: '6px', height: '100%', minWidth: 0 }}>
          <span style={{ color: '#4b5563', fontSize: '10px' }}>{r.value > 0 ? r.display : ''}</span>
          <div style={{
            width: '100%', borderRadius: '4px 4px 0 0',
            height: `${Math.max((r.value / max) * (height - 40), r.value > 0 ? 4 : 0)}px`,
            background: r.color || 'linear-gradient(180deg,#3b82f6,#1d4ed8)',
            transition: 'height 0.4s ease',
          }} />
          <span style={{ color: '#374151', fontSize: '10px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', width: '100%', textAlign: 'center' }}>
            {r.label}
          </span>
        </div>
      ))}
    </div>
  )
}

function HBar({ label, value, max, color, display }) {
  const pct = max > 0 ? (value / max) * 100 : 0
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
      <span style={{ color: '#9ca3af', fontSize: '13px', width: '90px', flexShrink: 0, textTransform: 'capitalize' }}>{label}</span>
      <div style={{ flex: 1, background: '#1a1c2e', borderRadius: '999px', height: '8px', overflow: 'hidden' }}>
        <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: '999px', transition: 'width 0.5s ease' }} />
      </div>
      <span style={{ color: '#ffffff', fontSize: '13px', fontWeight: '700', width: '60px', textAlign: 'right', flexShrink: 0 }}>{display}</span>
    </div>
  )
}

// ── main page ─────────────────────────────────────────────────────────────────

const PRESETS = [
  { label: '7 days',  days: 7  },
  { label: '30 days', days: 30 },
  { label: '90 days', days: 90 },
]

const STATUS_COLORS = {
  placed:    '#60a5fa',
  confirmed: '#a78bfa',
  delivered: '#4ade80',
  cancelled: '#f87171',
}

const inputStyle = {
  background: '#12141e', border: '1px solid #1e2236',
  borderRadius: '10px', color: '#ffffff', fontSize: '13px',
  padding: '8px 12px', outline: 'none',
}

export default function Analytics() {
  const navigate = useNavigate()
  const [orders, setOrders]   = useState([])
  const [loading, setLoading] = useState(true)
  const [preset, setPreset]   = useState(30)
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo]     = useState('')

  const user = JSON.parse(localStorage.getItem('user') || 'null')
  if (!user || user.role !== 'admin') {
    navigate('/home', { replace: true })
    return null
  }

  useEffect(() => { fetchData() }, [preset, dateFrom, dateTo])

  async function fetchData() {
    setLoading(true)
    const start = dateFrom ? new Date(dateFrom) : daysAgo(preset)
    const end   = dateTo   ? new Date(dateTo + 'T23:59:59') : new Date()

    const { data } = await supabase
      .from('orders')
      .select('id, total_amount, status, created_at, order_items(litres, products(name))')
      .gte('created_at', start.toISOString())
      .lte('created_at', end.toISOString())
      .order('created_at', { ascending: true })

    setOrders(data || [])
    setLoading(false)
  }

  // ── derived stats ─────────────────────────────────────────────────────────

  const stats = useMemo(() => {
    const revenue    = orders.reduce((s, o) => s + parseFloat(o.total_amount || 0), 0)
    const count      = orders.length
    const avgValue   = count > 0 ? revenue / count : 0
    const totalLitres = orders.flatMap(o => o.order_items || []).reduce((s, i) => s + parseFloat(i.litres || 0), 0)

    const byStatus = ['placed', 'confirmed', 'delivered', 'cancelled'].map(st => ({
      label: st, value: orders.filter(o => o.status === st).length,
    }))

    const productMap = {}
    orders.flatMap(o => o.order_items || []).forEach(item => {
      const name = item.products?.name || 'Unknown'
      productMap[name] = (productMap[name] || 0) + parseFloat(item.litres || 0)
    })
    const topProducts = Object.entries(productMap)
      .map(([name, litres]) => ({ name, litres }))
      .sort((a, b) => b.litres - a.litres)
      .slice(0, 5)

    const byDay = groupByDay(orders)

    return { revenue, count, avgValue, totalLitres, byStatus, topProducts, byDay }
  }, [orders])

  const revenueRows = stats.byDay.map(d => ({
    label:   fmtDate(d.day),
    value:   d.revenue,
    display: `₹${d.revenue.toFixed(0)}`,
    color:   'linear-gradient(180deg,#3b82f6,#1d4ed8)',
  }))

  const maxStatus = Math.max(...stats.byStatus.map(s => s.value), 1)
  const maxLitres = Math.max(...stats.topProducts.map(p => p.litres), 1)

  return (
    <div style={{ minHeight: '100vh', background: '#080a14' }}>
      <Navbar />

      <main style={{ maxWidth: '1100px', margin: '0 auto', padding: '48px 24px' }}>

        {/* Heading + filters */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '36px' }}>
          <div>
            <h1 style={{ color: '#ffffff', fontSize: '32px', fontWeight: '900', letterSpacing: '-0.5px', margin: '0 0 6px' }}>Analytics</h1>
            <p style={{ color: '#4b5563', fontSize: '14px', margin: 0 }}>
              {loading ? 'Loading…' : `${stats.count} orders in selected period`}
            </p>
          </div>

          {/* Preset + custom date */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
            {PRESETS.map(p => (
              <button
                key={p.days}
                onClick={() => { setPreset(p.days); setDateFrom(''); setDateTo('') }}
                style={{
                  background: preset === p.days && !dateFrom ? 'rgba(59,130,246,0.2)' : 'transparent',
                  border: `1px solid ${preset === p.days && !dateFrom ? 'rgba(59,130,246,0.5)' : '#1e2236'}`,
                  borderRadius: '8px', color: preset === p.days && !dateFrom ? '#60a5fa' : '#6b7280',
                  fontSize: '13px', fontWeight: '600', padding: '7px 14px', cursor: 'pointer',
                }}
              >
                Last {p.label}
              </button>
            ))}
            <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
              style={{ ...inputStyle, colorScheme: 'dark' }} />
            <span style={{ color: '#374151', fontSize: '12px' }}>to</span>
            <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)}
              style={{ ...inputStyle, colorScheme: 'dark' }} />
          </div>
        </div>

        {/* KPI cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', gap: '16px', marginBottom: '32px' }}>
          <KPICard label="Total Revenue"   value={loading ? '…' : `₹${stats.revenue.toFixed(0)}`}     sub="Gross sales"           accent="#a78bfa" />
          <KPICard label="Orders"          value={loading ? '…' : stats.count}                         sub="In selected period"    accent="#60a5fa" />
          <KPICard label="Avg Order Value" value={loading ? '…' : `₹${stats.avgValue.toFixed(0)}`}    sub="Per order"             accent="#f59e0b" />
          <KPICard label="Total Litres"    value={loading ? '…' : `${stats.totalLitres.toFixed(1)}L`} sub="Across all products"   accent="#4ade80" />
        </div>

        {/* Charts row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>

          {/* Revenue over time */}
          <div style={{ background: '#0f1120', border: '1px solid #1e2236', borderRadius: '18px', padding: '24px' }}>
            <p style={{ color: '#ffffff', fontSize: '15px', fontWeight: '700', margin: '0 0 4px' }}>Revenue Over Time</p>
            <p style={{ color: '#4b5563', fontSize: '12px', margin: '0 0 20px' }}>Daily revenue in ₹</p>
            {loading
              ? <div style={{ height: '160px', background: '#12141e', borderRadius: '10px', animation: 'pulse 1.5s infinite' }} />
              : <BarChart rows={revenueRows} height={160} />
            }
          </div>

          {/* Orders by status */}
          <div style={{ background: '#0f1120', border: '1px solid #1e2236', borderRadius: '18px', padding: '24px' }}>
            <p style={{ color: '#ffffff', fontSize: '15px', fontWeight: '700', margin: '0 0 4px' }}>Orders by Status</p>
            <p style={{ color: '#4b5563', fontSize: '12px', margin: '0 0 20px' }}>Count per status</p>
            {loading
              ? <div style={{ height: '160px', background: '#12141e', borderRadius: '10px', animation: 'pulse 1.5s infinite' }} />
              : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', paddingTop: '8px' }}>
                  {stats.byStatus.map(s => (
                    <HBar key={s.label} label={s.label} value={s.value} max={maxStatus}
                      color={STATUS_COLORS[s.label]} display={s.value} />
                  ))}
                </div>
              )
            }
          </div>
        </div>

        {/* Top products */}
        <div style={{ background: '#0f1120', border: '1px solid #1e2236', borderRadius: '18px', padding: '24px' }}>
          <p style={{ color: '#ffffff', fontSize: '15px', fontWeight: '700', margin: '0 0 4px' }}>Top Products by Litres</p>
          <p style={{ color: '#4b5563', fontSize: '12px', margin: '0 0 20px' }}>Total litres ordered per product</p>

          {loading
            ? <div style={{ height: '120px', background: '#12141e', borderRadius: '10px', animation: 'pulse 1.5s infinite' }} />
            : stats.topProducts.length === 0
              ? <p style={{ color: '#374151', fontSize: '13px' }}>No data in this period.</p>
              : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {stats.topProducts.map(p => (
                    <HBar key={p.name} label={p.name} value={p.litres} max={maxLitres}
                      color="linear-gradient(90deg,#3b82f6,#8b5cf6)" display={`${p.litres.toFixed(1)}L`} />
                  ))}
                </div>
              )
          }
        </div>

      </main>

      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }`}</style>
    </div>
  )
}

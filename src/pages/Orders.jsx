import { useEffect, useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import Navbar from '../components/Navbar'
import StatusBadge from '../components/StatusBadge'
import OrderDetailModal from '../components/OrderDetailModal'

const FILTER_STATUSES = ['all', 'placed', 'confirmed', 'delivered', 'cancelled']
const UPDATE_STATUSES = ['placed', 'confirmed', 'delivered', 'cancelled']

const inputStyle = {
  background: '#12141e', border: '1px solid #1e2236',
  borderRadius: '10px', color: '#ffffff', fontSize: '13px',
  padding: '8px 12px', outline: 'none',
}

export default function Orders() {
  const navigate = useNavigate()
  const [orders, setOrders]           = useState([])
  const [loading, setLoading]         = useState(true)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [updatingId, setUpdatingId]   = useState(null)

  // Filters
  const [search, setSearch]             = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [dateFrom, setDateFrom]         = useState('')
  const [dateTo, setDateTo]             = useState('')

  const user = JSON.parse(localStorage.getItem('user') || 'null')
  const isAdmin = user?.role === 'admin'

  if (!user) {
    navigate('/login', { replace: true })
    return null
  }

  useEffect(() => { fetchOrders() }, [])

  async function fetchOrders() {
    setLoading(true)
    let query = supabase.from('orders').select('*').order('created_at', { ascending: false })
    if (!isAdmin) query = query.eq('phone', user.phone)
    const { data } = await query
    setOrders(data || [])
    setLoading(false)
  }

  // Inline status change from table dropdown (admin only)
  async function handleInlineStatus(orderId, newStatus) {
    setUpdatingId(orderId)
    const { error } = await supabase.from('orders').update({ status: newStatus }).eq('id', orderId)
    if (!error) {
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o))
    }
    setUpdatingId(null)
  }

  // Status change from detail modal
  function handleModalStatusChange(orderId, newStatus) {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o))
    if (selectedOrder?.id === orderId) setSelectedOrder(prev => ({ ...prev, status: newStatus }))
  }

  const filtered = useMemo(() => orders.filter(o => {
    const term = search.toLowerCase()
    const matchSearch = !term ||
      o.id.toLowerCase().includes(term) ||
      o.purchaser_name?.toLowerCase().includes(term) ||
      o.org_name?.toLowerCase().includes(term) ||
      o.delivery_address?.toLowerCase().includes(term) ||
      o.purpose?.toLowerCase().includes(term)
    const matchStatus = statusFilter === 'all' || o.status === statusFilter
    const d = new Date(o.created_at)
    const matchFrom = !dateFrom || d >= new Date(dateFrom)
    const matchTo   = !dateTo   || d <= new Date(dateTo + 'T23:59:59')
    return matchSearch && matchStatus && matchFrom && matchTo
  }), [orders, search, statusFilter, dateFrom, dateTo])

  function clearFilters() { setSearch(''); setStatusFilter('all'); setDateFrom(''); setDateTo('') }
  const hasActiveFilter = search || statusFilter !== 'all' || dateFrom || dateTo

  const COLS = isAdmin
    ? ['Order ID', 'Date', 'Purchaser', 'Organisation', 'Address', 'Purpose', 'Total', 'Status']
    : ['Order ID', 'Date', 'Purchaser', 'Address', 'Total', 'Status']

  return (
    <div style={{ minHeight: '100vh', background: '#080a14' }}>
      <Navbar />

      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '48px 24px' }}>

        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ color: '#ffffff', fontSize: '32px', fontWeight: '900', letterSpacing: '-0.5px', margin: '0 0 6px' }}>
            Orders
          </h1>
          <p style={{ color: '#4b5563', fontSize: '14px', margin: 0 }}>
            {loading ? 'Loading…' : `${filtered.length} of ${orders.length} order${orders.length !== 1 ? 's' : ''}${isAdmin ? ' · click a row to view details' : ''}`}
          </p>
        </div>

        {/* Filter bar */}
        <div style={{
          background: '#0f1120', border: '1px solid #1e2236', borderRadius: '16px',
          padding: '16px 20px', display: 'flex', gap: '12px', flexWrap: 'wrap',
          alignItems: 'center', marginBottom: '20px',
        }}>
          <input
            type="text" placeholder="Search by name, address, ID…"
            value={search} onChange={e => setSearch(e.target.value)}
            style={{ ...inputStyle, flex: '1', minWidth: '200px' }}
          />
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
            style={{ ...inputStyle, cursor: 'pointer' }}>
            {FILTER_STATUSES.map(s => (
              <option key={s} value={s} style={{ background: '#0f1120' }}>
                {s === 'all' ? 'All Statuses' : s.charAt(0).toUpperCase() + s.slice(1)}
              </option>
            ))}
          </select>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ color: '#4b5563', fontSize: '12px' }}>From</span>
            <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
              style={{ ...inputStyle, colorScheme: 'dark' }} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ color: '#4b5563', fontSize: '12px' }}>To</span>
            <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)}
              style={{ ...inputStyle, colorScheme: 'dark' }} />
          </div>
          {hasActiveFilter && (
            <button onClick={clearFilters} style={{
              background: 'transparent', border: '1px solid #374151', borderRadius: '10px',
              color: '#9ca3af', fontSize: '13px', padding: '8px 14px', cursor: 'pointer',
            }}>
              Clear filters
            </button>
          )}
        </div>

        {/* Table */}
        <div style={{ background: '#0f1120', border: '1px solid #1e2236', borderRadius: '16px', overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '700px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #1e2236' }}>
                {COLS.map(col => (
                  <th key={col} style={{
                    color: '#4b5563', fontSize: '11px', fontWeight: '600',
                    textTransform: 'uppercase', letterSpacing: '1px',
                    padding: '14px 16px', textAlign: 'left', whiteSpace: 'nowrap',
                  }}>
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {/* Skeleton */}
              {loading && [1,2,3].map(i => (
                <tr key={i}>
                  {COLS.map((_, j) => (
                    <td key={j} style={{ padding: '14px 16px' }}>
                      <div style={{ height: '14px', borderRadius: '6px', background: '#1e2236', animation: 'pulse 1.5s infinite' }} />
                    </td>
                  ))}
                </tr>
              ))}

              {/* Empty */}
              {!loading && filtered.length === 0 && (
                <tr>
                  <td colSpan={COLS.length} style={{ padding: '60px', textAlign: 'center', color: '#4b5563', fontSize: '14px' }}>
                    {hasActiveFilter ? 'No orders match the current filters.' : 'No orders placed yet.'}
                  </td>
                </tr>
              )}

              {/* Rows */}
              {!loading && filtered.map((order, idx) => (
                <tr
                  key={order.id}
                  onClick={() => isAdmin && setSelectedOrder(order)}
                  style={{
                    borderTop: idx === 0 ? 'none' : '1px solid #1a1c2e',
                    cursor: isAdmin ? 'pointer' : 'default',
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={e => { if (isAdmin) e.currentTarget.style.background = '#13152a' }}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <td style={{ padding: '14px 16px', whiteSpace: 'nowrap' }}>
                    <span style={{ color: '#60a5fa', fontSize: '13px', fontWeight: '700', fontFamily: 'monospace' }}>
                      #{order.id.slice(0, 8).toUpperCase()}
                    </span>
                  </td>
                  <td style={{ padding: '14px 16px', whiteSpace: 'nowrap' }}>
                    <span style={{ color: '#9ca3af', fontSize: '13px' }}>
                      {new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <span style={{ color: '#ffffff', fontSize: '13px', fontWeight: '600' }}>
                      {order.purchaser_name || '—'}
                    </span>
                  </td>
                  {isAdmin && (
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{ color: '#6b7280', fontSize: '13px' }}>{order.org_name || '—'}</span>
                    </td>
                  )}
                  <td style={{ padding: '14px 16px', maxWidth: '180px' }}>
                    <span style={{ color: '#6b7280', fontSize: '13px', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {order.delivery_address || '—'}
                    </span>
                  </td>
                  {isAdmin && (
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{ color: '#6b7280', fontSize: '13px' }}>{order.purpose || '—'}</span>
                    </td>
                  )}
                  <td style={{ padding: '14px 16px', whiteSpace: 'nowrap' }}>
                    <span style={{ color: '#a78bfa', fontSize: '14px', fontWeight: '800' }}>
                      ₹{parseFloat(order.total_amount).toFixed(2)}
                    </span>
                  </td>

                  {/* Status — dropdown for admin, badge for user */}
                  <td style={{ padding: '10px 16px' }} onClick={e => isAdmin && e.stopPropagation()}>
                    {isAdmin ? (
                      <select
                        value={order.status}
                        disabled={updatingId === order.id}
                        onChange={e => handleInlineStatus(order.id, e.target.value)}
                        style={{
                          background: '#12141e', border: '1px solid #1e2236',
                          borderRadius: '8px', color: '#ffffff', fontSize: '12px',
                          padding: '6px 10px', outline: 'none', cursor: 'pointer',
                          opacity: updatingId === order.id ? 0.5 : 1,
                        }}
                      >
                        {UPDATE_STATUSES.map(s => (
                          <option key={s} value={s} style={{ background: '#0f1120' }}>
                            {s.charAt(0).toUpperCase() + s.slice(1)}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <StatusBadge status={order.status} />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>

      {/* Detail modal */}
      {selectedOrder && (
        <OrderDetailModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onStatusChange={handleModalStatusChange}
        />
      )}

      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.3}}`}</style>
    </div>
  )
}

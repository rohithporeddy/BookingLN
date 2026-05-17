import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import StatusBadge from './StatusBadge'

const STATUSES = ['placed', 'confirmed', 'delivered', 'cancelled']

const sel = (hasError) => ({
  width: '100%', background: '#12141e',
  border: `1px solid ${hasError ? 'rgba(239,68,68,0.5)' : '#1e2236'}`,
  borderRadius: '10px', color: '#ffffff', fontSize: '14px',
  padding: '10px 14px', outline: 'none', cursor: 'pointer',
})

export default function OrderDetailModal({ order, onClose, onStatusChange }) {
  const [items, setItems]   = useState([])
  const [loading, setLoading] = useState(true)
  const [status, setStatus] = useState(order.status)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved]   = useState(false)

  const isAdmin = JSON.parse(localStorage.getItem('user') || '{}').role === 'admin'

  useEffect(() => {
    async function fetchItems() {
      setLoading(true)
      const { data } = await supabase
        .from('order_items')
        .select('*, products(name, price_per_litre)')
        .eq('order_id', order.id)
      setItems(data || [])
      setLoading(false)
    }
    fetchItems()
  }, [order.id])

  async function handleSaveStatus() {
    setSaving(true)
    const { error } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', order.id)
    setSaving(false)
    if (!error) {
      setSaved(true)
      onStatusChange(order.id, status)
      setTimeout(() => setSaved(false), 2000)
    }
  }

  const statusChanged = status !== order.status

  const INFO = [
    { label: 'Purchaser',     value: order.purchaser_name },
    { label: 'Phone',         value: order.phone },
    { label: 'Organisation',  value: order.org_name || '—' },
    { label: 'Building',      value: order.building_name },
    { label: 'Address',       value: order.delivery_address },
    { label: 'Purpose',       value: order.purpose },
    { label: 'Ordered on',    value: new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) },
    { label: 'Order Total',   value: `₹${parseFloat(order.total_amount).toFixed(2)}` },
  ]

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(0,0,0,0.75)',
        backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 200, padding: '16px',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: '#0f1120', border: '1px solid #1e2236',
          borderRadius: '24px', padding: '32px',
          width: '100%', maxWidth: '560px',
          maxHeight: '90vh', overflowY: 'auto',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
          <div>
            <h2 style={{ color: '#ffffff', fontSize: '20px', fontWeight: '800', margin: '0 0 6px' }}>
              Order Details
            </h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ color: '#60a5fa', fontSize: '13px', fontFamily: 'monospace', fontWeight: '700' }}>
                #{order.id.slice(0, 8).toUpperCase()}
              </span>
              <StatusBadge status={order.status} />
            </div>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', color: '#6b7280', fontSize: '24px', cursor: 'pointer', lineHeight: 1 }}
          >
            ×
          </button>
        </div>

        {/* Delivery info grid */}
        <div style={{
          background: '#12141e', borderRadius: '14px', padding: '20px',
          display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px',
          marginBottom: '24px',
        }}>
          {INFO.map(row => (
            <div key={row.label} style={{ gridColumn: row.label === 'Address' ? 'span 2' : 'span 1' }}>
              <p style={{ color: '#4b5563', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', margin: '0 0 4px' }}>
                {row.label}
              </p>
              <p style={{ color: '#ffffff', fontSize: '13px', fontWeight: '600', margin: 0, lineHeight: '1.4' }}>
                {row.value}
              </p>
            </div>
          ))}
        </div>

        {/* Order items */}
        <p style={{ color: '#4b5563', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', margin: '0 0 10px' }}>
          Items ordered
        </p>
        {loading ? (
          <div style={{ background: '#12141e', borderRadius: '10px', padding: '20px', textAlign: 'center' }}>
            <p style={{ color: '#374151', fontSize: '13px', margin: 0 }}>Loading items…</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '24px' }}>
            {items.map(item => (
              <div
                key={item.id}
                style={{
                  background: '#12141e', borderRadius: '10px', padding: '12px 16px',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                }}
              >
                <div>
                  <p style={{ color: '#ffffff', fontSize: '14px', fontWeight: '600', margin: '0 0 2px' }}>
                    {item.products?.name || 'Unknown Product'}
                  </p>
                  <p style={{ color: '#6b7280', fontSize: '12px', margin: 0 }}>
                    {item.litres}L × ₹{item.products?.price_per_litre}/L
                  </p>
                </div>
                <span style={{ color: '#a78bfa', fontWeight: '800', fontSize: '15px' }}>
                  ₹{parseFloat(item.price).toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Status change — admin only */}
        {isAdmin && (
          <div style={{ borderTop: '1px solid #1e2236', paddingTop: '20px' }}>
            <p style={{ color: '#4b5563', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', margin: '0 0 10px' }}>
              Update Status
            </p>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <select
                value={status}
                onChange={e => { setStatus(e.target.value); setSaved(false) }}
                style={sel(false)}
              >
                {STATUSES.map(s => (
                  <option key={s} value={s} style={{ background: '#0f1120' }}>
                    {s.charAt(0).toUpperCase() + s.slice(1)}
                  </option>
                ))}
              </select>
              <button
                onClick={handleSaveStatus}
                disabled={!statusChanged || saving}
                style={{
                  padding: '10px 22px', flexShrink: 0,
                  background: saved ? 'linear-gradient(135deg,#16a34a,#15803d)' : statusChanged ? 'linear-gradient(135deg,#3b82f6,#2563eb)' : '#1a1c2e',
                  border: 'none', borderRadius: '10px',
                  color: statusChanged || saved ? '#fff' : '#374151',
                  fontSize: '13px', fontWeight: '700',
                  cursor: statusChanged && !saving ? 'pointer' : 'default',
                  transition: 'all 0.2s', whiteSpace: 'nowrap',
                }}
              >
                {saving ? 'Saving…' : saved ? '✓ Saved' : 'Save'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

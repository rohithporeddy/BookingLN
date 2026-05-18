import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { useCart } from '../context/CartContext'
import config from '../config'

const FIELDS = [
  { name: 'purchaser_name',  label: 'Purchaser Name',      placeholder: 'Full name of the person ordering', required: true  },
  { name: 'org_name',        label: 'Organisation Name',    placeholder: 'Company / institution name',       required: false },
  { name: 'building_name',   label: 'Building / Site Name', placeholder: 'e.g. Block A, Tower 2',            required: true  },
  { name: 'delivery_address', label: 'Delivery Address',    placeholder: 'Street, area, city, pincode',      required: true  },
  { name: 'purpose',         label: 'Purpose of Usage',     placeholder: 'e.g. Industrial, Lab, Domestic',   required: true  },
]

const EMPTY_FORM = Object.fromEntries(FIELDS.map(f => [f.name, '']))

export default function OrderModal({ total, onClose, onSuccess }) {
  const { cartItems, clearCart } = useCart()
  const [form, setForm] = useState(EMPTY_FORM)
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [serverError, setServerError] = useState(null)

  const user = JSON.parse(localStorage.getItem('user') || '{}')

  function handleChange(e) {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }))
  }

  function validate() {
    const newErrors = {}
    FIELDS.forEach(f => {
      if (f.required && !form[f.name].trim()) {
        newErrors[f.name] = `${f.label} is required`
      }
    })
    return newErrors
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const validationErrors = validate()
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }

    setLoading(true)
    setServerError(null)

    // 1. Insert the order row
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        total_amount:     parseFloat(total.toFixed(2)),
        status:           'placed',
        delivery_address: form.delivery_address.trim(),
        building_name:    form.building_name.trim(),
        org_name:         form.org_name.trim() || null,
        purpose:          form.purpose.trim(),
        purchaser_name:   form.purchaser_name.trim(),
        phone:            user.phone,
      })
      .select()
      .single()

    if (orderError) {
      setServerError(orderError.message)
      setLoading(false)
      return
    }

    // 2. Insert each cart item linked to the order
    const orderItems = cartItems.map(item => ({
      order_id:   order.id,
      product_id: item.product.id,
      litres:     item.litres,
      // price stores the line-item total (litres × price_per_litre)
      price:      parseFloat((item.product.price_per_litre * item.litres).toFixed(2)),
    }))

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems)

    if (itemsError) {
      setServerError(itemsError.message)
      setLoading(false)
      return
    }

    clearCart()
    setLoading(false)
    onSuccess(order)
  }

  // --- Reusable input style ---
  const inputStyle = (hasError) => ({
    width: '100%',
    background: '#12141e',
    border: `1px solid ${hasError ? 'rgba(239,68,68,0.6)' : '#1e2236'}`,
    borderRadius: '10px',
    color: '#ffffff',
    fontSize: '14px',
    padding: '11px 14px',
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'border-color 0.2s',
  })

  return (
    /* Backdrop */
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(0,0,0,0.7)',
        backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 100, padding: '16px',
      }}
    >
      {/* Modal card — stop click propagation so clicking inside doesn't close it */}
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: '#0f1120',
          border: '1px solid #1e2236',
          borderRadius: '24px',
          padding: '32px',
          width: '100%',
          maxWidth: '500px',
          maxHeight: '90vh',
          overflowY: 'auto',
          position: 'relative',
        }}
      >

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
          <div>
            <h2 style={{ color: '#ffffff', fontSize: '20px', fontWeight: '800', margin: '0 0 4px' }}>
              Delivery Details
            </h2>
            <p style={{ color: '#4b5563', fontSize: '13px', margin: 0 }}>
              Order total: <span style={{ color: '#60a5fa', fontWeight: '700' }}>{config.currency}{total.toFixed(2)}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'transparent', border: 'none',
              color: '#6b7280', fontSize: '22px', cursor: 'pointer',
              lineHeight: 1, padding: '0 4px',
            }}
          >
            ×
          </button>
        </div>

        {/* Server error */}
        {serverError && (
          <div style={{
            background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
            borderRadius: '10px', padding: '12px 16px', marginBottom: '20px',
          }}>
            <p style={{ color: '#f87171', fontSize: '13px', margin: 0 }}>{serverError}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {FIELDS.map(field => (
            <div key={field.name}>
              <label style={{
                display: 'block', color: '#9ca3af', fontSize: '12px',
                textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '6px',
              }}>
                {field.label}{field.required && <span style={{ color: '#f87171' }}> *</span>}
              </label>
              <input
                type="text"
                name={field.name}
                value={form[field.name]}
                onChange={handleChange}
                placeholder={field.placeholder}
                className="phone-input"
                style={inputStyle(!!errors[field.name])}
              />
              {errors[field.name] && (
                <p style={{ color: '#f87171', fontSize: '12px', margin: '5px 0 0' }}>
                  {errors[field.name]}
                </p>
              )}
            </div>
          ))}

          {/* Divider */}
          <div style={{ width: '100%', height: '1px', background: '#1e2236', margin: '4px 0' }} />

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%', padding: '15px',
              background: loading
                ? '#1d4ed8'
                : 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
              border: 'none', borderRadius: '12px',
              color: '#ffffff', fontSize: '14px', fontWeight: '700',
              letterSpacing: '1.5px', textTransform: 'uppercase',
              cursor: loading ? 'default' : 'pointer',
              opacity: loading ? 0.7 : 1,
              transition: 'opacity 0.2s',
            }}
          >
            {loading ? 'Placing Order...' : 'Confirm Order'}
          </button>
        </form>

      </div>
    </div>
  )
}

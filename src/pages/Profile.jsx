import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'

const inputStyle = {
  width: '100%',
  background: '#12141e',
  border: '1px solid #1e2236',
  borderRadius: '12px',
  color: '#ffffff',
  fontSize: '14px',
  padding: '13px 16px',
  outline: 'none',
  boxSizing: 'border-box',
  transition: 'border-color 0.2s',
}

const labelStyle = {
  color: '#6b7280',
  fontSize: '12px',
  fontWeight: '600',
  textTransform: 'uppercase',
  letterSpacing: '1px',
  marginBottom: '8px',
  display: 'block',
}

export default function Profile() {
  const navigate = useNavigate()

  const user = JSON.parse(localStorage.getItem('user') || 'null')
  if (!user) {
    navigate('/login', { replace: true })
    return null
  }

  const [name, setName]       = useState(user.name || '')
  const [orgName, setOrgName] = useState(user.org_name || '')
  const [email, setEmail]     = useState(user.email || '')
  const [saved, setSaved]     = useState(false)
  const [error, setError]     = useState('')

  function handleSave() {
    if (!name.trim()) {
      setError('Name is required.')
      return
    }
    const updated = { ...user, name: name.trim(), org_name: orgName.trim(), email: email.trim() }
    localStorage.setItem('user', JSON.stringify(updated))
    setSaved(true)
    setError('')
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div style={{ minHeight: '100vh', background: '#080a14' }}>
      <Navbar />

      <main style={{ maxWidth: '540px', margin: '0 auto', padding: '48px 24px' }}>

        <div style={{ marginBottom: '36px' }}>
          <h1 style={{ color: '#ffffff', fontSize: '28px', fontWeight: '900', letterSpacing: '-0.5px', margin: '0 0 6px' }}>
            Profile
          </h1>
          <p style={{ color: '#4b5563', fontSize: '14px', margin: 0 }}>
            Update your basic details. These will be used across the app.
          </p>
        </div>

        {/* Card */}
        <div style={{ background: '#0f1120', border: '1px solid #1e2236', borderRadius: '20px', padding: '32px' }}>

          {/* Phone — read only */}
          <div style={{ marginBottom: '24px' }}>
            <label style={labelStyle}>Phone Number</label>
            <div style={{
              ...inputStyle,
              color: '#4b5563',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'default',
            }}>
              <span style={{ color: '#374151' }}>+91</span>
              <span>{user.phone}</span>
              <span style={{
                marginLeft: 'auto',
                background: 'rgba(59,130,246,0.15)',
                border: '1px solid rgba(59,130,246,0.3)',
                color: '#60a5fa',
                fontSize: '10px',
                fontWeight: '700',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                padding: '3px 10px',
                borderRadius: '999px',
              }}>
                {user.role}
              </span>
            </div>
            <p style={{ color: '#374151', fontSize: '11px', margin: '6px 0 0 4px' }}>
              Phone number cannot be changed.
            </p>
          </div>

          {/* Name */}
          <div style={{ marginBottom: '20px' }}>
            <label style={labelStyle}>Full Name *</label>
            <input
              type="text"
              value={name}
              onChange={e => { setName(e.target.value); setError('') }}
              placeholder="e.g. Priya Sharma"
              style={inputStyle}
              onFocus={e => e.target.style.borderColor = '#3b82f6'}
              onBlur={e => e.target.style.borderColor = '#1e2236'}
            />
          </div>

          {/* Organisation */}
          <div style={{ marginBottom: '20px' }}>
            <label style={labelStyle}>Organisation</label>
            <input
              type="text"
              value={orgName}
              onChange={e => setOrgName(e.target.value)}
              placeholder="e.g. Acme Pvt Ltd"
              style={inputStyle}
              onFocus={e => e.target.style.borderColor = '#3b82f6'}
              onBlur={e => e.target.style.borderColor = '#1e2236'}
            />
          </div>

          {/* Email */}
          <div style={{ marginBottom: '28px' }}>
            <label style={labelStyle}>Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="e.g. priya@example.com"
              style={inputStyle}
              onFocus={e => e.target.style.borderColor = '#3b82f6'}
              onBlur={e => e.target.style.borderColor = '#1e2236'}
            />
          </div>

          {error && (
            <p style={{ color: '#f87171', fontSize: '13px', marginBottom: '16px' }}>{error}</p>
          )}

          <button
            onClick={handleSave}
            style={{
              width: '100%',
              padding: '14px',
              background: saved
                ? 'rgba(74,222,128,0.15)'
                : 'linear-gradient(135deg, #3b82f6, #2563eb)',
              border: saved ? '1px solid rgba(74,222,128,0.4)' : 'none',
              borderRadius: '12px',
              color: saved ? '#4ade80' : '#ffffff',
              fontSize: '14px',
              fontWeight: '700',
              letterSpacing: '1px',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            {saved ? '✓ Saved' : 'Save Changes'}
          </button>
        </div>

      </main>
    </div>
  )
}

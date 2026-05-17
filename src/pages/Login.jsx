import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import TestTubes from '../components/TestTubes'

export default function Login() {
  const [phone, setPhone] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  function handlePhoneChange(e) {
    const val = e.target.value.replace(/\D/g, '').slice(0, 10)
    setPhone(val)
    if (error) setError('')
  }

  async function handleContinue() {
    if (phone.length < 10) {
      setError('Please enter a valid 10-digit phone number')
      return
    }
    setLoading(true)
    await new Promise((r) => setTimeout(r, 600))

    const user = {
      phone,
      role: phone === '9999999999' ? 'admin' : 'user',
    }
    localStorage.setItem('user', JSON.stringify(user))
    navigate('/home')
  }

  return (
    <div style={{ minHeight: '100vh', background: '#080a14', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px 16px' }}>
      <div style={{ width: '100%', maxWidth: '360px' }}>

        <TestTubes size={110} />

        {/* Title */}
        <div style={{ textAlign: 'center', marginBottom: '36px' }}>
          <h1 style={{
            color: '#ffffff',
            fontSize: '28px',
            fontWeight: '900',
            textTransform: 'uppercase',
            letterSpacing: '-0.3px',
            lineHeight: '1.2',
            margin: '0 0 10px',
          }}>
            Login to<br />Your Account
          </h1>
          <p style={{ color: '#6b7280', fontSize: '14px', margin: 0 }}>
            Enter your phone number to continue
          </p>
        </div>

        {/* Phone input */}
        <div style={{ marginBottom: '16px' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            background: '#12141e',
            border: '1px solid #1e2236',
            borderRadius: '14px',
            padding: '0 16px',
            transition: 'border-color 0.2s',
          }}>
            {/* Phone icon */}
            <svg width="18" height="18" fill="none" stroke="#6b7280" strokeWidth="1.5" viewBox="0 0 24 24" style={{ flexShrink: 0, marginRight: '8px' }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
            </svg>
            <span style={{ color: '#6b7280', fontSize: '14px', marginRight: '6px', userSelect: 'none' }}>+91</span>
            <input
              type="tel"
              inputMode="numeric"
              value={phone}
              onChange={handlePhoneChange}
              placeholder="9876543210"
              className="phone-input"
              style={{
                flex: 1,
                background: 'transparent',
                border: 'none',
                outline: 'none',
                color: '#ffffff',
                fontSize: '14px',
                padding: '15px 0',
              }}
            />
          </div>
          {error && (
            <p style={{ color: '#f87171', fontSize: '12px', marginTop: '8px', marginLeft: '4px' }}>
              {error}
            </p>
          )}
        </div>

        {/* Continue button */}
        <button
          onClick={handleContinue}
          disabled={loading}
          style={{
            width: '100%',
            padding: '15px',
            background: loading ? '#1d4ed8' : 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
            border: 'none',
            borderRadius: '14px',
            color: '#ffffff',
            fontSize: '14px',
            fontWeight: '700',
            letterSpacing: '2px',
            textTransform: 'uppercase',
            cursor: loading ? 'default' : 'pointer',
            opacity: loading ? 0.7 : 1,
            transition: 'opacity 0.2s, transform 0.1s',
            marginBottom: '32px',
          }}
        >
          {loading ? 'Please wait...' : 'Continue'}
        </button>

        {/* Brand */}
        <p style={{ textAlign: 'center', color: '#374151', fontSize: '13px', margin: 0 }}>
          BookingLN
        </p>

      </div>
    </div>
  )
}

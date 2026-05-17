import { useNavigate } from 'react-router-dom'
import TestTubes from '../components/TestTubes'

export default function Home() {
  const navigate = useNavigate()
  const user = JSON.parse(localStorage.getItem('user') || '{}')

  function handleLogout() {
    localStorage.removeItem('user')
    navigate('/')
  }

  const isAdmin = user.role === 'admin'

  return (
    <div style={{ minHeight: '100vh', background: '#080a14', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px 16px' }}>
      <div style={{ width: '100%', maxWidth: '360px' }}>

        <TestTubes size={110} />

        {/* Welcome card */}
        <div style={{
          background: '#0f1120',
          border: '1px solid #1e2236',
          borderRadius: '20px',
          padding: '28px 24px',
          marginBottom: '20px',
        }}>
          <p style={{ color: '#6b7280', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '2px', margin: '0 0 8px' }}>
            Welcome back
          </p>
          <h1 style={{ color: '#ffffff', fontSize: '26px', fontWeight: '800', margin: '0 0 20px', letterSpacing: '-0.3px' }}>
            +91 {user.phone}
          </h1>

          {/* Role badge */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <span style={{
              background: isAdmin ? 'rgba(124,58,237,0.2)' : 'rgba(37,99,235,0.2)',
              border: `1px solid ${isAdmin ? 'rgba(124,58,237,0.5)' : 'rgba(37,99,235,0.5)'}`,
              color: isAdmin ? '#a78bfa' : '#60a5fa',
              fontSize: '12px',
              fontWeight: '600',
              textTransform: 'uppercase',
              letterSpacing: '1.5px',
              padding: '4px 12px',
              borderRadius: '999px',
            }}>
              {user.role}
            </span>
          </div>
        </div>

        {/* Logout button */}
        <button
          onClick={handleLogout}
          style={{
            width: '100%',
            padding: '15px',
            background: 'transparent',
            border: '1px solid #1e2236',
            borderRadius: '14px',
            color: '#9ca3af',
            fontSize: '14px',
            fontWeight: '600',
            letterSpacing: '1px',
            cursor: 'pointer',
            transition: 'border-color 0.2s, color 0.2s',
          }}
          onMouseEnter={e => { e.target.style.borderColor = '#374151'; e.target.style.color = '#ffffff' }}
          onMouseLeave={e => { e.target.style.borderColor = '#1e2236'; e.target.style.color = '#9ca3af' }}
        >
          Logout
        </button>

      </div>
    </div>
  )
}

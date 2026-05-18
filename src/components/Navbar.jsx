import { useNavigate, useLocation } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import config from '../config'

const USER_TABS  = [
  { label: 'Home',     path: '/home'     },
  { label: 'Products', path: '/products' },
  { label: 'Orders',   path: '/orders'   },
  { label: 'Cart',     path: '/cart'     },
  { label: 'Profile',  path: '/profile'  },
]

const ADMIN_TABS = [
  { label: 'Home',      path: '/home'      },
  { label: 'Products',  path: '/products'  },
  { label: 'Orders',    path: '/orders'    },
  { label: 'Analytics', path: '/analytics' },
  { label: 'Cart',      path: '/cart'      },
  { label: 'Profile',   path: '/profile'   },
]

export default function Navbar() {
  const navigate = useNavigate()
  const location = useLocation()
  const { cartItems } = useCart()

  const cartCount = cartItems.length
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  const tabs = user.role === 'admin' ? ADMIN_TABS : USER_TABS

  function handleLogout() {
    localStorage.removeItem('user')
    navigate('/login', { replace: true })
  }

  return (
    <nav style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 24px',
      borderBottom: '1px solid #1e2236',
      background: '#080a14',
      position: 'sticky',
      top: 0,
      zIndex: 10,
      height: '60px',
    }}>

      {/* App title */}
      <span
        onClick={() => navigate('/home')}
        style={{ color: '#ffffff', fontWeight: '800', fontSize: '18px', letterSpacing: '-0.3px', cursor: 'pointer' }}
      >
        {config.name}
      </span>

      {/* Navigation tabs */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', height: '100%' }}>
        {tabs.map((tab) => {
          const isActive = location.pathname === tab.path
          const isCart = tab.path === '/cart'
          return (
            <button
              key={tab.path}
              onClick={() => navigate(tab.path)}
              style={{
                background: 'transparent',
                border: 'none',
                borderBottom: isActive ? '2px solid #3b82f6' : '2px solid transparent',
                color: isActive ? '#ffffff' : '#6b7280',
                fontSize: '14px',
                fontWeight: isActive ? '700' : '500',
                padding: '0 16px',
                height: '100%',
                cursor: 'pointer',
                transition: 'color 0.15s, border-color 0.15s',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                position: 'relative',
              }}
            >
              {tab.label}
              {/* Badge on Cart tab */}
              {isCart && cartCount > 0 && (
                <span style={{
                  background: '#3b82f6',
                  color: '#ffffff',
                  fontSize: '10px',
                  fontWeight: '700',
                  borderRadius: '999px',
                  padding: '1px 6px',
                  lineHeight: '16px',
                  minWidth: '16px',
                  textAlign: 'center',
                }}>
                  {cartCount}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* Logout */}
      <button
        onClick={handleLogout}
        style={{
          background: 'transparent',
          border: '1px solid #1e2236',
          borderRadius: '10px',
          color: '#9ca3af',
          fontSize: '13px',
          fontWeight: '600',
          padding: '8px 16px',
          cursor: 'pointer',
        }}
      >
        Logout
      </button>
    </nav>
  )
}

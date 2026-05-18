import { Navigate, useLocation } from 'react-router-dom'

export default function ProtectedRoute({ children, adminOnly = false }) {
  const location = useLocation()
  const user = JSON.parse(localStorage.getItem('user') || 'null')

  if (!user) {
    // Save where the user was trying to go, so Login can redirect back after auth.
    sessionStorage.setItem('login_redirect', location.pathname)
    return <Navigate to="/login" replace />
  }

  if (adminOnly && user.role !== 'admin') {
    return <Navigate to="/home" replace />
  }

  return children
}

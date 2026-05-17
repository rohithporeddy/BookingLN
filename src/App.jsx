import { Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Home from './pages/Home'
import Products from './pages/Products'
import Cart from './pages/Cart'
import Orders from './pages/Orders'
import Analytics from './pages/Analytics'
import Profile from './pages/Profile'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/home" element={<Home />} />
      <Route path="/products" element={<Products />} />
      <Route path="/cart" element={<Cart />} />
      <Route path="/orders"    element={<Orders />}    />
      <Route path="/analytics" element={<Analytics />} />
      <Route path="/profile"   element={<Profile />}   />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}

export default App

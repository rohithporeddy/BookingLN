import { useEffect, useState } from 'react'
import { supabase } from './lib/supabase'

function App() {
  const [products, setProducts] = useState([])

  useEffect(() => {
    getProducts()
  }, [])

  async function getProducts() {
    const { data, error } = await supabase
      .from('products')
      .select('*')

    if (error) console.error('Supabase error:', error)
    setProducts(data || [])
  }

  return (
    <div>
      <h1>Products</h1>

      {products.map((p) => (
        <div key={p.id}>
          <h2>{p.name}</h2>
          <p>{p.description}</p>
          <p>₹{p.price_per_litre}</p>
        </div>
      ))}
    </div>
  )
}

export default App

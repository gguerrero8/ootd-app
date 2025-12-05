import { useEffect, useState } from 'react'
import { apiGet, apiPost } from '../apiClient'

function getStoredUser() {
  try {
    const raw = window.localStorage.getItem('ootdUser')
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function ClosetPage() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [form, setForm] = useState({ name: '', category: '', color: '', season: '' })

  const user = getStoredUser()

  useEffect(() => {
    async function loadItems() {
      setLoading(true)
      setError('')
      try {
        const data = await apiGet('/clothing')
        setItems(data)
      } catch (err) {
        setError(err.message || 'Could not load clothing items')
      } finally {
        setLoading(false)
      }
    }

    loadItems()
  }, [])

  async function handleSubmit(e) {
    e.preventDefault()
    if (!user) return

    try {
      const newItem = await apiPost('/clothing', {
        user_id: user.id,
        name: form.name,
        category: form.category,
        color: form.color,
        season: form.season,
      })
      setItems((prev) => [...prev, newItem])
      setForm({ name: '', category: '', color: '', season: '' })
    } catch (err) {
      setError(err.message || 'Could not add item')
    }
  }

  function updateField(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <div className="page page-scroll">
      <div className="card">
        <h1>My Closet</h1>
        <p className="subtitle">Upload and categorize your clothing items.</p>

        {error && <p className="error-text">{error}</p>}

        <form onSubmit={handleSubmit} className="form">
          <label>Name</label>
          <input
            value={form.name}
            onChange={(e) => updateField('name', e.target.value)}
            required
          />

          <label>Category</label>
          <input
            placeholder="top, pants, shoes…"
            value={form.category}
            onChange={(e) => updateField('category', e.target.value)}
            required
          />

          <label>Color</label>
          <input
            value={form.color}
            onChange={(e) => updateField('color', e.target.value)}
          />

          <label>Season</label>
          <input
            placeholder="summer, fall…"
            value={form.season}
            onChange={(e) => updateField('season', e.target.value)}
          />

          <button type="submit">Add Item</button>
        </form>

        <h2>Wardrobe</h2>
        {loading ? (
          <p>Loading…</p>
        ) : (
          <ul className="list">
            {items.map((item) => (
              <li key={item.item_id} className="list-item">
                <div className="list-item-main">
                  <strong>{item.name}</strong>
                  <span className="tag">{item.category}</span>
                </div>
                <div className="list-item-meta">
                  {item.color && <span>{item.color}</span>}
                  {item.season && <span>{item.season}</span>}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

export default ClosetPage

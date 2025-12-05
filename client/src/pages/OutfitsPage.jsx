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

function OutfitsPage() {
  const [outfits, setOutfits] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [form, setForm] = useState({ name: '', rating: '', is_favorite: false })

  const user = getStoredUser()

  useEffect(() => {
    async function loadOutfits() {
      setLoading(true)
      setError('')
      try {
        const data = await apiGet('/outfits')
        setOutfits(data)
      } catch (err) {
        setError(err.message || 'Could not load outfits')
      } finally {
        setLoading(false)
      }
    }

    loadOutfits()
  }, [])

  async function handleSubmit(e) {
    e.preventDefault()
    if (!user) return

    try {
      const newOutfit = await apiPost('/outfits', {
        user_id: user.id,
        name: form.name,
        rating: form.rating ? Number(form.rating) : null,
        is_favorite: form.is_favorite,
      })
      setOutfits((prev) => [...prev, newOutfit])
      setForm({ name: '', rating: '', is_favorite: false })
    } catch (err) {
      setError(err.message || 'Could not create outfit')
    }
  }

  function updateField(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <div className="page page-scroll">
      <div className="card">
        <h1>Outfits</h1>
        <p className="subtitle">Create outfits that can later be suggested and shared.</p>

        {error && <p className="error-text">{error}</p>}

        <form onSubmit={handleSubmit} className="form">
          <label>Name</label>
          <input
            value={form.name}
            onChange={(e) => updateField('name', e.target.value)}
            required
          />

          <label>Rating (1–5)</label>
          <input
            type="number"
            min="1"
            max="5"
            value={form.rating}
            onChange={(e) => updateField('rating', e.target.value)}
          />

          <label className="checkbox-row">
            <input
              type="checkbox"
              checked={form.is_favorite}
              onChange={(e) => updateField('is_favorite', e.target.checked)}
            />
            Mark as favorite
          </label>

          <button type="submit">Save Outfit</button>
        </form>

        <h2>My Outfits</h2>
        {loading ? (
          <p>Loading…</p>
        ) : (
          <ul className="list">
            {outfits.map((o) => (
              <li key={o.outfit_id} className="list-item">
                <div className="list-item-main">
                  <strong>{o.name}</strong>
                  {o.is_favorite && <span className="tag">★ Favorite</span>}
                </div>
                <div className="list-item-meta">
                  {o.rating && <span>Rating: {o.rating}</span>}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

export default OutfitsPage

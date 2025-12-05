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

function CollectionsPage() {
  const [collections, setCollections] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')

  const user = getStoredUser()

  useEffect(() => {
    async function loadCollections() {
      setLoading(true)
      setError('')
      try {
        const data = await apiGet('/collections')
        setCollections(data)
      } catch (err) {
        setError(err.message || 'Could not load collections')
      } finally {
        setLoading(false)
      }
    }

    loadCollections()
  }, [])

  async function handleSubmit(e) {
    e.preventDefault()
    if (!user) return

    try {
      const newCollection = await apiPost('/collections', {
        user_id: user.id,
        name,
        description,
      })
      setCollections((prev) => [...prev, newCollection])
      setName('')
      setDescription('')
    } catch (err) {
      setError(err.message || 'Could not create collection')
    }
  }

  return (
    <div className="page page-scroll">
      <div className="card">
        <h1>Collections</h1>
        <p className="subtitle">Group favorite outfits into reusable collections.</p>

        {error && <p className="error-text">{error}</p>}

        <form onSubmit={handleSubmit} className="form">
          <label>Name</label>
          <input value={name} onChange={(e) => setName(e.target.value)} required />

          <label>Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
          />

          <button type="submit">Create Collection</button>
        </form>

        <h2>My Collections</h2>
        {loading ? (
          <p>Loading…</p>
        ) : (
          <ul className="list">
            {collections.map((c) => (
              <li key={c.collection_id} className="list-item">
                <div className="list-item-main">
                  <strong>{c.name}</strong>
                </div>
                {c.description && <div className="list-item-meta">{c.description}</div>}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

export default CollectionsPage

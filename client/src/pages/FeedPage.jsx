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

function FeedPage() {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [caption, setCaption] = useState('')

  const user = getStoredUser()

  useEffect(() => {
    async function loadPosts() {
      setLoading(true)
      setError('')
      try {
        const data = await apiGet('/posts')
        setPosts(data)
      } catch (err) {
        setError(err.message || 'Could not load feed')
      } finally {
        setLoading(false)
      }
    }

    loadPosts()
  }, [])

  async function handleSubmit(e) {
    e.preventDefault()
    if (!user) return

    // For now, just associate the post with the first outfit in the list (demo).
    // Later we can add outfit selection.
    let outfitId = posts[0]?.outfit_id || null

    try {
      const newPost = await apiPost('/posts', {
        user_id: user.id,
        outfit_id: outfitId,
        caption,
        is_visible: true,
      })
      setPosts((prev) => [newPost, ...prev])
      setCaption('')
    } catch (err) {
      setError(err.message || 'Could not create post')
    }
  }

  return (
    <div className="page page-scroll">
      <div className="card">
        <h1>Community Feed</h1>
        <p className="subtitle">View and share outfits with others.</p>

        {error && <p className="error-text">{error}</p>}

        <form onSubmit={handleSubmit} className="form">
          <label>New Post</label>
          <textarea
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            rows={3}
            placeholder="What are you wearing today?"
          />
          <button type="submit">Share</button>
        </form>

        <h2>Feed</h2>
        {loading ? (
          <p>Loading…</p>
        ) : (
          <ul className="list">
            {posts.map((p) => (
              <li key={p.post_id} className="list-item">
                <div className="list-item-main">
                  <strong>{p.caption}</strong>
                </div>
                <div className="list-item-meta">
                  <span>Outfit: {p.outfit_id}</span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

export default FeedPage

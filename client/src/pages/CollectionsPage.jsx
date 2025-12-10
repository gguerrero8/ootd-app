import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { apiGet, apiPost } from '../apiClient'

/**
 * @typedef {Object} Collection
 * @property {string|number} collection_id
 * @property {string|number} user_id
 * @property {string} name
 * @property {string} [description]
 * @property {string} [created_at]
 * @property {boolean} is_archived
 * @property {string[]} [tags]
 * @property {Array<string|number>} [outfitIds]
 */

function getStoredUser() {
  try {
    const raw = window.localStorage.getItem('ootdUser')
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

const COLLECTION_TAG_OPTIONS = ['Travel', 'Work', 'Weekend', 'Holiday', 'Daily', 'Event', 'Seasonal']

function CollectionsPage() {
  const navigate = useNavigate()
  const [collections, setCollections] = useState(/** @type {Collection[]} */ ([]))
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [showForm, setShowForm] = useState(false)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [tagSelection, setTagSelection] = useState([])
  const [saving, setSaving] = useState(false)

  const user = getStoredUser()

  useEffect(() => {
    async function loadCollections() {
      setLoading(true)
      setError('')
      try {
        const data = await apiGet('/collections')
        const mapped = (data || []).map((c) => ({
          ...c,
          is_archived: Boolean(c.is_archived),
          tags: c.tags || [],
          outfitIds: c.outfitIds || [],
        }))
        setCollections(mapped)
      } catch (err) {
        setError(err.message || 'Could not load collections')
      } finally {
        setLoading(false)
      }
    }

    loadCollections()
  }, [])

  const canSave = useMemo(() => {
    return !!name.trim() && !saving
  }, [name, saving])

  function toggleTag(tag) {
    setTagSelection((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    )
  }

  function resetForm() {
    setName('')
    setDescription('')
    setTagSelection([])
    setSaving(false)
  }

  async function handleCreateCollection(e) {
    e.preventDefault()
    if (!user || !canSave) return

    setSaving(true)
    setError('')
    try {
      const payload = {
        user_id: user.id,
        name: name.trim(),
        description,
      }
      const created = await apiPost('/collections', payload)

      const now = new Date().toISOString()
      const enriched = {
        ...created,
        created_at: created.created_at || now,
        is_archived: false,
        tags: [...tagSelection],
        outfitIds: [],
      }

      setCollections((prev) => [enriched, ...prev])
      resetForm()
      setShowForm(false)
    } catch (err) {
      setError(err.message || 'Could not create collection')
      setSaving(false)
    }
  }

  function handleOpenCollection(collection) {
    navigate(`/collections/${collection.collection_id}`, {
      state: { collection },
    })
  }

  const hasCollections = collections && collections.length > 0

  return (
    <div className="page page-scroll">
      <div className="card collections-card">
        <h1>Collections</h1>
        <p className="subtitle">
          Curated playlists of outfits for trips, seasons, and special events.
        </p>

        {error && <p className="error-text">{error}</p>}

        <div className="collections-header-row">
          <button
            type="button"
            onClick={() => setShowForm((v) => !v)}
            className="collections-create-btn"
          >
            {showForm ? 'Cancel' : 'Create Collection'}
          </button>
        </div>

        {showForm && (
          <div className="collections-form-card">
            <form onSubmit={handleCreateCollection} className="form collections-form">
              <label>Name</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Summer in Italy"
                required
              />

              <label>Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                placeholder="Light linens, sundresses, and sandals for warm evenings."
              />

              <label>Tags</label>
              <div className="tag-chip-row">
                {COLLECTION_TAG_OPTIONS.map((tag) => {
                  const active = tagSelection.includes(tag)
                  return (
                    <button
                      key={tag}
                      type="button"
                      className={'tag-chip' + (active ? ' tag-chip-active' : '')}
                      onClick={() => toggleTag(tag)}
                    >
                      {tag}
                    </button>
                  )
                })}
              </div>

              <div className="collections-form-actions">
                <button
                  type="button"
                  className="collections-cancel-btn"
                  onClick={() => {
                    resetForm()
                    setShowForm(false)
                  }}
                >
                  Cancel
                </button>
                <button type="submit" disabled={!canSave}>
                  {saving ? 'Saving…' : 'Save Collection'}
                </button>
              </div>
            </form>
          </div>
        )}

        {!loading && !hasCollections && !showForm && (
          <div className="collections-empty">
            <p className="collections-empty-title">You dont have any collections yet.</p>
            <p className="collections-empty-subtitle">
              Create your first collectionthink of it like a playlist for your clothes.
            </p>
            <div className="collections-empty-hint">
              <span className="collections-empty-arrow">↑</span>
              <span>Tap Create Collection to get started.</span>
            </div>
          </div>
        )}

        {loading && <p>Loading</p>}

        {!loading && hasCollections && (
          <div className="collections-grid">
            {collections.map((c) => (
              <CollectionCard
                key={c.collection_id}
                collection={c}
                onOpen={() => handleOpenCollection(c)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function CollectionCard({ collection, onOpen }) {
  const { name, description, tags, outfitIds } = collection

  const outfitCount = outfitIds?.length || 0
  const summary = outfitCount === 0 ? 'No outfits yet' : `${outfitCount} outfit${
    outfitCount === 1 ? '' : 's'
  }`

  return (
    <article className="collection-card" onClick={onOpen}>
      <div className="collection-media">
        <div className="collection-media-strip">
          <div className="collection-media-tile" />
          <div className="collection-media-tile" />
          <div className="collection-media-tile" />
        </div>
      </div>
      <div className="collection-body">
        <div className="collection-header">
          <h3>{name}</h3>
          <span className="collection-count">{summary}</span>
        </div>
        {description && (
          <p className="collection-description">
            {description.length > 80 ? description.slice(0, 77) + '…' : description}
          </p>
        )}
        {tags && tags.length > 0 && (
          <div className="collection-tags">
            {tags.map((tag) => (
              <span key={tag} className="tag-chip tag-chip-soft">
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </article>
  )
}

export default CollectionsPage

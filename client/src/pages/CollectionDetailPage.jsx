import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { apiGet } from '../apiClient'
import OutfitCard from '../components/OutfitCard.jsx'

function useSavedOutfits() {
  const [outfits, setOutfits] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function load() {
      setLoading(true)
      setError('')
      try {
        const data = await apiGet('/outfits')
        setOutfits(data || [])
      } catch (err) {
        setError(err.message || 'Could not load outfits')
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [])

  return { outfits, loading, error }
}

function CollectionDetailPage() {
  const { collectionId } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const { outfits: savedOutfits, loading: loadingOutfits } = useSavedOutfits()

  // Initial collection from navigation state if present
  const stateCollection = location.state?.collection

  const [collection, setCollection] = useState(() => {
    if (!stateCollection) {
      return {
        collection_id: collectionId,
        name: 'Collection',
        description: '',
        created_at: '',
        is_archived: false,
        tags: [],
        outfitIds: [],
      }
    }
    return {
      ...stateCollection,
      is_archived: Boolean(stateCollection.is_archived),
      tags: stateCollection.tags || [],
      outfitIds: stateCollection.outfitIds || [],
    }
  })

  const [editing, setEditing] = useState(false)
  const [draftName, setDraftName] = useState(collection.name)
  const [draftDescription, setDraftDescription] = useState(collection.description || '')
  const [draftTags, setDraftTags] = useState(collection.tags || [])

  const [selecting, setSelecting] = useState(false)
  const [selectedIds, setSelectedIds] = useState([])

  const outfitsInCollection = useMemo(() => {
    if (!collection.outfitIds || collection.outfitIds.length === 0) return []
    return savedOutfits.filter((o) => collection.outfitIds.includes(o.outfit_id))
  }, [collection.outfitIds, savedOutfits])

  function toggleTag(tag) {
    setDraftTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    )
  }

  function handleSaveMeta() {
    setCollection((prev) => ({
      ...prev,
      name: draftName.trim() || prev.name,
      description: draftDescription,
      tags: [...draftTags],
    }))
    setEditing(false)
  }

  function handleToggleArchive() {
    setCollection((prev) => ({ ...prev, is_archived: !prev.is_archived }))
  }

  function toggleSelectOutfit(id) {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    )
  }

  function handleAddSelected() {
    setCollection((prev) => ({
      ...prev,
      outfitIds: Array.from(new Set([...(prev.outfitIds || []), ...selectedIds])),
    }))
    setSelecting(false)
    setSelectedIds([])
  }

  function handleRemoveFromCollection(id) {
    setCollection((prev) => ({
      ...prev,
      outfitIds: (prev.outfitIds || []).filter((x) => x !== id),
    }))
  }

  const outfitCount = collection.outfitIds?.length || 0
  const createdLabel = collection.created_at
    ? new Date(collection.created_at).toLocaleDateString()
    : ''

  const COLLECTION_TAG_OPTIONS = ['Travel', 'Work', 'Weekend', 'Holiday', 'Daily', 'Event', 'Seasonal']

  return (
    <div className="page page-scroll">
      <div className="card collection-detail-card">
        <button
          type="button"
          className="collection-back-btn"
          onClick={() => navigate('/collections')}
        >
          ← Back to Collections
        </button>

        {editing ? (
          <div className="collection-detail-header-edit">
            <input
              value={draftName}
              onChange={(e) => setDraftName(e.target.value)}
              className="collection-detail-name-input"
            />
            <textarea
              value={draftDescription}
              onChange={(e) => setDraftDescription(e.target.value)}
              rows={2}
              className="collection-detail-desc-input"
            />
            <div className="tag-chip-row">
              {COLLECTION_TAG_OPTIONS.map((tag) => {
                const active = draftTags.includes(tag)
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
            <div className="collection-detail-edit-actions">
              <button
                type="button"
                className="collections-cancel-btn"
                onClick={() => setEditing(false)}
              >
                Cancel
              </button>
              <button type="button" onClick={handleSaveMeta}>
                Save
              </button>
            </div>
          </div>
        ) : (
          <div className="collection-detail-header">
            <div className="collection-detail-title-row">
              <h1>{collection.name}</h1>
              {collection.is_archived && <span className="collection-pill">Archived</span>}
            </div>
            {collection.description && (
              <p className="collection-detail-description">{collection.description}</p>
            )}
            {collection.tags && collection.tags.length > 0 && (
              <div className="collection-tags">
                {collection.tags.map((tag) => (
                  <span key={tag} className="tag-chip tag-chip-soft">
                    {tag}
                  </span>
                ))}
              </div>
            )}
            <p className="collection-detail-meta">
              {createdLabel && <>Created on {createdLabel} · </>}
              {outfitCount === 0 ? 'No outfits' : `${outfitCount} outfit${
                outfitCount === 1 ? '' : 's'
              }`}
            </p>
            <div className="collection-detail-actions">
              <button
                type="button"
                className="collection-secondary-btn"
                onClick={() => setEditing(true)}
              >
                Edit collection
              </button>
              <button
                type="button"
                className="collection-secondary-btn"
                onClick={handleToggleArchive}
              >
                {collection.is_archived ? 'Unarchive' : 'Archive'}
              </button>
            </div>
          </div>
        )}

        <div className="collection-detail-toolbar">
          <button
            type="button"
            className="collection-primary-btn"
            onClick={() => setSelecting(true)}
          >
            Add outfits to this collection
          </button>
        </div>

        {selecting && (
          <div className="collection-select-panel">
            <div className="collection-select-header">
              <h2>Select outfits</h2>
              <button
                type="button"
                className="collections-cancel-btn"
                onClick={() => {
                  setSelecting(false)
                  setSelectedIds([])
                }}
              >
                Close
              </button>
            </div>
            {loadingOutfits && <p>Loading outfits</p>}
            {!loadingOutfits && savedOutfits.length === 0 && (
              <p className="collection-select-empty">
                No saved outfits yet. Save some looks on the Outfits page first.
              </p>
            )}
            {!loadingOutfits && savedOutfits.length > 0 && (
              <div className="collection-select-grid">
                {savedOutfits.map((o) => {
                  const checked = selectedIds.includes(o.outfit_id)
                  return (
                    <label key={o.outfit_id} className="collection-select-item">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleSelectOutfit(o.outfit_id)}
                      />
                      <span className="collection-select-thumb" />
                      <span className="collection-select-text">{o.name}</span>
                    </label>
                  )
                })}
              </div>
            )}
            <div className="collection-detail-edit-actions">
              <button
                type="button"
                className="collections-cancel-btn"
                onClick={() => {
                  setSelecting(false)
                  setSelectedIds([])
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={selectedIds.length === 0}
                onClick={handleAddSelected}
              >
                Add selected outfits
              </button>
            </div>
          </div>
        )}

        <h2>Outfits in this collection</h2>
        {outfitsInCollection.length === 0 ? (
          <div className="collections-empty">
            <p className="collections-empty-title">This collection is empty.</p>
            <p className="collections-empty-subtitle">
              Add outfits from your saved looks to start building this playlist.
            </p>
            <button
              type="button"
              className="collection-primary-btn"
              onClick={() => setSelecting(true)}
            >
              Add outfits
            </button>
          </div>
        ) : (
          <div className="collections-outfit-grid">
            {outfitsInCollection.map((o) => (
              <div key={o.outfit_id} className="collection-outfit-wrapper">
                <OutfitCard outfit={o} variant="saved" />
                <button
                  type="button"
                  className="collection-remove-btn"
                  onClick={() => handleRemoveFromCollection(o.outfit_id)}
                >
                  Remove from collection
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default CollectionDetailPage

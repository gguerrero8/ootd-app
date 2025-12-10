import { useEffect, useMemo, useState } from 'react'
import { apiGet, apiPost } from '../apiClient'

/**
 * @typedef {Object} ClothingItem
 * @property {number} item_id
 * @property {string} name
 * @property {string} category
 * @property {string} color
 * @property {string} season
 * @property {string} primary_image_url
 * @property {number} warmth_level
 * @property {string} formality
 * @property {string[]} [tags]
 */

function getStoredUser() {
  try {
    const raw = window.localStorage.getItem('ootdUser')
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

const CATEGORY_OPTIONS = ['top', 'pants', 'dress', 'outerwear', 'shoes', 'accessory', 'other']
const COLOR_OPTIONS = ['white', 'black', 'gray', 'blue', 'green', 'red', 'yellow', 'brown', 'beige', 'pink', 'other']
const SEASON_OPTIONS = ['spring', 'summer', 'fall', 'winter', 'all-season']
const WARMTH_OPTIONS = [1, 2, 3, 4, 5]
const FORMALITY_OPTIONS = ['casual', 'smart casual', 'business casual', 'business formal', 'formal']
const TAG_OPTIONS = ['sporty', 'minimal', 'trendy', 'vintage', 'streetwear', 'classic', 'night out', 'date night']

function ClosetPage() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [submitError, setSubmitError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [imagePreviewUrl, setImagePreviewUrl] = useState('')

  const [form, setForm] = useState({
    name: '',
    category: '',
    color: '',
    season: '',
    warmth_level: '',
    formality: '',
    tags: [],
    imageFile: null,
  })

  const [fieldErrors, setFieldErrors] = useState({})

  const user = getStoredUser()

  useEffect(() => {
    async function loadItems() {
      setLoading(true)
      setError('')
      try {
        const data = await apiGet('/clothing')
        setItems(data || [])
      } catch (err) {
        setError(err.message || 'Could not load clothing items')
      } finally {
        setLoading(false)
      }
    }

    loadItems()
  }, [])

  function updateField(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }))
    setFieldErrors((prev) => ({ ...prev, [field]: '' }))
    if (field === 'imageFile') {
      if (value) {
        const url = URL.createObjectURL(value)
        setImagePreviewUrl(url)
      } else {
        setImagePreviewUrl('')
      }
    }
  }

  function toggleTag(tag) {
    setForm((prev) => {
      const exists = prev.tags.includes(tag)
      const tags = exists ? prev.tags.filter((t) => t !== tag) : [...prev.tags, tag]
      return { ...prev, tags }
    })
  }

  function validateForm() {
    const errors = {}
    if (!form.name.trim()) errors.name = 'Name is required'
    if (!form.category) errors.category = 'Category is required'
    if (!form.color) errors.color = 'Color is required'
    if (!form.season) errors.season = 'Season is required'
    if (!form.warmth_level) errors.warmth_level = 'Warmth level is required'
    if (!form.formality) errors.formality = 'Formality is required'
    if (!form.imageFile) errors.imageFile = 'Image is required'
    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  const isAddDisabled = useMemo(() => {
    return (
      submitting ||
      !form.name.trim() ||
      !form.category ||
      !form.color ||
      !form.season ||
      !form.warmth_level ||
      !form.formality ||
      !form.imageFile
    )
  }, [form, submitting])

  async function handleSubmit(e) {
    e.preventDefault()
    if (!user) return

    setSubmitError('')
    if (!validateForm()) return

    setSubmitting(true)
    try {
      const warmthNumber = Number(form.warmth_level)
      const localImageUrl = imagePreviewUrl || (form.imageFile ? URL.createObjectURL(form.imageFile) : '')

      const payload = {
        user_id: user.id,
        name: form.name.trim(),
        category: form.category,
        color: form.color,
        season: form.season,
        primary_image_url: localImageUrl,
        warmth_level: Number.isNaN(warmthNumber) ? null : warmthNumber,
        formality: form.formality,
        tags: form.tags,
      }

      const newItem = await apiPost('/clothing', payload)

      setItems((prev) => [...prev, newItem])

      setForm((prev) => ({
        name: '',
        category: prev.category,
        color: prev.color,
        season: prev.season,
        warmth_level: prev.warmth_level,
        formality: prev.formality,
        tags: prev.tags,
        imageFile: null,
      }))
      setImagePreviewUrl('')
      setFieldErrors({})
    } catch (err) {
      setSubmitError(err.message || 'Could not add item')
    } finally {
      setSubmitting(false)
    }
  }

  function renderEmptyState() {
    if (loading) return null
    if (items && items.length > 0) return null
    return (
      <div className="closet-empty">
        <p className="closet-empty-title">Your closet is empty.</p>
        <p className="closet-empty-subtitle">
          Add your first item to start getting outfit suggestions.
        </p>
        <div className="closet-empty-hint">
          <span className="closet-empty-arrow">↑</span>
          <span>Use the form above to add an item.</span>
        </div>
      </div>
    )
  }

  return (
    <div className="page page-scroll">
      <div className="card closet-card">
        <h1>My Closet</h1>
        <p className="subtitle">Upload and categorize your clothing items.</p>

        {error && <p className="error-text">{error}</p>}

        <form onSubmit={handleSubmit} className="form closet-form">
          <div className="closet-form-grid">
            <div className="closet-field-group">
              <label>Name</label>
              <input
                value={form.name}
                onChange={(e) => updateField('name', e.target.value)}
                required
              />
              {fieldErrors.name && <p className="field-error">{fieldErrors.name}</p>}
            </div>

            <div className="closet-field-group">
              <label>Category</label>
              <select
                value={form.category}
                onChange={(e) => updateField('category', e.target.value)}
                required
              >
                <option value="">Select category</option>
                {CATEGORY_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
              {fieldErrors.category && (
                <p className="field-error">{fieldErrors.category}</p>
              )}
            </div>

            <div className="closet-field-group">
              <label>Color</label>
              <select
                value={form.color}
                onChange={(e) => updateField('color', e.target.value)}
                required
              >
                <option value="">Select color</option>
                {COLOR_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
              {fieldErrors.color && <p className="field-error">{fieldErrors.color}</p>}
            </div>

            <div className="closet-field-group">
              <label>Season</label>
              <select
                value={form.season}
                onChange={(e) => updateField('season', e.target.value)}
                required
              >
                <option value="">Select season</option>
                {SEASON_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
              {fieldErrors.season && <p className="field-error">{fieldErrors.season}</p>}
            </div>

            <div className="closet-field-group">
              <label>Warmth level (1–5)</label>
              <select
                value={form.warmth_level}
                onChange={(e) => updateField('warmth_level', e.target.value)}
                required
              >
                <option value="">Select warmth</option>
                {WARMTH_OPTIONS.map((val) => (
                  <option key={val} value={val}>
                    {val}
                  </option>
                ))}
              </select>
              {fieldErrors.warmth_level && (
                <p className="field-error">{fieldErrors.warmth_level}</p>
              )}
            </div>

            <div className="closet-field-group">
              <label>Formality</label>
              <select
                value={form.formality}
                onChange={(e) => updateField('formality', e.target.value)}
                required
              >
                <option value="">Select formality</option>
                {FORMALITY_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
              {fieldErrors.formality && (
                <p className="field-error">{fieldErrors.formality}</p>
              )}
            </div>

            <div className="closet-field-group closet-tags-group">
              <label>Style / Aesthetic Tags</label>
              <div className="tag-chip-row">
                {TAG_OPTIONS.map((tag) => {
                  const active = form.tags.includes(tag)
                  return (
                    <button
                      key={tag}
                      type="button"
                      className={
                        'tag-chip' + (active ? ' tag-chip-active' : '')
                      }
                      onClick={() => toggleTag(tag)}
                    >
                      {tag}
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="closet-field-group closet-image-group">
              <label>Image upload</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => updateField('imageFile', e.target.files?.[0] || null)}
                required
              />
              {fieldErrors.imageFile && (
                <p className="field-error">{fieldErrors.imageFile}</p>
              )}
              {imagePreviewUrl && (
                <div className="closet-image-preview">
                  <img src={imagePreviewUrl} alt={form.name || 'Preview'} />
                </div>
              )}
            </div>
          </div>

          {submitError && <p className="error-text">{submitError}</p>}

          <button type="submit" disabled={isAddDisabled}>
            {submitting ? 'Adding…' : 'Add Item'}
          </button>
        </form>

        <h2>Wardrobe</h2>

        {loading && <p>Loading…</p>}
        {!loading && items && items.length > 0 && (
          <div className="closet-grid">
            {items.map((item) => (
              <ClosetItemCard key={item.item_id || item.id} item={item} />
            ))}
          </div>
        )}

        {renderEmptyState()}
      </div>
    </div>
  )
}

function ClosetItemCard({ item }) {
  const {
    name,
    category,
    color,
    season,
    primary_image_url,
    warmth_level,
    formality,
    tags,
  } = item

  const warmthLabel = warmth_level ? `Warmth ${warmth_level}/5` : null
  const seasonLabel = season && warmthLabel ? `${season} · ${warmthLabel}` : season || warmthLabel

  return (
    <article className="closet-item-card">
      <div className="closet-item-media">
        {primary_image_url ? (
          <img src={primary_image_url} alt={name} />
        ) : (
          <div className="closet-item-placeholder" />
        )}
      </div>
      <div className="closet-item-body">
        <div className="closet-item-header">
          <h3>{name}</h3>
          <span className="closet-item-chip">{category}</span>
        </div>
        <div className="closet-item-meta">
          <span>{color}</span>
          {seasonLabel && <span>{seasonLabel}</span>}
        </div>
        <div className="closet-item-meta">
          {formality && <span>{formality}</span>}
        </div>
        {tags && tags.length > 0 && (
          <div className="closet-item-tags">
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

export default ClosetPage

import { useEffect, useMemo, useState } from 'react'
import { apiGet, apiPost } from '../apiClient'
import OutfitCard from '../components/OutfitCard.jsx'

/**
 * @typedef {Object} ClothingItem
 * @property {number} item_id
 * @property {string} name
 * @property {string} category
 * @property {string} color
 * @property {string} season
 * @property {string} primary_image_url
 * @property {number} [warmth_level]
 * @property {string} [formality]
 * @property {string[]} [tags]
 */

/**
 * @typedef {Object} Outfit
 * @property {string|number} outfit_id
 * @property {string|number} user_id
 * @property {string} name
 * @property {number} [rating]
 * @property {boolean} is_favorite
 * @property {string} [created_at]
 * @property {string} [last_worn_at]
 * @property {ClothingItem[]} [items]
 * @property {string} [event_type]
 * @property {string} [mood]
 * @property {string} [weather_summary]
 */

function getStoredUser() {
  try {
    const raw = window.localStorage.getItem('ootdUser')
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

const EVENT_OPTIONS = ['casual day', 'class', 'date night', 'client meeting', 'party', 'workout', 'travel', 'other']
const MOOD_OPTIONS = ['comfy', 'trendy', 'bold', 'minimal', 'old-money', 'sporty', 'cozy']

function OutfitsPage() {
  const user = getStoredUser()

  const [activeTab, setActiveTab] = useState('suggestions') // 'suggestions' | 'saved'
  const [savedOutfits, setSavedOutfits] = useState([])
  const [loadingSaved, setLoadingSaved] = useState(true)
  const [error, setError] = useState('')

  // Suggestion controls
  const [eventType, setEventType] = useState('')
  const [temperature, setTemperature] = useState(70) // °F
  const [formalityPreference, setFormalityPreference] = useState('casual') // 'casual' | 'formal'
  const [mood, setMood] = useState('')
  const [suggestions, setSuggestions] = useState([])
  const [generating, setGenerating] = useState(false)

  useEffect(() => {
    async function loadSaved() {
      setLoadingSaved(true)
      setError('')
      try {
        const data = await apiGet('/outfits')
        // Sort by created_at desc if present
        const sorted = [...(data || [])].sort((a, b) => {
          const aDate = a.last_worn_at || a.created_at || 0
          const bDate = b.last_worn_at || b.created_at || 0
          return aDate < bDate ? 1 : -1
        })
        setSavedOutfits(sorted)
      } catch (err) {
        setError(err.message || 'Could not load outfits')
      } finally {
        setLoadingSaved(false)
      }
    }

    loadSaved()
  }, [])

  const canGenerate = useMemo(() => {
    return !!eventType && !!temperature && !generating
  }, [eventType, temperature, generating])

  async function handleGenerateSuggestions(e) {
    e.preventDefault()
    if (!canGenerate) return

    setGenerating(true)

    try {
      // If a real backend suggestions endpoint exists, call it here.
      // For now, simulate suggestions on the client.
      const baseName = eventType === 'date night' ? 'Date Night' : 'Suggested Look'
      const formalityLabel = formalityPreference === 'formal' ? 'Formal' : 'Casual'
      const weatherLabel = `Great for ~${temperature}°F`
      const moodLabel = mood ? mood : null

      const mockItems = [
        {
          item_id: 1,
          name: 'Hero piece',
          category: 'top',
          color: 'black',
          season: 'all-season',
          primary_image_url: '',
        },
      ]

      const now = new Date().toISOString()

      const mockSuggestions = [1, 2, 3].map((n) => ({
        outfit_id: `suggested-${n}-${now}`,
        user_id: user?.id || 'demo',
        name: `${baseName} #${n}`,
        rating: undefined,
        is_favorite: false,
        created_at: now,
        last_worn_at: undefined,
        items: mockItems,
        event_type: eventType,
        mood: moodLabel || undefined,
        weather_summary: `${weatherLabel}, leaning ${formalityLabel.toLowerCase()}`,
      }))

      setSuggestions(mockSuggestions)
    } finally {
      setGenerating(false)
    }
  }

  async function handleSaveSuggested(outfit) {
    if (!user) return
    try {
      // Persist minimal data for now; backend schema only knows basic fields
      const payload = {
        user_id: user.id,
        name: outfit.name,
        rating: outfit.rating ?? null,
        is_favorite: true,
      }
      const saved = await apiPost('/outfits', payload)
      setSavedOutfits((prev) => [saved, ...prev])
    } catch (err) {
      setError(err.message || 'Could not save outfit')
    }
  }

  function handleToggleFavorite(outfit) {
    // For now, just flip favorite in local state (no backend update yet).
    setSavedOutfits((prev) =>
      prev.map((o) =>
        o.outfit_id === outfit.outfit_id ? { ...o, is_favorite: !o.is_favorite } : o,
      ),
    )
  }

  function handleWearToday(outfit) {
    // Stub: mark last_worn_at in local state
    const now = new Date().toISOString()
    setSavedOutfits((prev) =>
      prev.map((o) => (o.outfit_id === outfit.outfit_id ? { ...o, last_worn_at: now } : o)),
    )
  }

  function renderSuggestionsTab() {
    return (
      <div className="outfits-tab">
        <div className="card outfits-panel">
          <form onSubmit={handleGenerateSuggestions} className="form outfits-form">
            <div className="outfits-form-grid">
              <div className="outfits-field-group">
                <label>Event type</label>
                <select
                  value={eventType}
                  onChange={(e) => setEventType(e.target.value)}
                  required
                >
                  <option value="">Select event</option>
                  {EVENT_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>

              <div className="outfits-field-group">
                <label>Temperature (°F)</label>
                <div className="outfits-temp-row">
                  <input
                    type="range"
                    min="30"
                    max="100"
                    value={temperature}
                    onChange={(e) => setTemperature(Number(e.target.value))}
                  />
                  <span className="outfits-temp-value">{temperature}°</span>
                </div>
              </div>

              <div className="outfits-field-group">
                <label>Formality</label>
                <div className="outfits-toggle-row">
                  <button
                    type="button"
                    className={
                      'toggle-pill' +
                      (formalityPreference === 'casual' ? ' toggle-pill-active' : '')
                    }
                    onClick={() => setFormalityPreference('casual')}
                  >
                    More casual
                  </button>
                  <button
                    type="button"
                    className={
                      'toggle-pill' +
                      (formalityPreference === 'formal' ? ' toggle-pill-active' : '')
                    }
                    onClick={() => setFormalityPreference('formal')}
                  >
                    More formal
                  </button>
                </div>
              </div>

              <div className="outfits-field-group outfits-mood-group">
                <label>Mood</label>
                <div className="tag-chip-row">
                  {MOOD_OPTIONS.map((m) => {
                    const active = mood === m
                    return (
                      <button
                        key={m}
                        type="button"
                        className={'tag-chip' + (active ? ' tag-chip-active' : '')}
                        onClick={() => setMood(active ? '' : m)}
                      >
                        {m}
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>

            <button type="submit" disabled={!canGenerate}>
              {generating ? 'Generating…' : 'Generate Outfit Suggestions'}
            </button>
          </form>
        </div>

        <div className="outfits-suggestions">
          {suggestions.length === 0 ? (
            <div className="outfits-empty">
              <p className="outfits-empty-title">No suggestions yet.</p>
              <p className="outfits-empty-subtitle">
                Adjust the controls above and tap “Generate Outfit Suggestions”.
              </p>
              <div className="outfits-empty-hint">
                <span className="outfits-empty-arrow">↑</span>
                <span>Start with an event and temperature.</span>
              </div>
            </div>
          ) : (
            <div className="outfits-grid">
              {suggestions.map((outfit) => (
                <OutfitCard
                  key={outfit.outfit_id}
                  outfit={outfit}
                  variant="suggested"
                  onSave={handleSaveSuggested}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    )
  }

  function renderSavedTab() {
    return (
      <div className="outfits-tab">
        {loadingSaved && <p>Loading saved outfits…</p>}
        {!loadingSaved && savedOutfits.length === 0 && (
          <div className="outfits-empty">
            <p className="outfits-empty-title">No saved outfits yet.</p>
            <p className="outfits-empty-subtitle">
              Generate suggestions or create an outfit to start your collection.
            </p>
          </div>
        )}

        {!loadingSaved && savedOutfits.length > 0 && (
          <div className="outfits-grid">
            {savedOutfits.map((outfit) => (
              <OutfitCard
                key={outfit.outfit_id}
                outfit={outfit}
                variant="saved"
                onToggleFavorite={handleToggleFavorite}
                onWearToday={handleWearToday}
              />
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="page page-scroll">
      <div className="card outfits-card">
        <h1>Outfits</h1>
        <p className="subtitle">Generate smart suggestions or browse your saved looks.</p>

        {error && <p className="error-text">{error}</p>}

        <div className="outfits-tabs">
          <button
            type="button"
            className={
              'outfits-tab-btn' + (activeTab === 'suggestions' ? ' outfits-tab-btn-active' : '')
            }
            onClick={() => setActiveTab('suggestions')}
          >
            Suggestions
          </button>
          <button
            type="button"
            className={
              'outfits-tab-btn' + (activeTab === 'saved' ? ' outfits-tab-btn-active' : '')
            }
            onClick={() => setActiveTab('saved')}
          >
            Saved Outfits
          </button>
        </div>

        {activeTab === 'suggestions' ? renderSuggestionsTab() : renderSavedTab()}
      </div>
    </div>
  )
}

export default OutfitsPage

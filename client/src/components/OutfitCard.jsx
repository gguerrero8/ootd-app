function formatDate(dateString) {
  if (!dateString) return 'Not worn yet'
  try {
    const date = new Date(dateString)
    return date.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  } catch {
    return 'Not worn yet'
  }
}

function renderRating(rating) {
  if (!rating) return null
  const max = 5
  const fullStars = Math.round(Math.min(Math.max(rating, 0), max))
  const stars = '★'.repeat(fullStars).padEnd(max, '☆')
  return <span className="outfit-rating">{stars}</span>
}

function OutfitCard({ outfit, variant, onSave, onToggleFavorite, onWearToday }) {
  const {
    name,
    items,
    event_type,
    mood,
    weather_summary,
    last_worn_at,
    rating,
    is_favorite,
  } = outfit

  const primaryImage = items && items[0] && items[0].primary_image_url

  const moodLabel = mood || null

  return (
    <article className="outfit-card">
      <div className="outfit-media">
        {primaryImage ? (
          <img src={primaryImage} alt={name} />
        ) : (
          <div className="outfit-placeholder" />
        )}
      </div>
      <div className="outfit-body">
        <div className="outfit-header">
          <h3>{name}</h3>
          {renderRating(rating)}
        </div>
        <div className="outfit-meta">
          {event_type && <span>{event_type}</span>}
          {weather_summary && <span>{weather_summary}</span>}
        </div>
        <div className="outfit-meta">
          <span>Last worn: {formatDate(last_worn_at)}</span>
        </div>
        {moodLabel && (
          <div className="outfit-tags">
            <span className="tag-chip tag-chip-soft">{moodLabel}</span>
          </div>
        )}

        <div className="outfit-actions">
          {variant === 'suggested' && (
            <button
              type="button"
              className="outfit-action-primary"
              onClick={() => onSave && onSave(outfit)}
            >
              Save Outfit
            </button>
          )}

          {variant === 'saved' && (
            <>
              <button
                type="button"
                className={
                  'outfit-fav-btn' + (is_favorite ? ' outfit-fav-btn-active' : '')
                }
                onClick={() => onToggleFavorite && onToggleFavorite(outfit)}
                aria-label={is_favorite ? 'Unfavorite outfit' : 'Favorite outfit'}
              >
                ♥
              </button>
              <button
                type="button"
                className="outfit-action-secondary"
                onClick={() => onWearToday && onWearToday(outfit)}
              >
                Wear today
              </button>
            </>
          )}
        </div>
      </div>
    </article>
  )
}

export default OutfitCard

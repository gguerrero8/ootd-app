import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { apiGet } from '../apiClient'
import OutfitCard from '../components/OutfitCard.jsx'
import WeatherBanner from '../components/WeatherBanner.jsx'

function getStoredUser() {
  try {
    const raw = window.localStorage.getItem('ootdUser')
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function useSavedOutfits() {
  const [outfits, setOutfits] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        const data = await apiGet('/outfits')
        setOutfits(data || [])
      } catch {
        setOutfits([])
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [])

  return { outfits, loading }
}

function useCollections() {
  const [collections, setCollections] = useState([])

  useEffect(() => {
    async function load() {
      try {
        const data = await apiGet('/collections')
        setCollections(data || [])
      } catch {
        setCollections([])
      }
    }

    load()
  }, [])

  return { collections }
}

function getMockWeather() {
  return {
    cityName: 'San Diego, CA',
    temperature: 72,
    description: 'Sunny',
    icon: 'sunny',
  }
}

function pickTodaysPicks(outfits, weather) {
  if (!outfits || outfits.length === 0) return []
  const target = weather?.temperature ?? 70
  const withScore = outfits.map((o) => {
    let score = 0
    if (o.is_favorite) score += 2
    if (o.last_worn_at) score += 1
    if (o.weather_summary && typeof o.weather_summary === 'string') {
      const num = parseInt(o.weather_summary.match(/(\d+)/)?.[1] || '0', 10)
      if (num && Math.abs(num - target) <= 10) score += 2
    }
    return { outfit: o, score }
  })

  return withScore
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)
    .map((x) => x.outfit)
}

function pickMostWorn(outfits) {
  if (!outfits || outfits.length === 0) return []
  // Mock: treat older created_at as more worn; fallback to first few.
  const sorted = [...outfits].sort((a, b) => {
    const aDate = a.created_at || 0
    const bDate = b.created_at || 0
    return aDate > bDate ? 1 : -1
  })
  return sorted.slice(0, 5)
}

function pickEventCollections(collections) {
  if (!collections || collections.length === 0) return []
  return collections.filter((c) => {
    const tags = c.tags || []
    return tags.includes('Travel') || tags.includes('Holiday') || tags.includes('Event')
  })
}

function HomePage() {
  const user = getStoredUser()
  const navigate = useNavigate()

  const weather = getMockWeather()
  const { outfits, loading: loadingOutfits } = useSavedOutfits()
  const { collections } = useCollections()

  const todaysPicks = useMemo(() => pickTodaysPicks(outfits, weather), [outfits, weather])
  const mostWorn = useMemo(() => pickMostWorn(outfits), [outfits])
  const eventCollections = useMemo(() => pickEventCollections(collections), [collections])

  const hasAnyData = outfits.length > 0 || collections.length > 0

  const greeting = user?.display_name || user?.email || 'back'

  return (
    <div className="page page-scroll">
      <div className="card home-card">
        <p className="home-greeting">Good morning, {greeting}</p>

        <WeatherBanner weather={weather} />

        <section className="home-section">
          <div className="home-section-header">
            <h2>Quick actions</h2>
          </div>
          <div className="home-quick-grid">
            <button
              type="button"
              className="home-quick-tile"
              onClick={() => navigate('/closet')}
            >
              <span className="home-quick-icon">＋</span>
              <span className="home-quick-label">Add item</span>
            </button>
            <button
              type="button"
              className="home-quick-tile"
              onClick={() => navigate('/outfits')}
            >
              <span className="home-quick-icon">★</span>
              <span className="home-quick-label">Get suggestion</span>
            </button>
            <button
              type="button"
              className="home-quick-tile"
              onClick={() => navigate('/collections')}
            >
              <span className="home-quick-icon">▢</span>
              <span className="home-quick-label">View collections</span>
            </button>
            <button
              type="button"
              className="home-quick-tile"
              onClick={() => navigate('/community')}
            >
              <span className="home-quick-icon">☰</span>
              <span className="home-quick-label">Browse community</span>
            </button>
          </div>
        </section>

        <section className="home-section">
          <div className="home-section-header">
            <h2>Your looks at a glance</h2>
          </div>

          <CarouselSection
            title="Today's picks"
            emptyTitle="No picks yet."
            emptyBody="Save an outfit from the Outfits tab to see it here."
            onEmptyCtaLabel="Go to Outfits"
            onEmptyCta={() => navigate('/outfits')}
          >
            {loadingOutfits ? (
              <p className="home-carousel-loading">Loading outfits…</p>
            ) : todaysPicks.length === 0 ? (
              <CarouselEmptyMessage
                title="No picks yet."
                body="Save an outfit from the Outfits tab to see it here."
                ctaLabel="Go to Outfits"
                onCta={() => navigate('/outfits')}
              />
            ) : (
              <div className="home-carousel-row">
                {todaysPicks.map((o) => (
                  <div key={o.outfit_id} className="home-carousel-item">
                    <OutfitCard outfit={o} variant="saved" />
                  </div>
                ))}
              </div>
            )}
          </CarouselSection>

          <CarouselSection
            title="Most worn"
            emptyTitle="You haven't logged any wears yet."
            emptyBody="Log outfits you wear to track your favorites."
            onEmptyCtaLabel="Log an outfit"
            onEmptyCta={() => navigate('/outfits')}
          >
            {loadingOutfits ? (
              <p className="home-carousel-loading">Loading outfits…</p>
            ) : mostWorn.length === 0 ? (
              <CarouselEmptyMessage
                title="You haven't logged any wears yet."
                body="Log outfits you wear to track your favorites."
                ctaLabel="Log an outfit"
                onCta={() => navigate('/outfits')}
              />
            ) : (
              <div className="home-carousel-row">
                {mostWorn.map((o) => (
                  <div key={o.outfit_id} className="home-carousel-item">
                    <OutfitCard outfit={o} variant="saved" />
                    <p className="home-mostworn-label">Most worn</p>
                  </div>
                ))}
              </div>
            )}
          </CarouselSection>

          <CarouselSection
            title="Upcoming events"
            emptyTitle="No upcoming events yet."
            emptyBody="Create a collection for your next trip or event to see it here."
            onEmptyCtaLabel="Create a collection"
            onEmptyCta={() => navigate('/collections')}
          >
            {eventCollections.length === 0 ? (
              <CarouselEmptyMessage
                title="No upcoming events yet."
                body="Create a collection for your next trip or event to see it here."
                ctaLabel="Create a collection"
                onCta={() => navigate('/collections')}
              />
            ) : (
              <div className="home-carousel-row">
                {eventCollections.map((c) => (
                  <Link
                    key={c.collection_id}
                    to={`/collections/${c.collection_id}`}
                    className="home-carousel-item home-collection-pill"
                  >
                    <div className="collection-media-strip">
                      <div className="collection-media-tile" />
                      <div className="collection-media-tile" />
                      <div className="collection-media-tile" />
                    </div>
                    <div className="home-collection-pill-body">
                      <p className="home-collection-pill-title">{c.name}</p>
                      <p className="home-collection-pill-subtitle">
                        {(c.tags || []).join(' · ') || 'Event collection'}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CarouselSection>
        </section>

        {!hasAnyData && (
          <section className="home-section home-empty-overview">
            <p className="home-empty-title">New here?</p>
            <p className="home-empty-body">
              Start by adding a few items to your closet. Then save an outfit to see it
              featured here.
            </p>
          </section>
        )}
      </div>
    </div>
  )
}

function CarouselSection({ title, children }) {
  return (
    <div className="home-carousel-section">
      <div className="home-carousel-header">
        <h3>{title}</h3>
      </div>
      {children}
    </div>
  )
}

function CarouselEmptyMessage({ title, body, ctaLabel, onCta }) {
  return (
    <div className="home-carousel-empty">
      <p className="home-carousel-empty-title">{title}</p>
      <p className="home-carousel-empty-body">{body}</p>
      {ctaLabel && onCta && (
        <button
          type="button"
          className="home-carousel-empty-btn"
          onClick={onCta}
        >
          {ctaLabel}
        </button>
      )}
    </div>
  )
}

export default HomePage

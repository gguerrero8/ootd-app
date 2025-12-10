import { useEffect, useMemo, useState } from 'react'
import { apiGet } from '../apiClient'
import PostCard from '../components/PostCard.jsx'
import NewPostModal from '../components/NewPostModal.jsx'

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

/**
 * @typedef {Object} UserSummary
 * @property {string|number} user_id
 * @property {string} display_name
 * @property {string} [avatar_url]
 */

/**
 * @typedef {Object} Post
 * @property {string} post_id
 * @property {string|number} outfit_id
 * @property {string|number} user_id
 * @property {string} caption
 * @property {boolean} is_visible
 * @property {string|Date} created_at
 * @property {Outfit} [outfit]
 * @property {UserSummary} [author]
 * @property {string} [city_name]
 * @property {string[]} [tags]
 * @property {number} [like_count]
 * @property {number} [save_count]
 * @property {number} [comment_count]
 * @property {boolean} [is_liked_by_current_user]
 * @property {boolean} [is_saved_by_current_user]
 */

/**
 * @typedef {Object} Reaction
 * @property {string} reaction_id
 * @property {string} post_id
 * @property {string|number} user_id
 * @property {string} reaction_type // "like" | "save"
 * @property {string|Date} created_at
 */

function getStoredUser() {
  try {
    const raw = window.localStorage.getItem('ootdUser')
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

const COMMUNITY_TAG_OPTIONS = [
  'sporty',
  'minimal',
  'trendy',
  'vintage',
  'date night',
  'office',
  'casual day',
  'travel',
]

const MOCK_AUTHORS = [
  {
    user_id: 'style-maven',
    display_name: 'Style Maven',
    avatar_url:
      'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=80',
  },
  {
    user_id: 'city-chic',
    display_name: 'City Chic',
    avatar_url:
      'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=80',
  },
]

function formatTimeAgo(date) {
  try {
    const d = typeof date === 'string' ? new Date(date) : date
    const diffMs = Date.now() - d.getTime()
    const diffMinutes = Math.floor(diffMs / 60000)
    if (diffMinutes < 1) return 'just now'
    if (diffMinutes < 60) return `${diffMinutes}m ago`
    const diffHours = Math.floor(diffMinutes / 60)
    if (diffHours < 24) return `${diffHours}h ago`
    const diffDays = Math.floor(diffHours / 24)
    if (diffDays < 7) return `${diffDays}d ago`
    return d.toLocaleDateString()
  } catch {
    return ''
  }
}

/**
 * @param {Outfit[]} outfits
 * @returns {Post[]}
 */
function seedPostsFromOutfits(outfits) {
  if (!outfits || outfits.length === 0) return []

  const baseCities = ['San Diego, CA', 'New York, NY', 'Austin, TX']

  return outfits.slice(0, 5).map((outfit, index) => {
    const author = MOCK_AUTHORS[index % MOCK_AUTHORS.length]
    const createdAt = new Date()
    createdAt.setHours(createdAt.getHours() - (index + 1) * 3)

    return {
      post_id: `seed-${outfit.outfit_id}`,
      outfit_id: outfit.outfit_id,
      user_id: author.user_id,
      caption:
        outfit.event_type === 'date night'
          ? 'Date night uniform. Simple, polished, and comfy.'
          : 'Today’s look built around this hero piece.',
      is_visible: true,
      created_at: createdAt.toISOString(),
      outfit,
      author,
      city_name: baseCities[index % baseCities.length],
      tags: outfit.mood ? [outfit.mood] : ['casual day'],
      like_count: 4 + index,
      save_count: 2 + index,
      comment_count: 0,
      is_liked_by_current_user: false,
      is_saved_by_current_user: false,
    }
  })
}

function CommunityPage() {
  const user = getStoredUser()

  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [isNewPostOpen, setIsNewPostOpen] = useState(false)
  const [outfits, setOutfits] = useState([])

  useEffect(() => {
    async function loadFeed() {
      setLoading(true)
      setError('')
      try {
        const data = await apiGet('/outfits')
        const saved = data || []
        setOutfits(saved)
        const seeded = seedPostsFromOutfits(saved)
        setPosts(seeded)
      } catch (err) {
        setError(err.message || 'Could not load community feed')
        setPosts([])
      } finally {
        setLoading(false)
      }
    }

    loadFeed()
  }, [])

  const visiblePosts = useMemo(
    () => posts.filter((p) => p.is_visible !== false),
    [posts],
  )

  function handleCreatePost(input) {
    if (!input || !input.outfit_id || !input.caption) return

    const currentUserSummary = {
      user_id: user?.id || 'you',
      display_name: user?.display_name || user?.email || 'You',
      avatar_url: undefined,
    }

    const outfit = outfits.find((o) => String(o.outfit_id) === String(input.outfit_id))

    const newPost = {
      post_id: `local-${Date.now()}`,
      outfit_id: input.outfit_id,
      user_id: currentUserSummary.user_id,
      caption: input.caption,
      is_visible: input.is_visible ?? true,
      created_at: new Date().toISOString(),
      outfit,
      author: currentUserSummary,
      city_name: input.city_name || 'San Diego, CA',
      tags: input.tags || [],
      like_count: 0,
      save_count: 0,
      comment_count: 0,
      is_liked_by_current_user: false,
      is_saved_by_current_user: false,
    }

    setPosts((prev) => [newPost, ...prev])
    setIsNewPostOpen(false)
  }

  function handleToggleLike(postId) {
    setPosts((prev) =>
      prev.map((p) => {
        if (p.post_id !== postId) return p
        const liked = !p.is_liked_by_current_user
        const likeCount = (p.like_count || 0) + (liked ? 1 : -1)
        return {
          ...p,
          is_liked_by_current_user: liked,
          like_count: likeCount < 0 ? 0 : likeCount,
        }
      }),
    )
  }

  function handleToggleSave(postId) {
    setPosts((prev) =>
      prev.map((p) => {
        if (p.post_id !== postId) return p
        const saved = !p.is_saved_by_current_user
        const saveCount = (p.save_count || 0) + (saved ? 1 : -1)
        return {
          ...p,
          is_saved_by_current_user: saved,
          save_count: saveCount < 0 ? 0 : saveCount,
        }
      }),
    )
  }

  function handleClickComments(postId) {
    // Placeholder for future comments implementation
    // eslint-disable-next-line no-console
    console.log('Comments clicked for post', postId)
  }

  const hasVisiblePosts = visiblePosts.length > 0

  return (
    <div className="page page-scroll">
      <div className="card community-card">
        <div className="community-header-row">
          <div>
            <h1>Community</h1>
            <p className="subtitle">Get inspired by outfits shared by others.</p>
          </div>
          <button
            type="button"
            className="community-newpost-btn"
            onClick={() => setIsNewPostOpen(true)}
          >
            New Post
          </button>
        </div>

        {error && <p className="error-text">{error}</p>}

        {loading && <p>Loading feed…</p>}

        {!loading && !hasVisiblePosts && (
          <div className="community-empty">
            <p className="community-empty-title">Your feed is empty.</p>
            <p className="community-empty-subtitle">
              Share your first outfit or check back as the community grows.
            </p>
            <button
              type="button"
              className="community-empty-cta"
              onClick={() => setIsNewPostOpen(true)}
            >
              Share an outfit
            </button>
          </div>
        )}

        {!loading && hasVisiblePosts && (
          <div className="community-feed">
            {visiblePosts.map((post) => (
              <PostCard
                key={post.post_id}
                post={post}
                formatTimeAgo={formatTimeAgo}
                onLike={handleToggleLike}
                onToggleSave={handleToggleSave}
                onClickComments={handleClickComments}
              />
            ))}
          </div>
        )}
      </div>

      <NewPostModal
        isOpen={isNewPostOpen}
        onClose={() => setIsNewPostOpen(false)}
        outfits={outfits}
        tagsOptions={COMMUNITY_TAG_OPTIONS}
        onCreate={handleCreatePost}
      />
    </div>
  )
}

export default CommunityPage

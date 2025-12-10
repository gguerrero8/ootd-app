function getPrimaryImage(outfit) {
  if (!outfit || !outfit.items || outfit.items.length === 0) return ''
  return outfit.items[0]?.primary_image_url || ''
}

function PostCard({ post, formatTimeAgo, onLike, onToggleSave, onClickComments }) {
  const {
    post_id,
    caption,
    author,
    city_name,
    created_at,
    outfit,
    tags,
    like_count,
    save_count,
    comment_count,
    is_liked_by_current_user,
    is_saved_by_current_user,
  } = post

  const primaryImage = getPrimaryImage(outfit)
  const timeAgo = created_at ? formatTimeAgo(created_at) : ''
  const hasOutfitImage = !!primaryImage

  return (
    <article className="post-card">
      <header className="post-header">
        <div className="post-header-left">
          <div className="post-avatar">
            {author?.avatar_url ? (
              <img src={author.avatar_url} alt={author.display_name || 'User avatar'} />
            ) : (
              <span className="post-avatar-fallback">{author?.display_name?.[0] || 'U'}</span>
            )}
          </div>
          <div className="post-header-text">
            <p className="post-username">{author?.display_name || 'Unknown user'}</p>
            <p className="post-meta">
              {city_name && <span>{city_name}</span>}
              {city_name && timeAgo && <span>·</span>}
              {timeAgo && <span>{timeAgo}</span>}
            </p>
          </div>
        </div>
      </header>

      <div className="post-image-wrapper">
        {hasOutfitImage ? (
          <img
            className="post-image"
            src={primaryImage}
            alt={outfit?.name || 'Outfit image'}
          />
        ) : (
          <div className="post-image-placeholder">
            <span>Outfit unavailable</span>
          </div>
        )}
      </div>

      <section className="post-body">
        {caption && <p className="post-caption">{caption}</p>}

        {tags && tags.length > 0 && (
          <div className="post-tags">
            {tags.map((tag) => (
              <span key={tag} className="post-tag-chip">
                {tag}
              </span>
            ))}
          </div>
        )}

        <div className="post-reactions-row">
          <button
            type="button"
            className={
              'post-reaction-btn' + (is_liked_by_current_user ? ' post-reaction-btn-active' : '')
            }
            onClick={() => onLike && onLike(post_id)}
            aria-label={is_liked_by_current_user ? 'Unlike' : 'Like'}
          >
            <span className="post-reaction-icon">♥</span>
            <span className="post-reaction-count">{like_count || 0}</span>
          </button>

          <button
            type="button"
            className={
              'post-reaction-btn' + (is_saved_by_current_user ? ' post-reaction-btn-active' : '')
            }
            onClick={() => onToggleSave && onToggleSave(post_id)}
            aria-label={is_saved_by_current_user ? 'Unsave' : 'Save'}
          >
            <span className="post-reaction-icon">⭑</span>
            <span className="post-reaction-count">{save_count || 0}</span>
          </button>

          <button
            type="button"
            className="post-reaction-btn"
            onClick={() => onClickComments && onClickComments(post_id)}
            aria-label="Comments"
          >
            <span className="post-reaction-icon">💬</span>
            <span className="post-reaction-count">{comment_count || 0}</span>
          </button>
        </div>
      </section>
    </article>
  )
}

export default PostCard

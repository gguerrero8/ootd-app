import { useEffect, useState } from 'react'

function NewPostModal({ isOpen, onClose, outfits, tagsOptions, onCreate }) {
  const [selectedOutfitId, setSelectedOutfitId] = useState('')
  const [caption, setCaption] = useState('')
  const [selectedTags, setSelectedTags] = useState([])
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    if (isOpen) {
      setSelectedOutfitId('')
      setCaption('')
      setSelectedTags([])
      setIsVisible(true)
    }
  }, [isOpen])

  if (!isOpen) return null

  const hasOutfits = outfits && outfits.length > 0
  const canPost = !!selectedOutfitId && caption.trim().length > 0

  function handleToggleTag(tag) {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    )
  }

  function handleSubmit(e) {
    e.preventDefault()
    if (!canPost) return

    onCreate({
      outfit_id: selectedOutfitId,
      caption: caption.trim(),
      tags: selectedTags,
      is_visible: isVisible,
    })
  }

  function getPrimaryImage(outfit) {
    if (!outfit || !outfit.items || outfit.items.length === 0) return ''
    return outfit.items[0]?.primary_image_url || ''
  }

  return (
    <div className="community-modal-backdrop">
      <div className="community-modal">
        <div className="community-modal-header">
          <h2>New Post</h2>
          <button type="button" className="community-modal-close" onClick={onClose}>
            ✕
          </button>
        </div>

        <form className="form community-modal-form" onSubmit={handleSubmit}>
          <div className="community-modal-section">
            <h3>Select outfit</h3>
            {!hasOutfits && <p>You don&apos;t have any saved outfits yet.</p>}
            {hasOutfits && (
              <div className="community-outfit-grid">
                {outfits.map((outfit) => {
                  const primaryImage = getPrimaryImage(outfit)
                  const isActive = String(selectedOutfitId) === String(outfit.outfit_id)
                  return (
                    <button
                      key={outfit.outfit_id}
                      type="button"
                      className={
                        'community-outfit-tile' + (isActive ? ' community-outfit-tile-active' : '')
                      }
                      onClick={() => setSelectedOutfitId(outfit.outfit_id)}
                    >
                      <div className="community-outfit-thumb">
                        {primaryImage ? (
                          <img src={primaryImage} alt={outfit.name} />
                        ) : (
                          <div className="community-outfit-thumb-placeholder" />
                        )}
                      </div>
                      <div className="community-outfit-text">
                        <p className="community-outfit-name">{outfit.name}</p>
                        {outfit.event_type && (
                          <p className="community-outfit-meta">{outfit.event_type}</p>
                        )}
                      </div>
                    </button>
                  )
                })}
              </div>
            )}
          </div>

          <div className="community-modal-section">
            <h3>Caption</h3>
            <textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="How I styled this for brunch today"
            />
          </div>

          <div className="community-modal-section">
            <h3>Tags</h3>
            <div className="tag-chip-row">
              {tagsOptions.map((tag) => {
                const active = selectedTags.includes(tag)
                return (
                  <button
                    key={tag}
                    type="button"
                    className={'tag-chip' + (active ? ' tag-chip-active' : '')}
                    onClick={() => handleToggleTag(tag)}
                  >
                    {tag}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="community-modal-section">
            <label className="checkbox-row">
              <input
                type="checkbox"
                checked={isVisible}
                onChange={(e) => setIsVisible(e.target.checked)}
              />
              <span>Visible in community feed</span>
            </label>
          </div>

          <div className="community-modal-actions">
            <button
              type="button"
              className="community-modal-cancel"
              onClick={onClose}
            >
              Cancel
            </button>
            <button type="submit" disabled={!canPost || !hasOutfits}>
              Post
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default NewPostModal

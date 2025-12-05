import { Link } from 'react-router-dom'

function getStoredUser() {
  try {
    const raw = window.localStorage.getItem('ootdUser')
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function HomePage() {
  const user = getStoredUser()

  return (
    <div className="page page-center">
      <div className="card">
        <h1>OOTD</h1>
        <h2>Home</h2>
        {user && <p className="subtitle">Welcome, {user.display_name || user.email}</p>}
        <div className="menu-grid">
          <Link className="menu-btn" to="/closet">
            My Closet
          </Link>
          <Link className="menu-btn" to="/outfits">
            Outfits & Suggestions
          </Link>
          <Link className="menu-btn" to="/collections">
            Collections
          </Link>
          <Link className="menu-btn" to="/feed">
            Community Feed
          </Link>
        </div>
      </div>
    </div>
  )
}

export default HomePage

import { Link, useLocation } from 'react-router-dom'

function MainLayout({ children }) {
  const location = useLocation()

  const tabs = [
    { to: '/home', label: 'Home', icon: '⌂' },
    { to: '/closet', label: 'Closet', icon: '👗' },
    { to: '/outfits', label: 'Outfits', icon: '★' },
    { to: '/collections', label: 'Collections', icon: '🗂' },
    { to: '/community', label: 'Community', icon: '☰' },
  ]

  return (
    <div className="main-layout">
      <header className="app-header">
        <Link to="/home" className="app-title">
          OOTD
        </Link>
      </header>

      <main className="app-main">{children}</main>

      <nav className="bottom-nav">
        {tabs.map((tab) => {
          const isActive = location.pathname === tab.to
          return (
            <Link
              key={tab.to}
              to={tab.to}
              className={
                'bottom-nav-item' + (isActive ? ' bottom-nav-item-active' : '')
              }
            >
              <span className="bottom-nav-icon" aria-hidden="true">
                {tab.icon}
              </span>
              <span className="bottom-nav-label">{tab.label}</span>
            </Link>
          )
        })}
      </nav>
    </div>
  )
}

export default MainLayout

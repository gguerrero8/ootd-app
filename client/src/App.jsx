import { Routes, Route, Navigate, Link } from 'react-router-dom'
import './App.css'
import LoginPage from './pages/LoginPage.jsx'
import HomePage from './pages/HomePage.jsx'
import ClosetPage from './pages/ClosetPage.jsx'
import OutfitsPage from './pages/OutfitsPage.jsx'
import CollectionsPage from './pages/CollectionsPage.jsx'
import FeedPage from './pages/FeedPage.jsx'

function getStoredUser() {
  try {
    const raw = window.localStorage.getItem('ootdUser')
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function ProtectedRoute({ children }) {
  const user = getStoredUser()
  if (!user) {
    return <Navigate to="/login" replace />
  }
  return children
}

function App() {
  return (
    <div className="app-root">
      <header className="app-header">
        <Link to="/home" className="app-title">OOTD</Link>
      </header>
      <main className="app-main">
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/home"
            element={
              <ProtectedRoute>
                <HomePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/closet"
            element={
              <ProtectedRoute>
                <ClosetPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/outfits"
            element={
              <ProtectedRoute>
                <OutfitsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/collections"
            element={
              <ProtectedRoute>
                <CollectionsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/feed"
            element={
              <ProtectedRoute>
                <FeedPage />
              </ProtectedRoute>
            }
          />
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </main>
    </div>
  )
}

export default App

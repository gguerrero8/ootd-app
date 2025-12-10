import { Routes, Route, Navigate } from 'react-router-dom'
import './App.css'
import LoginPage from './pages/LoginPage.jsx'
import HomePage from './pages/HomePage.jsx'
import ClosetPage from './pages/ClosetPage.jsx'
import OutfitsPage from './pages/OutfitsPage.jsx'
import CollectionsPage from './pages/CollectionsPage.jsx'
import CollectionDetailPage from './pages/CollectionDetailPage.jsx'
import FeedPage from './pages/FeedPage.jsx'
import CommunityPage from './pages/CommunityPage.jsx'
import MainLayout from './components/MainLayout.jsx'

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
      <Routes>
        {/* Public */}
        <Route
          path="/login"
          element={
            <div className="auth-root">
              <LoginPage />
            </div>
          }
        />

        <Route
          path="/"
          element={
            <ProtectedRoute>
              <MainLayout>
                <HomePage />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/home"
          element={
            <ProtectedRoute>
              <MainLayout>
                <HomePage />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/closet"
          element={
            <ProtectedRoute>
              <MainLayout>
                <ClosetPage />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/outfits"
          element={
            <ProtectedRoute>
              <MainLayout>
                <OutfitsPage />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/collections"
          element={
            <ProtectedRoute>
              <MainLayout>
                <CollectionsPage />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/collections/:collectionId"
          element={
            <ProtectedRoute>
              <MainLayout>
                <CollectionDetailPage />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/feed"
          element={
            <ProtectedRoute>
              <MainLayout>
                <FeedPage />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/community"
          element={
            <ProtectedRoute>
              <MainLayout>
                <CommunityPage />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </div>
  )
}

export default App

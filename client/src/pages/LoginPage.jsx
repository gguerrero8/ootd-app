import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { apiPost } from '../apiClient'

function LoginPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('testuser@example.com')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const result = await apiPost('/login', { email })
      window.localStorage.setItem('ootdUser', JSON.stringify(result.user))
      navigate('/home')
    } catch (err) {
      setError(err.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page page-center">
      <div className="card">
        <h1>OOTD</h1>
        <h2>Login</h2>
        <form onSubmit={handleSubmit} className="form">
          <label>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          {error && <p className="error-text">{error}</p>}
          <button type="submit" disabled={loading}>
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default LoginPage

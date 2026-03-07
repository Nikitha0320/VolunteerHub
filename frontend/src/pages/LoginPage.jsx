import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { loginUser } from '../services/authService'

function LoginPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const payload = {
      email: form.email.trim().toLowerCase(),
      password: form.password.trim()
    }
    try {
      const res = await loginUser(payload)
      localStorage.setItem('token', res.data.token)
      localStorage.setItem('user', JSON.stringify(res.data))
      navigate('/events')
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <form className="card w-full max-w-md space-y-4" onSubmit={handleSubmit}>
        <h2 className="text-2xl font-bold text-center">Login</h2>
        {error && <p className="text-sm text-red-600 text-center">{error}</p>}
        <input className="input" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        <input className="input" placeholder="Password" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
        <button className="btn-primary w-full text-sm py-2" type="submit" disabled={loading}>{loading ? 'Logging in...' : 'Login'}</button>
        <p className="text-sm text-center">No account? <Link className="text-primary" to="/register">Register</Link></p>
      </form>
    </div>
  )
}

export default LoginPage

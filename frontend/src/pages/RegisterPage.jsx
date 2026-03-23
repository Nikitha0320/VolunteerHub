import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { registerUser } from '../services/authService'

function RegisterPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'VOLUNTEER', age: '', phoneNumber: '', address: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const payload = {
      ...form,
      name: form.name.trim(),
      email: form.email.trim().toLowerCase(),
      password: form.password.trim(),
      phoneNumber: form.phoneNumber.trim(),
      address: form.address.trim()
    }
    try {
      await registerUser(payload)
      navigate('/login')
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create account. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <form className="card w-full max-w-md space-y-4" onSubmit={handleSubmit}>
        <h2 className="text-2xl font-bold text-center">Register</h2>
        {error && <p className="text-sm text-red-600 text-center">{error}</p>}
        <input className="input" placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <input className="input" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        <input className="input" type="password" placeholder="Password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
        <select className="input" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
          <option value="VOLUNTEER">Volunteer</option>
          <option value="ORGANIZER">Organizer</option>
        </select>
        {form.role !== 'ADMIN' && (
          <>
            <input className="input" type="number" min="1" placeholder="Age (you can fill later in dashboard)" value={form.age} onChange={(e) => setForm({ ...form, age: e.target.value })} />
            <input className="input" placeholder="Phone Number (you can fill later in dashboard)" value={form.phoneNumber} onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })} />
            <textarea className="input" placeholder="Address (you can fill later in dashboard)" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
          </>
        )}
        <button className="btn-secondary w-full" type="submit" disabled={loading}>{loading ? 'Creating...' : 'Create Account'}</button>
        <p className="text-sm text-center">Already have an account? <Link className="text-primary" to="/login">Login</Link></p>
      </form>
    </div>
  )
}

export default RegisterPage

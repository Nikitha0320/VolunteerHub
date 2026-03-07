import { useEffect, useState } from 'react'
import MainLayout from '../layouts/MainLayout'
import { getMyOrganizerEvents } from '../services/eventService'
import { changePassword, getMyProfile, updateMyProfile } from '../services/userService'

const getApiErrorMessage = (err, fallback) => {
  const data = err?.response?.data
  if (typeof data === 'string' && data.trim()) return data
  if (data?.message) return data.message
  if (data?.error) return data.error
  if (err?.message) return err.message
  return fallback
}

const isAuthFailure = (err) => {
  const status = err?.response?.status
  return status === 401
}

const redirectToLogin = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
  window.location.href = '/login'
}

function OrganizerDashboard() {
  const [events, setEvents] = useState([])
  const [profile, setProfile] = useState(null)
  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [profileForm, setProfileForm] = useState({ age: '', phoneNumber: '', address: '' })
  const [profileMessage, setProfileMessage] = useState('')
  const isProfileComplete =
    Number(profile?.age) > 0 &&
    Boolean(profile?.phoneNumber?.toString().trim()) &&
    Boolean(profile?.address?.toString().trim())

  useEffect(() => {
    getMyOrganizerEvents().then((res) => setEvents(res.data))
    getMyProfile()
      .then((res) => {
        setProfile(res.data)
        setProfileForm({
          age: res.data?.age || '',
          phoneNumber: res.data?.phoneNumber || '',
          address: res.data?.address || ''
        })
      })
      .catch((err) => {
        if (isAuthFailure(err)) {
          redirectToLogin()
          return
        }
        const localUser = JSON.parse(localStorage.getItem('user') || '{}')
        setProfile(localUser)
      })
  }, [])

  const onSaveProfile = async (e) => {
    e.preventDefault()
    setProfileMessage('')
    try {
      const payload = { ...profileForm, age: Number(profileForm.age) }
      await updateMyProfile(payload)
      setProfile({ ...profile, ...payload })
      setProfileMessage('Profile details saved.')
    } catch (err) {
      setProfileMessage(err.response?.data?.message || 'Failed to save profile details.')
    }
  }

  const onChangePassword = async (e) => {
    e.preventDefault()
    setMessage('')
    setLoading(true)
    try {
      const res = await changePassword({ oldPassword, newPassword })
      setMessage(res.data.message || 'Password updated.')
      setOldPassword('')
      setNewPassword('')
    } catch (err) {
      if (isAuthFailure(err)) {
        setMessage('Session expired or access denied. Please login again.')
        setTimeout(() => redirectToLogin(), 700)
        return
      }
      if (err?.response?.status === 403) {
        setMessage('You are not allowed to change password from this session. Please login again and retry.')
        return
      }
      setMessage(getApiErrorMessage(err, 'Failed to change password.'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <MainLayout>
      <div className="grid md:grid-cols-2 gap-4 mb-4">
        <div className="card space-y-2">
          <h3 className="text-lg font-semibold">Your Profile</h3>
          <p><strong>Name:</strong> {profile?.name || '-'}</p>
          <p><strong>Email:</strong> {profile?.email || '-'}</p>
          <p><strong>Role:</strong> {profile?.role || '-'}</p>
          <p><strong>Age:</strong> {profile?.age || '-'}</p>
          <p><strong>Phone:</strong> {profile?.phoneNumber || '-'}</p>
          <p><strong>Address:</strong> {profile?.address || '-'}</p>
        </div>

        <div className="card">
          <p className="text-slate-500">Events created</p>
          <h2 className="text-3xl font-bold text-primary">{events.length}</h2>
          <p className="text-slate-500">Upcoming opportunities</p>
          <h2 className="text-3xl font-bold text-secondary">{events.length}</h2>
        </div>
      </div>

      {!isProfileComplete && (
        <form className="card mb-4 space-y-3" onSubmit={onSaveProfile}>
          <h3 className="text-lg font-semibold">Complete Your Details</h3>
          {profileMessage && <p className={`text-sm ${profileMessage.toLowerCase().includes('failed') ? 'text-red-600' : 'text-amber-700'}`}>{profileMessage}</p>}
          <input className="input" type="number" min="1" placeholder="Age" value={profileForm.age} onChange={(e) => setProfileForm({ ...profileForm, age: e.target.value })} required />
          <input className="input" placeholder="Phone Number" value={profileForm.phoneNumber} onChange={(e) => setProfileForm({ ...profileForm, phoneNumber: e.target.value })} required />
          <textarea className="input" placeholder="Address" value={profileForm.address} onChange={(e) => setProfileForm({ ...profileForm, address: e.target.value })} required />
          <button className="btn-secondary" type="submit">Save Details</button>
        </form>
      )}

      <div className="card mb-4">
        <h3 className="text-lg font-semibold mb-3">Your Created Events</h3>
        {events.length === 0 ? (
          <p className="text-sm text-slate-500">No events created yet.</p>
        ) : (
          <div className="space-y-3">
            {events.map((event) => (
              <div key={event.id} className="border border-slate-200 rounded-lg p-3">
                <h4 className="font-semibold">{event.title}</h4>
                <p className="text-sm text-slate-600">Location: {event.location}</p>
                <p className="text-sm text-slate-600">Date: {event.eventDate} | Time: {event.eventTime}</p>
                <p className="text-sm">Max Volunteers: {event.maxVolunteers}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      <form className="card space-y-3" onSubmit={onChangePassword}>
        <h3 className="text-lg font-semibold">Change Password</h3>
        <p className="text-sm text-slate-600">Enter old and new password. If old password is incorrect, a reset request will be sent to admin.</p>
        {message && <p className={`text-sm ${message.toLowerCase().includes('failed') ? 'text-red-600' : 'text-amber-700'}`}>{message}</p>}
        <input
          className="input"
          type="password"
          placeholder="Enter old password"
          value={oldPassword}
          onChange={(e) => setOldPassword(e.target.value)}
          required
        />
        <input
          className="input"
          type="password"
          placeholder="Enter new password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
        />
        <button className="btn-primary" type="submit" disabled={loading}>{loading ? 'Processing...' : 'Update Password'}</button>
      </form>
    </MainLayout>
  )
}

export default OrganizerDashboard

import { useEffect, useState } from 'react'
import { KeyRound, Settings2, UserCircle2 } from 'lucide-react'
import MainLayout from '../layouts/MainLayout'
import { changePassword, getMyProfile, updateMyProfile } from '../services/userService'

const getApiErrorMessage = (err, fallback) => {
  const data = err?.response?.data
  if (typeof data === 'string' && data.trim()) return data
  if (data?.message) return data.message
  if (data?.error) return data.error
  if (err?.message) return err.message
  return fallback
}

const isAuthFailure = (err) => err?.response?.status === 401

const redirectToLogin = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
  window.location.href = '/login'
}

function SettingsPage() {
  const [profile, setProfile] = useState(null)
  const [profileForm, setProfileForm] = useState({ age: '', phoneNumber: '', address: '' })
  const [profileMessage, setProfileMessage] = useState('')

  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [passwordMessage, setPasswordMessage] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
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
        setProfileForm({
          age: localUser?.age || '',
          phoneNumber: localUser?.phoneNumber || '',
          address: localUser?.address || ''
        })
      })
  }, [])

  const onSaveProfile = async (e) => {
    e.preventDefault()
    setProfileMessage('')
    try {
      const payload = { ...profileForm, age: Number(profileForm.age) }
      await updateMyProfile(payload)
      setProfile({ ...profile, ...payload })
      const localUser = JSON.parse(localStorage.getItem('user') || '{}')
      localStorage.setItem('user', JSON.stringify({ ...localUser, ...payload }))
      setProfileMessage('Profile details saved.')
    } catch (err) {
      setProfileMessage(err?.response?.data?.message || 'Failed to save profile details.')
    }
  }

  const onChangePassword = async (e) => {
    e.preventDefault()
    setPasswordMessage('')
    setLoading(true)
    try {
      const res = await changePassword({ oldPassword, newPassword })
      setPasswordMessage(res.data.message || 'Password updated.')
      setOldPassword('')
      setNewPassword('')
    } catch (err) {
      if (isAuthFailure(err)) {
        setPasswordMessage('Session expired or access denied. Please login again.')
        setTimeout(() => redirectToLogin(), 700)
        return
      }
      if (err?.response?.status === 403) {
        setPasswordMessage('You are not allowed to change password from this session. Please login again and retry.')
        return
      }
      setPasswordMessage(getApiErrorMessage(err, 'Failed to change password.'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <MainLayout>
      <div className="card mb-4 space-y-2">
        <h3 className="text-lg font-semibold flex items-center gap-2"><Settings2 size={20} /> Settings</h3>
        <p className="text-sm text-slate-600">Manage your personal details and password.</p>
        <p className="text-sm text-slate-500">Signed in as: {profile?.name || 'User'} ({profile?.role || '-'})</p>
      </div>

      <form className="card mb-4 space-y-3" onSubmit={onSaveProfile}>
        <h3 className="text-lg font-semibold flex items-center gap-2"><UserCircle2 size={19} /> Update Personal Details</h3>
        {profileMessage && <p className={`text-sm ${profileMessage.toLowerCase().includes('failed') ? 'text-red-600' : 'text-amber-700'}`}>{profileMessage}</p>}
        <input className="input" type="number" min="1" placeholder="Age" value={profileForm.age} onChange={(e) => setProfileForm({ ...profileForm, age: e.target.value })} required />
        <input className="input" placeholder="Phone Number" value={profileForm.phoneNumber} onChange={(e) => setProfileForm({ ...profileForm, phoneNumber: e.target.value })} required />
        <textarea className="input" placeholder="Address" value={profileForm.address} onChange={(e) => setProfileForm({ ...profileForm, address: e.target.value })} required />
        <button className="btn-secondary text-sm py-2 px-4" type="submit">Save Details</button>
      </form>

      <form className="card space-y-3" onSubmit={onChangePassword}>
        <h3 className="text-lg font-semibold flex items-center gap-2"><KeyRound size={19} /> Change Password</h3>
        <p className="text-sm text-slate-600">Enter old and new password. If old password is incorrect, a reset request will be sent to admin.</p>
        {passwordMessage && <p className={`text-sm ${passwordMessage.toLowerCase().includes('failed') ? 'text-red-600' : 'text-amber-700'}`}>{passwordMessage}</p>}
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
        <button className="btn-primary text-sm py-2 px-4" type="submit" disabled={loading}>{loading ? 'Processing...' : 'Update Password'}</button>
      </form>
    </MainLayout>
  )
}

export default SettingsPage

import { useEffect, useMemo, useState } from 'react'
import { Activity, CheckCircle2, Sparkles, UserCircle2 } from 'lucide-react'
import MainLayout from '../layouts/MainLayout'
import { getJoinedEvents } from '../services/eventService'
import { getMyProfile } from '../services/userService'

const isAuthFailure = (err) => err?.response?.status === 401

const redirectToLogin = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
  window.location.href = '/login'
}

const getEventDateTime = (item) => {
  const eventDate = item?.event?.eventDate
  const eventTime = item?.event?.eventTime
  if (!eventDate || !eventTime) return null
  const normalizedTime = eventTime.length === 5 ? `${eventTime}:00` : eventTime
  const parsed = new Date(`${eventDate}T${normalizedTime}`)
  return Number.isNaN(parsed.getTime()) ? null : parsed
}

function ProfilePage() {
  const [profile, setProfile] = useState(null)
  const [joined, setJoined] = useState([])
  const [joinedError, setJoinedError] = useState('')

  useEffect(() => {
    getMyProfile()
      .then((res) => setProfile(res.data))
      .catch((err) => {
        if (isAuthFailure(err)) {
          redirectToLogin()
          return
        }
        const localUser = JSON.parse(localStorage.getItem('user') || '{}')
        setProfile(localUser)
      })

    getJoinedEvents()
      .then((res) => setJoined(Array.isArray(res.data) ? res.data : []))
      .catch((err) => {
        if (isAuthFailure(err)) {
          redirectToLogin()
          return
        }
        setJoined([])
        setJoinedError(err?.response?.data?.message || 'Failed to load joined events.')
      })
  }, [])

  const stats = useMemo(() => {
    const now = new Date()
    const totalJoined = joined.length
    const completed = joined.filter((item) => {
      const byStatus = (item?.status || '').toUpperCase() === 'COMPLETED'
      const dateTime = getEventDateTime(item)
      const byDate = dateTime ? dateTime < now : false
      return byStatus || byDate
    }).length
    const active = Math.max(totalJoined - completed, 0)

    return { totalJoined, completed, active }
  }, [joined])

  return (
    <MainLayout>
      <div className="grid md:grid-cols-2 gap-4 mb-4">
        <div className="card space-y-2">
          <h3 className="text-lg font-semibold flex items-center gap-2"><UserCircle2 size={20} /> Your Profile</h3>
          <p><strong>Name:</strong> {profile?.name || '-'}</p>
          <p><strong>Email:</strong> {profile?.email || '-'}</p>
          <p><strong>Role:</strong> {profile?.role || '-'}</p>
          <p><strong>Age:</strong> {profile?.age || '-'}</p>
          <p><strong>Phone:</strong> {profile?.phoneNumber || '-'}</p>
          <p><strong>Address:</strong> {profile?.address || '-'}</p>
        </div>

        <div className="card">
          <p className="text-slate-500 flex items-center gap-2"><Sparkles size={16} /> Events joined</p>
          <h2 className="text-3xl font-bold text-secondary">{stats.totalJoined}</h2>
          <p className="text-slate-500 mt-3 flex items-center gap-2"><CheckCircle2 size={16} /> Completed events</p>
          <h2 className="text-2xl font-bold text-primary">{stats.completed}</h2>
          <p className="text-slate-500 mt-3 flex items-center gap-2"><Activity size={16} /> Currently active joins</p>
          <h2 className="text-2xl font-bold text-amber-700">{stats.active}</h2>
        </div>
      </div>

      <div className="card">
        <h3 className="text-lg font-semibold mb-3">Joined Events</h3>
        {joinedError && <p className="text-sm text-red-600 mb-2">{joinedError}</p>}
        {joined.length === 0 ? (
          <p className="text-sm text-slate-500">You have not joined any events yet.</p>
        ) : (
          <div className="space-y-3">
            {joined.map((item) => (
              <div key={item.id} className="border border-slate-200 rounded-lg p-3">
                <h4 className="font-semibold">{item.event?.title}</h4>
                <p className="text-sm text-slate-600">Location: {item.event?.location}</p>
                <p className="text-sm text-slate-600">Date: {item.event?.eventDate} | Time: {item.event?.eventTime}</p>
                <p className="text-sm">Role: {item.role?.roleName} | Status: {item.status}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  )
}

export default ProfilePage

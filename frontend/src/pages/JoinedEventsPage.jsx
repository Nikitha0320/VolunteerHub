import { useEffect, useState } from 'react'
import MainLayout from '../layouts/MainLayout'
import { cancelParticipation, getJoinedEvents } from '../services/eventService'

function JoinedEventsPage() {
  const [joined, setJoined] = useState([])
  const [error, setError] = useState('')

  const load = async () => {
    setError('')
    try {
      const res = await getJoinedEvents()
      setJoined(Array.isArray(res.data) ? res.data : [])
    } catch (err) {
      setJoined([])
      setError(err.response?.data?.message || 'Failed to load joined events.')
    }
  }

  useEffect(() => {
    load()
  }, [])

  const onCancel = async (eventId) => {
    await cancelParticipation(eventId)
    load()
  }

  return (
    <MainLayout>
      <div className="space-y-3">
        {error && <p className="text-sm text-red-600">{error}</p>}
        {!error && joined.length === 0 && <p className="text-sm text-slate-500">You have not joined any events yet.</p>}
        {joined.map((item) => (
          <div key={item.id} className="card flex items-center justify-between">
            <div>
              <h3 className="font-semibold">{item.event?.title}</h3>
              <p className="text-sm text-slate-600">Role: {item.role?.roleName}</p>
              <p className="text-sm">Status: {item.status}</p>
            </div>
            {item.status === 'JOINED' && (
              <button className="text-red-600 hover:underline" onClick={() => onCancel(item.event?.id)}>Cancel</button>
            )}
          </div>
        ))}
      </div>
    </MainLayout>
  )
}

export default JoinedEventsPage

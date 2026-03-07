import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import MainLayout from '../layouts/MainLayout'
import VolunteerRoleSelector from '../components/VolunteerRoleSelector'
import VolunteerTable from '../components/VolunteerTable'
import { getEventById, getEventParticipants, getEventRoles, getJoinedEvents, joinEvent } from '../services/eventService'

function EventDetailsPage() {
  const { id } = useParams()
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  const [event, setEvent] = useState(null)
  const [roles, setRoles] = useState([])
  const [selectedRoleId, setSelectedRoleId] = useState('')
  const [joinMessage, setJoinMessage] = useState('')
  const [joinLoading, setJoinLoading] = useState(false)
  const [alreadyJoined, setAlreadyJoined] = useState(false)
  const [participants, setParticipants] = useState([])
  const eventDescription = event?.description || event?.details || 'No details provided.'

  const loadRoles = () => getEventRoles(id).then((res) => setRoles(res.data))

  useEffect(() => {
    getEventById(id).then((res) => setEvent(res.data))
    loadRoles()
    if (user.role === 'VOLUNTEER') {
      getJoinedEvents().then((res) => {
        const isJoined = res.data.some((item) => item.event?.id === Number(id) && item.status === 'JOINED' && item.event?.cancelled !== true)
        setAlreadyJoined(isJoined)
      })
    }
    if (user.role === 'ORGANIZER' || user.role === 'ADMIN') {
      getEventParticipants(id).then((res) => setParticipants(res.data))
    }
  }, [id])

  const onJoin = async () => {
    if (!selectedRoleId) {
      setJoinMessage('Please select a volunteer role before joining.')
      return
    }
    setJoinMessage('')
    setJoinLoading(true)
    try {
      await joinEvent({ eventId: Number(id), roleId: Number(selectedRoleId) })
      const joinedRes = await getJoinedEvents()
      const isJoined = joinedRes.data.some((item) => item.event?.id === Number(id) && item.status === 'JOINED' && item.event?.cancelled !== true)
      setAlreadyJoined(isJoined)
      setJoinMessage('Joined event successfully.')
      loadRoles()
    } catch (err) {
      setJoinMessage(err.response?.data?.message || 'Unable to join event. Please try again.')
    } finally {
      setJoinLoading(false)
    }
  }

  if (!event) return <MainLayout><p>Loading...</p></MainLayout>

  return (
    <MainLayout>
      <div className="card space-y-3">
        <h2 className="text-2xl font-bold">{event.title}</h2>
        <p>{eventDescription}</p>
        <p><strong>Location:</strong> {event.location}</p>
        <p><strong>Date:</strong> {event.eventDate}</p>
        <p><strong>Time:</strong> {event.eventTime}</p>
        {event.cancelled && <p className="text-red-600 font-medium">This event is cancelled. {event.cancellationReason || ''}</p>}

        <VolunteerRoleSelector roles={roles} selectedRoleId={selectedRoleId} onChange={setSelectedRoleId} />
        {joinMessage && (
          <p className={`text-sm ${joinMessage.toLowerCase().includes('success') ? 'text-amber-700' : 'text-red-600'}`}>{joinMessage}</p>
        )}

        {user.role === 'VOLUNTEER' && (
          <button className="btn-primary" onClick={onJoin} disabled={joinLoading || alreadyJoined || roles.length === 0 || event.cancelled}>
            {alreadyJoined ? 'Already Joined' : joinLoading ? 'Joining...' : 'Join Event'}
          </button>
        )}

        {(user.role === 'ORGANIZER' || user.role === 'ADMIN') && <VolunteerTable participants={participants} />}
      </div>
    </MainLayout>
  )
}

export default EventDetailsPage

import { useEffect, useState } from 'react'
import MainLayout from '../layouts/MainLayout'
import { getAllEvents, getEventMessages, getMyOrganizerEvents, postEventMessage } from '../services/eventService'

function EventMessagesPage() {
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  const [events, setEvents] = useState([])
  const [postEventId, setPostEventId] = useState('')
  const [messagesByEvent, setMessagesByEvent] = useState([])
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [postStatus, setPostStatus] = useState('')

  useEffect(() => {
    loadAllEventMessages()
  }, [])

  const loadAllEventMessages = async () => {
    setLoading(true)
    setError('')
    try {
      const eventsRes = user.role === 'ORGANIZER' ? await getMyOrganizerEvents() : await getAllEvents()
      const eventList = Array.isArray(eventsRes.data) ? eventsRes.data : []
      setEvents(eventList)
      if (!postEventId && eventList.length > 0) {
        setPostEventId(String(eventList[0].id))
      }

      const allMessages = await Promise.all(
        eventList.map(async (event) => {
          try {
            const messagesRes = await getEventMessages(event.id)
            return {
              event,
              messages: Array.isArray(messagesRes.data) ? messagesRes.data : []
            }
          } catch {
            return {
              event,
              messages: []
            }
          }
        })
      )

      setMessagesByEvent(allMessages)
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load event messages.')
      setEvents([])
      setMessagesByEvent([])
    } finally {
      setLoading(false)
    }
  }

  const onPost = async (e) => {
    e.preventDefault()
    setPostStatus('')
    if (!postEventId || !message.trim()) return

    try {
      await postEventMessage(postEventId, { message: message.trim() })
      setMessage('')
      setPostStatus('Announcement posted successfully.')
      await loadAllEventMessages()
    } catch (err) {
      setPostStatus(err?.response?.data?.message || 'Failed to post announcement.')
    }
  }

  return (
    <MainLayout>
      <div className="space-y-4">
        {user.role === 'ORGANIZER' && (
          <form className="card space-y-3" onSubmit={onPost}>
            <h3 className="text-lg font-semibold">Post Announcement</h3>
            {postStatus && (
              <p className={`text-sm ${postStatus.toLowerCase().includes('failed') ? 'text-red-600' : 'text-amber-700'}`}>
                {postStatus}
              </p>
            )}
            <select className="input" value={postEventId} onChange={(e) => setPostEventId(e.target.value)} required>
              <option value="">Choose Event</option>
              {events.map((event) => (
                <option key={event.id} value={event.id}>{event.title}</option>
              ))}
            </select>
            <textarea className="input" value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Write event update..." />
            <button className="btn-primary" type="submit">Post Message</button>
          </form>
        )}

        <div className="card">
          <h3 className="text-lg font-semibold mb-3">Announcements by Event</h3>
          {error && <p className="text-sm text-red-600 mb-3">{error}</p>}
          {loading && <p className="text-sm text-slate-500">Loading messages...</p>}

          {!loading && messagesByEvent.length === 0 && (
            <p className="text-sm text-slate-500">No events found.</p>
          )}

          {!loading && messagesByEvent.length > 0 && (
            <div className="space-y-4">
              {messagesByEvent.map(({ event, messages: eventMessages }) => (
                <section key={event.id} className="border border-slate-200 rounded-xl p-4 bg-white/70">
                  <h4 className="font-semibold text-slate-800">{event.title}</h4>
                  <p className="text-sm text-slate-500 mt-1">{event.location}</p>

                  <div className="space-y-2 mt-3">
                    {eventMessages.length === 0 && (
                      <p className="text-sm text-slate-500">No messages for this event.</p>
                    )}
                    {eventMessages.map((msg) => (
                      <div key={msg.id} className="border border-slate-200 rounded-lg p-3 bg-white">
                        <p className="text-sm text-slate-700">{msg.message}</p>
                        <p className="text-xs text-slate-500 mt-1">{msg.createdAt}</p>
                      </div>
                    ))}
                  </div>
                </section>
              ))}
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  )
}

export default EventMessagesPage

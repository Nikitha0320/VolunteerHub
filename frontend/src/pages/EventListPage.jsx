import { useEffect, useState } from 'react'
import MainLayout from '../layouts/MainLayout'
import EventCard from '../components/EventCard'
import { cancelEvent, deleteEvent, getAllEvents, getMyOrganizerEvents, updateEvent } from '../services/eventService'
import { Search } from 'lucide-react'

function EventListPage() {
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  const [events, setEvents] = useState([])
  const [editingEvent, setEditingEvent] = useState(null)
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [cancelReason, setCancelReason] = useState('')
  const [searchInput, setSearchInput] = useState('')

  const [form, setForm] = useState({
    title: '',
    description: '',
    location: '',
    eventDate: '',
    eventTime: '',
    maxVolunteers: 1
  })

  const loadEvents = () => {
    const loader = user.role === 'ORGANIZER' ? getMyOrganizerEvents : getAllEvents
    loader().then((res) => setEvents(res.data))
  }

  const clearFilters = () => {
    setSearchInput('')
  }

  const normalizedSearch = searchInput.trim().toLowerCase()

  const filteredEvents = events.filter((event) => {
    const searchTarget = `${event.title || ''} ${event.description || ''} ${event.details || ''} ${event.location || ''}`.toLowerCase()
    const matchesSearch = !normalizedSearch || searchTarget.includes(normalizedSearch)
    return matchesSearch
  })

  useEffect(() => {
    loadEvents()
  }, [])

  const onEditClick = (event) => {
    setMessage('')
    setEditingEvent(event)
    setForm({
      title: event.title || '',
      description: event.description || event.details || '',
      location: event.location || '',
      eventDate: event.eventDate || '',
      eventTime: (event.eventTime || '').slice(0, 5),
      maxVolunteers: event.maxVolunteers || 1
    })
  }

  const onUpdate = async (e) => {
    e.preventDefault()
    if (!editingEvent) return
    setMessage('')
    setLoading(true)
    try {
      await updateEvent(editingEvent.id, { ...form, maxVolunteers: Number(form.maxVolunteers) })
      setMessage('Event updated successfully. Reminder message sent to registered volunteers.')
      setEditingEvent(null)
      loadEvents()
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to update event.')
    } finally {
      setLoading(false)
    }
  }

  const onCancelEvent = async () => {
    if (!editingEvent) return
    setMessage('')
    setLoading(true)
    try {
      await cancelEvent(editingEvent.id, { reason: cancelReason })
      setMessage('Event cancelled and cancellation notice sent to volunteers.')
      setEditingEvent(null)
      setCancelReason('')
      loadEvents()
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to cancel event.')
    } finally {
      setLoading(false)
    }
  }

  const onDeleteEvent = async () => {
    if (!editingEvent) return
    const confirmed = window.confirm('Are you sure you want to permanently delete this event?')
    if (!confirmed) return

    setMessage('')
    setLoading(true)
    try {
      await deleteEvent(editingEvent.id)
      setMessage('Event deleted successfully.')
      setEditingEvent(null)
      setCancelReason('')
      loadEvents()
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to delete event.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <MainLayout>
      <section className="space-y-5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <h2 className="text-3xl md:text-4xl font-semibold text-slate-800">Upcoming Events</h2>
          <div className="relative w-full md:max-w-[520px]">
            <div className="relative">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                className="w-full min-w-0 rounded-lg border border-slate-200 bg-[#F1F5F9] py-3 pr-3 pl-11 text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-300"
                placeholder="Search events..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />
            </div>
          </div>
        </div>

        {searchInput && (
          <div className="flex justify-end">
            <button
              type="button"
              className="text-base text-slate-500 hover:text-slate-800 underline underline-offset-2"
              onClick={clearFilters}
            >
              Clear search
            </button>
          </div>
        )}

      {(user.role === 'ORGANIZER' || user.role === 'ADMIN') && editingEvent && (
        <form className="card rounded-2xl shadow-md mb-6 space-y-4 p-6" onSubmit={onUpdate}>
          <h3 className="text-xl font-semibold text-slate-800">Edit Event</h3>
          <input className="input" placeholder="Title" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <textarea className="input" placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <input className="input" placeholder="Location" required value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
          <input className="input" type="date" required value={form.eventDate} onChange={(e) => setForm({ ...form, eventDate: e.target.value })} />
          <input className="input" type="time" required value={form.eventTime} onChange={(e) => setForm({ ...form, eventTime: e.target.value })} />
          <input className="input" type="number" min="1" required value={form.maxVolunteers} onChange={(e) => setForm({ ...form, maxVolunteers: e.target.value })} />
          <div className="flex gap-2">
            <button className="bg-rose-700 hover:bg-rose-800 text-white px-4 py-2 rounded-lg shadow-sm hover:shadow transition-all duration-200" type="submit" disabled={loading}>{loading ? 'Updating...' : 'Update Event'}</button>
            <button className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-lg shadow-sm hover:shadow transition-all duration-200" type="button" onClick={() => setEditingEvent(null)}>Cancel</button>
          </div>

          <div className="border-t border-slate-200 pt-4 mt-2 space-y-3">
            <h4 className="text-lg font-semibold text-red-600">Cancel Event</h4>
            <textarea className="input" placeholder="Cancellation reason (optional)" value={cancelReason} onChange={(e) => setCancelReason(e.target.value)} />
            <div className="flex gap-2">
              <button className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 shadow-sm hover:shadow transition-all duration-200" type="button" onClick={onCancelEvent} disabled={loading}>
                {loading ? 'Processing...' : 'Cancel This Event'}
              </button>
              <button className="px-4 py-2 rounded-lg bg-red-800 text-white hover:bg-red-900 shadow-sm hover:shadow transition-all duration-200" type="button" onClick={onDeleteEvent} disabled={loading}>
                {loading ? 'Processing...' : 'Delete This Event'}
              </button>
            </div>
          </div>
        </form>
      )}

      {message && <p className={`mb-4 text-sm ${message.toLowerCase().includes('failed') ? 'text-red-600' : 'text-amber-700'}`}>{message}</p>}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {filteredEvents.length === 0 && (
          <div className="card rounded-2xl shadow-sm p-5 text-gray-600 col-span-full">No events found for the current search.</div>
        )}

        {filteredEvents.map((event) => (
          <EventCard
            key={event.id}
            event={event}
            showEdit={user.role === 'ORGANIZER' || user.role === 'ADMIN'}
            onEdit={onEditClick}
          />
        ))}
      </div>
      </section>
    </MainLayout>
  )
}

export default EventListPage

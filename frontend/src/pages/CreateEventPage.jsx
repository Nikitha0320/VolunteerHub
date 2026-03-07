import { useState } from 'react'
import MainLayout from '../layouts/MainLayout'
import { addEventRole, createEvent } from '../services/eventService'

function CreateEventPage() {
  const [eventForm, setEventForm] = useState({
    title: '', description: '', location: '', eventDate: '', eventTime: '', maxVolunteers: 10
  })
  const [roleForm, setRoleForm] = useState({ roleName: '', roleDescription: '', volunteersRequired: 1 })
  const [eventId, setEventId] = useState(null)
  const [totalRoles, setTotalRoles] = useState(1)
  const [rolesAdded, setRolesAdded] = useState(0)
  const [eventMessage, setEventMessage] = useState('')
  const [roleMessage, setRoleMessage] = useState('')
  const [eventLoading, setEventLoading] = useState(false)
  const [roleLoading, setRoleLoading] = useState(false)

  const isEventFormValid =
    eventForm.title.trim() &&
    eventForm.location.trim() &&
    eventForm.eventDate &&
    eventForm.eventTime &&
    Number(eventForm.maxVolunteers) > 0

  const canAddMoreRoles = rolesAdded < Number(totalRoles)

  const onCreateEvent = async (e) => {
    e.preventDefault()
    setEventMessage('')
    setRoleMessage('')
    setEventLoading(true)
    try {
      const res = await createEvent({ ...eventForm, maxVolunteers: Number(eventForm.maxVolunteers) })
      setEventId(res.data.id)
      setRolesAdded(0)
      setEventMessage(`Event created successfully. Add ${totalRoles} role(s) one by one.`)
    } catch (err) {
      setEventMessage(err.response?.data?.message || 'Failed to create event. Please fill all required fields.')
    } finally {
      setEventLoading(false)
    }
  }

  const onAddRole = async (e) => {
    e.preventDefault()
    setRoleMessage('')
    if (!eventId) {
      setRoleMessage('Create an event first, then add roles.')
      return
    }
    if (!canAddMoreRoles) {
      setRoleMessage('All selected roles are already added.')
      return
    }
    setRoleLoading(true)
    try {
      await addEventRole(eventId, { ...roleForm, volunteersRequired: Number(roleForm.volunteersRequired) })
      setRoleForm({ roleName: '', roleDescription: '', volunteersRequired: 1 })
      const nextCount = rolesAdded + 1
      setRolesAdded(nextCount)
      setRoleMessage(
        nextCount >= Number(totalRoles)
          ? `Role ${nextCount}/${totalRoles} added. All roles completed.`
          : `Role ${nextCount}/${totalRoles} added. Add next role.`
      )
    } catch (err) {
      setRoleMessage(err.response?.data?.message || 'Failed to add role. Please check the inputs.')
    } finally {
      setRoleLoading(false)
    }
  }

  return (
    <MainLayout>
      <div className="grid lg:grid-cols-2 gap-4">
        <form className="card space-y-3" onSubmit={onCreateEvent}>
          <h2 className="text-xl font-semibold">Create Event</h2>
          {eventMessage && (
            <p className={`text-sm ${eventId ? 'text-amber-700' : 'text-red-600'}`}>{eventMessage}</p>
          )}
          <input className="input" placeholder="Title" required value={eventForm.title} onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })} />
          <textarea className="input" placeholder="Description" value={eventForm.description} onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })} />
          <input className="input" placeholder="Location" required value={eventForm.location} onChange={(e) => setEventForm({ ...eventForm, location: e.target.value })} />
          <input className="input" type="date" required value={eventForm.eventDate} onChange={(e) => setEventForm({ ...eventForm, eventDate: e.target.value })} />
          <input className="input" type="time" required value={eventForm.eventTime} onChange={(e) => setEventForm({ ...eventForm, eventTime: e.target.value })} />
          <input className="input" type="number" min="1" placeholder="Max Volunteers" required value={eventForm.maxVolunteers} onChange={(e) => setEventForm({ ...eventForm, maxVolunteers: e.target.value })} />
          <button className="btn-primary" type="submit" disabled={eventLoading || !isEventFormValid}>{eventLoading ? 'Creating...' : 'Create Event'}</button>
        </form>

        <form className="card space-y-3" onSubmit={onAddRole}>
          <h2 className="text-xl font-semibold">Add Volunteer Roles</h2>
          {roleMessage && (
            <p className={`text-sm ${roleMessage.toLowerCase().includes('success') ? 'text-amber-700' : 'text-red-600'}`}>{roleMessage}</p>
          )}
          <div>
            <label className="text-sm font-medium">Number of Roles</label>
            <input
              className="input mt-1"
              type="number"
              min="1"
              value={totalRoles}
              onChange={(e) => setTotalRoles(e.target.value)}
              disabled={!!eventId}
            />
            <p className="text-xs text-slate-500 mt-1">
              {eventId ? `Added ${rolesAdded} of ${totalRoles}` : 'Choose how many roles you want to add before creating event.'}
            </p>
          </div>
          <input className="input" placeholder="Role Name" required value={roleForm.roleName} onChange={(e) => setRoleForm({ ...roleForm, roleName: e.target.value })} />
          <textarea className="input" placeholder="Role Description" value={roleForm.roleDescription} onChange={(e) => setRoleForm({ ...roleForm, roleDescription: e.target.value })} />
          <input className="input" type="number" min="1" placeholder="Volunteers Required" required value={roleForm.volunteersRequired} onChange={(e) => setRoleForm({ ...roleForm, volunteersRequired: e.target.value })} />
          <button className="btn-secondary" type="submit" disabled={!eventId || roleLoading || !canAddMoreRoles}>{roleLoading ? 'Adding...' : 'Add Role'}</button>
        </form>
      </div>
    </MainLayout>
  )
}

export default CreateEventPage

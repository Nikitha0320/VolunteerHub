import api from './api'

const pickFirstNonEmpty = (...values) => {
	for (const value of values) {
		if (typeof value === 'string' && value.trim()) return value
		if (value !== null && value !== undefined && typeof value !== 'string') return value
	}
	return ''
}

const unwrapEventPayload = (payload) => {
	if (!payload || typeof payload !== 'object') return payload
	if (payload.event && typeof payload.event === 'object') {
		return { ...payload.event, ...payload }
	}
	return payload
}

const normalizeEvent = (rawEvent) => {
	const event = unwrapEventPayload(rawEvent) || {}
	return {
		...event,
		description: pickFirstNonEmpty(
			event.description,
			event.details,
			event.eventDescription,
			event.event_description,
			event.eventDetails,
			event.event_details
		)
	}
}

const normalizeEventListResponse = (res) => ({
	...res,
	data: Array.isArray(res.data) ? res.data.map(normalizeEvent) : []
})

const normalizeSingleEventResponse = (res) => ({
	...res,
	data: normalizeEvent(res.data)
})

export const getAllEvents = () => api.get('/events').then(normalizeEventListResponse)
export const getEventById = (id) => api.get(`/events/${id}`).then(normalizeSingleEventResponse)
export const getMyOrganizerEvents = () => api.get('/events/organizer/my').then(normalizeEventListResponse)
export const createEvent = (payload) => api.post('/events', {
	...payload,
	details: payload.description ?? payload.details ?? ''
}).then(normalizeSingleEventResponse)
export const updateEvent = (id, payload) => api.put(`/events/${id}`, {
	...payload,
	details: payload.description ?? payload.details ?? ''
}).then(normalizeSingleEventResponse)
export const deleteEvent = (id) => api.delete(`/events/${id}`)
export const cancelEvent = (id, payload) => api.put(`/events/${id}/cancel`, payload)

export const getEventRoles = (eventId) => api.get(`/events/${eventId}/roles`)
export const addEventRole = (eventId, payload) => api.post(`/events/${eventId}/roles`, payload)

export const joinEvent = (payload) => api.post('/participation/join', payload)
export const cancelParticipation = (eventId) => api.put(`/participation/cancel/${eventId}`)
export const getJoinedEvents = () => api.get('/participation/my-events', { params: { _t: Date.now() } })
export const getEventParticipants = (eventId) => api.get(`/participation/event/${eventId}`)

export const getEventMessages = (eventId) => api.get(`/events/${eventId}/messages`)
export const postEventMessage = (eventId, payload) => api.post(`/events/${eventId}/messages`, payload)

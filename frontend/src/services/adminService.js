import api from './api'

export const getAllUsers = () => api.get('/admin/users')
export const deleteUser = (id) => api.delete(`/admin/users/${id}`)
export const getPendingPasswordResetRequests = () => api.get('/admin/password-reset-requests')
export const approvePasswordResetRequest = (id) => api.put(`/admin/password-reset-requests/${id}/approve`)

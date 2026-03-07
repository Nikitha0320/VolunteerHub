import api from './api'

export const getMyProfile = () => api.get('/users/me')
export const requestPasswordReset = (payload) => api.post('/users/password-reset-request', payload)
export const updateMyProfile = (payload) => api.put('/users/me/profile', payload)
export const changePassword = (payload) => api.post('/users/change-password', payload)

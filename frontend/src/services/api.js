import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api'

const api = axios.create({
  baseURL: API_BASE_URL
})

api.interceptors.request.use((config) => {
  const requestUrl = config.url || ''
  const isAuthRoute = requestUrl.includes('/auth/')

  // Do not send bearer token while calling login/register endpoints.
  if (isAuthRoute) {
    return config
  }

  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export default api

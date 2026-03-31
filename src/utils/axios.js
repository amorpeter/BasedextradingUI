import axios from 'axios'
import { API_URL } from './apiUrl.js'

// Log API configuration in development
if (import.meta.env.DEV) {
  console.log('🔧 API Configuration:', {
    baseURL: API_URL || '(empty - using Vite proxy)',
    mode: import.meta.env.MODE,
    viteApiUrl: import.meta.env.VITE_API_URL || '(not set)'
  })
}

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true // Include cookies
})

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Handle 401 errors (unauthorized)
// Must send admin/subadmin UI to /admin/signin — not /signin — or admin routes appear "broken"
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      const path = window.location.pathname || ''
      const isAdminArea =
        path.startsWith('/admin') || path.startsWith('/subadmin')
      window.location.href = isAdminArea ? '/admin/signin' : '/signin'
    }
    return Promise.reject(error)
  }
)

export default api







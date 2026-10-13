import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Attach JWT automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Central place to translate backend errors into friendly messages.
export function getErrorMessage(error) {
  const status = error?.response?.status

  if (!error?.response) {
    return 'Unable to reach the server. Please check your connection.'
  }

  switch (status) {
    case 400:
      return error.response?.data?.message || 'Please check the information you entered.'
    case 401:
      return 'Your session has expired. Please log in again.'
    case 403:
      return 'You do not have permission to perform this action.'
    case 404:
      return 'The requested resource could not be found.'
    case 500:
      return 'Something went wrong. Please try again.'
    default:
      return error.response?.data?.message || 'Something went wrong. Please try again.'
  }
}

// Handle 401 globally: clear auth state and send the user back to login.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      if (!window.location.pathname.startsWith('/login')) {
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

export default api

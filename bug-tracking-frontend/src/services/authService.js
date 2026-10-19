import api from './api'

export async function login(email, password) {
  const res = await api.post('/api/auth/login', { email, password })
  return res.data
}

export async function register(name, email, password) {
  const res = await api.post('/api/auth/register', { name, email, password })
  return res.data
}

export async function getCurrentUser() {
  const res = await api.get('/api/auth/me')
  return res.data
}

import api from './api'

export async function getUsers() {
  const res = await api.get('/api/users')
  return res.data
}

export async function getDevelopers() {
  const res = await api.get('/api/users/developers')
  return res.data
}

export async function updateUserRole(id, role) {
  const res = await api.put(`/api/users/${id}/role`, { role })
  return res.data
}

import api from './api'

export async function getBugs(params = {}) {
  const res = await api.get('/api/bugs', { params })
  return res.data
}

export async function getBugById(id) {
  const res = await api.get(`/api/bugs/${id}`)
  return res.data
}

export async function createBug(payload) {
  const res = await api.post('/api/bugs', payload)
  return res.data
}

export async function updateBug(id, payload) {
  const res = await api.put(`/api/bugs/${id}`, payload)
  return res.data
}

export async function deleteBug(id) {
  const res = await api.delete(`/api/bugs/${id}`)
  return res.data
}

export async function assignBug(id, assigned_to) {
  const res = await api.put(`/api/bugs/${id}/assign`, { assigned_to })
  return res.data
}

export async function updateBugStatus(id, status) {
  const res = await api.put(`/api/bugs/${id}/status`, { status })
  return res.data
}

export async function getBugHistory(id) {
  const res = await api.get(`/api/bugs/${id}/history`)
  return res.data
}

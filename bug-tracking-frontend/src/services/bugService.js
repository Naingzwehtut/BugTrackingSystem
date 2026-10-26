import api, { unwrap } from './api'
import { normalizeBug, normalizeHistoryEntry } from './mappers'

// Every function resolves to the plain data the UI needs (a bug, an array...)
// rather than the raw response envelope, so pages never poke at `res.data.data`.

export async function getBugs(params = {}, { signal } = {}) {
  const { bugs = [] } = unwrap(await api.get('/api/bugs', { params, signal }))
  return bugs.map(normalizeBug)
}

export async function getBugById(id, { signal } = {}) {
  return normalizeBug(unwrap(await api.get(`/api/bugs/${id}`, { signal })).bug)
}

export async function createBug(payload) {
  return normalizeBug(unwrap(await api.post('/api/bugs', payload)).bug)
}

export async function updateBug(id, payload) {
  return normalizeBug(unwrap(await api.put(`/api/bugs/${id}`, payload)).bug)
}

export async function deleteBug(id) {
  await api.delete(`/api/bugs/${id}`)
}

export async function assignBug(id, assignedTo) {
  return normalizeBug(unwrap(await api.put(`/api/bugs/${id}/assign`, { assigned_to: assignedTo })).bug)
}

export async function updateBugStatus(id, status) {
  return normalizeBug(unwrap(await api.put(`/api/bugs/${id}/status`, { status })).bug)
}

export async function getBugHistory(id, { signal } = {}) {
  const { history = [] } = unwrap(await api.get(`/api/bugs/${id}/history`, { signal }))
  return history.map(normalizeHistoryEntry)
}

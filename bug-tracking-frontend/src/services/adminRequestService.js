import api, { unwrap } from './api'

export async function requestAdmin(reason) {
  return unwrap(await api.post('/api/admin-requests', { reason })).request
}

// Owner only.
export async function getAdminRequests({ signal } = {}) {
  return unwrap(await api.get('/api/admin-requests', { signal })).requests ?? []
}

export async function decideAdminRequest(id, decision) {
  return unwrap(await api.put(`/api/admin-requests/${id}`, { decision })).request
}

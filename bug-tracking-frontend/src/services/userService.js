import api, { unwrap } from './api'

export async function getUsers({ signal } = {}) {
  return unwrap(await api.get('/api/users', { signal })).users ?? []
}

export async function getDevelopers({ signal } = {}) {
  return unwrap(await api.get('/api/users/developers', { signal })).developers ?? []
}

export async function updateUserRole(id, role) {
  return unwrap(await api.put(`/api/users/${id}/role`, { role })).user
}

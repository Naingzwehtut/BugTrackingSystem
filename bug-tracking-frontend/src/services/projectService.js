import api, { unwrap } from './api'

export async function createProject(name) {
  return unwrap(await api.post('/api/projects', { name })).project
}

export async function joinProject(inviteCode) {
  return unwrap(await api.post('/api/projects/join', { invite_code: inviteCode })).project
}

export async function getCurrentProject({ signal } = {}) {
  return unwrap(await api.get('/api/projects/current', { signal })).project
}

export async function regenerateInviteCode() {
  return unwrap(await api.post('/api/projects/current/invite-code')).project
}

// Owner only: every project with member and bug counts.
export async function getAllProjects({ signal } = {}) {
  return unwrap(await api.get('/api/projects', { signal })).projects ?? []
}

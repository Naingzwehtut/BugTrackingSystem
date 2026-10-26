import api, { unwrap } from './api'

// Session = { user, project, admin_request } (+ token on login).
export async function login(email, password) {
  return unwrap(await api.post('/api/auth/login', { email, password }))
}

/**
 * payload: { name, email, password } plus either
 *   { invite_code }                  join a project as a Tester, or
 *   { request_admin: true, reason }  ask the owners for admin access
 * Resolves to { user, message }.
 */
export async function register(payload) {
  const response = await api.post('/api/auth/register', payload)
  return { ...unwrap(response), message: response.data?.message }
}

export async function getSession({ signal } = {}) {
  return unwrap(await api.get('/api/auth/me', { signal }))
}

export async function updatePreferences(preferences) {
  return unwrap(await api.put('/api/auth/me/preferences', preferences)).user
}

import api, { unwrap } from './api'

// Resolves to { notifications, unread_count }.
export async function getNotifications({ limit = 30, unread = false, signal } = {}) {
  const params = { limit, ...(unread ? { unread: 'true' } : {}) }
  return unwrap(await api.get('/api/notifications', { params, signal }))
}

export async function markNotificationRead(id) {
  return unwrap(await api.put(`/api/notifications/${id}/read`))
}

export async function markAllNotificationsRead() {
  return unwrap(await api.put('/api/notifications/read-all'))
}

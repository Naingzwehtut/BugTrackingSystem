import api from './api'

export async function getComments(bugId) {
  const res = await api.get(`/api/bugs/${bugId}/comments`)
  return res.data
}

export async function addComment(bugId, comment) {
  const res = await api.post(`/api/bugs/${bugId}/comments`, { comment })
  return res.data
}

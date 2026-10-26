import api, { unwrap } from './api'
import { normalizeComment } from './mappers'

export async function getComments(bugId, { signal } = {}) {
  const { comments = [] } = unwrap(await api.get(`/api/bugs/${bugId}/comments`, { signal }))
  return comments.map(normalizeComment)
}

export async function addComment(bugId, comment) {
  return normalizeComment(unwrap(await api.post(`/api/bugs/${bugId}/comments`, { comment })).comment)
}

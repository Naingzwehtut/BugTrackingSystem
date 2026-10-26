import { API_URL } from './api'

/**
 * Parse a Server-Sent Events text stream into { event, data } messages.
 * Exported for unit tests.
 */
export function createSseParser(onMessage) {
  let buffer = ''
  return (chunk) => {
    buffer += chunk.replace(/\r\n/g, '\n')
    let boundary = buffer.indexOf('\n\n')
    while (boundary !== -1) {
      const block = buffer.slice(0, boundary)
      buffer = buffer.slice(boundary + 2)
      let event = 'message'
      const data = []
      for (const line of block.split('\n')) {
        if (line.startsWith(':')) continue // comment / keep-alive
        if (line.startsWith('event:')) event = line.slice(6).trim()
        else if (line.startsWith('data:')) data.push(line.slice(5).trimStart())
      }
      if (data.length > 0) {
        try {
          onMessage({ event, data: JSON.parse(data.join('\n')) })
        } catch {
          // ignore malformed messages
        }
      }
      boundary = buffer.indexOf('\n\n')
    }
  }
}

/**
 * Open the live notification stream (GET /api/notifications/stream).
 *
 * Uses fetch() rather than the browser's EventSource because EventSource
 * can't send an Authorization header, and putting the JWT in the URL would
 * leak it into server logs and browser history.
 *
 * Resolves when the server ends the stream (it does every few minutes, by
 * design); rejects on network errors. `error.status` is set for HTTP errors.
 */
export async function openNotificationStream({ token, signal, onMessage }) {
  const response = await fetch(`${API_URL}/api/notifications/stream`, {
    headers: { Authorization: `Bearer ${token}`, Accept: 'text/event-stream' },
    signal,
    cache: 'no-store',
  })
  if (!response.ok || !response.body) {
    const error = new Error(`Notification stream failed (${response.status})`)
    error.status = response.status
    throw error
  }

  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  const parse = createSseParser(onMessage)
  for (;;) {
    const { value, done } = await reader.read()
    if (done) return
    parse(decoder.decode(value, { stream: true }))
  }
}

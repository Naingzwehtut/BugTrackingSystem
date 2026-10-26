import { describe, expect, it } from 'vitest'
import { createSseParser } from './notificationStream'

describe('createSseParser', () => {
  it('parses events split across chunks and skips keep-alives', () => {
    const messages = []
    const parse = createSseParser((message) => messages.push(message))
    parse('retry: 3000\n\nevent: ready\ndata: {"unread_count": 2}\n\n: keep-alive\n\nevent: notif')
    parse('ication\ndata: {"notification": {"id": "n1"}}\n\n')
    expect(messages).toEqual([
      { event: 'ready', data: { unread_count: 2 } },
      { event: 'notification', data: { notification: { id: 'n1' } } },
    ])
  })

  it('ignores malformed data', () => {
    const messages = []
    createSseParser((message) => messages.push(message))('event: x\ndata: {not json\n\n')
    expect(messages).toEqual([])
  })
})

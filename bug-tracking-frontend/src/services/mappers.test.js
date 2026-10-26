import { describe, expect, it } from 'vitest'
import { normalizeBug, normalizeComment, normalizeHistoryEntry } from './mappers'

describe('mappers', () => {
  it('keeps flat names and falls back to nested ones', () => {
    expect(normalizeBug({ reporter_name: 'A' }).reporter_name).toBe('A')
    expect(normalizeBug({ reporter: { name: 'B' } }).reporter_name).toBe('B')
    expect(normalizeBug({}).assigned_developer_name).toBeNull()
  })

  it('reads comment authors from either shape', () => {
    expect(normalizeComment({ user_name: 'A', user_role: 'tester' })).toMatchObject({ user_name: 'A', user_role: 'tester' })
    expect(normalizeComment({ users: { name: 'B', role: 'admin' } })).toMatchObject({ user_name: 'B', user_role: 'admin' })
    expect(normalizeComment({}).user_name).toBe('Unknown user')
  })

  it('reads history authors from either shape', () => {
    expect(normalizeHistoryEntry({ users: { name: 'C' } }).user_name).toBe('C')
  })
})

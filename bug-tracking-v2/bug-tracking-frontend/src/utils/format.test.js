import { describe, expect, it } from 'vitest'
import { formatBugId, formatRelative, initials } from './format'

const NOW = new Date('2026-03-10T12:00:00Z').getTime()

describe('formatRelative', () => {
  it('describes recent and older times in words', () => {
    expect(formatRelative('2026-03-10T11:59:50Z', NOW)).toBe('just now')
    expect(formatRelative('2026-03-10T11:55:00Z', NOW)).toBe('5 minutes ago')
    expect(formatRelative('2026-03-09T12:00:00Z', NOW)).toBe('yesterday')
    expect(formatRelative('2026-02-24T12:00:00Z', NOW)).toBe('2 weeks ago')
  })

  it('handles missing or invalid dates', () => {
    expect(formatRelative(null, NOW)).toBe('—')
    expect(formatRelative('not a date', NOW)).toBe('—')
  })
})

describe('formatBugId / initials', () => {
  it('shortens ids and builds avatar initials', () => {
    expect(formatBugId('1a2b3c4d-0000-0000-0000-000000000000')).toBe('#1a2b3c4d')
    expect(formatBugId(null)).toBe('—')
    expect(initials('Aye Mya Admin')).toBe('AA')
    expect(initials('kyaw')).toBe('K')
    expect(initials('  ')).toBe('?')
  })
})

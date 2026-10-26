import { describe, expect, it } from 'vitest'
import { computeBugStats, getRecentBugs } from './bugStats'

const bugs = [
  { id: 1, status: 'Open', priority: 'High', created_at: '2026-01-01' },
  { id: 2, status: 'Open', priority: 'Low', created_at: '2026-01-03' },
  { id: 3, status: 'Closed', priority: 'High', created_at: '2026-01-02' },
]

describe('computeBugStats', () => {
  it('counts by status and priority in one pass', () => {
    const stats = computeBugStats(bugs)
    expect(stats.total).toBe(3)
    expect(stats.byStatus.Open).toBe(2)
    expect(stats.byStatus.Reopened).toBe(0)
    expect(stats.byPriority.High).toBe(2)
  })

  it('handles an empty list', () => {
    expect(computeBugStats().total).toBe(0)
  })
})

describe('getRecentBugs', () => {
  it('returns newest first without mutating the input', () => {
    expect(getRecentBugs(bugs, 2).map((b) => b.id)).toEqual([2, 3])
    expect(bugs[0].id).toBe(1)
  })
})

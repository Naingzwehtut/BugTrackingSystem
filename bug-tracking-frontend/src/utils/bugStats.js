import { BUG_STATUSES, BUG_PRIORITIES } from './constants'

// Derives dashboard statistics from the bug list the API already returned.
// No fake/invented data - everything here is a count over real records.
export function computeBugStats(bugs = []) {
  const byStatus = Object.fromEntries(BUG_STATUSES.map((s) => [s, 0]))
  const byPriority = Object.fromEntries(BUG_PRIORITIES.map((p) => [p, 0]))

  for (const bug of bugs) {
    if (bug.status in byStatus) byStatus[bug.status] += 1
    if (bug.priority in byPriority) byPriority[bug.priority] += 1
  }

  return {
    total: bugs.length,
    byStatus,
    byPriority,
  }
}

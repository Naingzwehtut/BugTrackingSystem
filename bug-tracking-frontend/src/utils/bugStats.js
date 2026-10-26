import { PRIORITY_LIST, STATUS_LIST } from '@/config/constants'

// Derives dashboard numbers from the bug list the API already returned,
// in a single pass (instead of one .filter() per status per render).
export function computeBugStats(bugs = []) {
  const byStatus = Object.fromEntries(STATUS_LIST.map((s) => [s, 0]))
  const byPriority = Object.fromEntries(PRIORITY_LIST.map((p) => [p, 0]))

  for (const bug of bugs) {
    if (bug.status in byStatus) byStatus[bug.status] += 1
    if (bug.priority in byPriority) byPriority[bug.priority] += 1
  }
  return { total: bugs.length, byStatus, byPriority }
}

export function getRecentBugs(bugs = [], limit = 5) {
  return [...bugs].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, limit)
}

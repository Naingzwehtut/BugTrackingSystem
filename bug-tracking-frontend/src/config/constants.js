// Domain constants shared across the app. Values mirror the backend
// (bug-tracking-backend/app/utils/validators.py) - keep them in sync.

export const ROLES = Object.freeze({
  OWNER: 'owner', // platform owner: approves admin requests, has no project
  ADMIN: 'admin',
  TESTER: 'tester',
  DEVELOPER: 'developer',
})
// Roles an admin can give inside a project (never "owner").
export const ROLE_LIST = [ROLES.ADMIN, ROLES.TESTER, ROLES.DEVELOPER]
export const ROLE_LABELS = {
  [ROLES.OWNER]: 'Owner',
  [ROLES.ADMIN]: 'Admin',
  [ROLES.TESTER]: 'Tester',
  [ROLES.DEVELOPER]: 'Developer',
}

export const BUG_STATUS = Object.freeze({
  OPEN: 'Open',
  IN_PROGRESS: 'In Progress',
  RESOLVED: 'Resolved',
  CLOSED: 'Closed',
  REOPENED: 'Reopened',
})
export const STATUS_LIST = Object.values(BUG_STATUS)
// Ordered lowest -> highest; the index doubles as a sort rank.
export const PRIORITY_LIST = ['Low', 'Medium', 'High', 'Critical']
export const SEVERITY_LIST = ['Minor', 'Major', 'Critical', 'Blocker']

// Allowed status moves (the overall workflow).
export const WORKFLOW = {
  [BUG_STATUS.OPEN]: [BUG_STATUS.IN_PROGRESS],
  [BUG_STATUS.IN_PROGRESS]: [BUG_STATUS.RESOLVED],
  [BUG_STATUS.RESOLVED]: [BUG_STATUS.CLOSED, BUG_STATUS.REOPENED],
  [BUG_STATUS.REOPENED]: [BUG_STATUS.IN_PROGRESS],
  [BUG_STATUS.CLOSED]: [],
}

// Which of those moves each non-admin role may perform ("from>to").
export const ROLE_STATUS_MOVES = {
  [ROLES.DEVELOPER]: new Set(['Open>In Progress', 'In Progress>Resolved', 'Reopened>In Progress']),
  [ROLES.TESTER]: new Set(['Resolved>Closed', 'Resolved>Reopened']),
}

// Colours per badge kind and value: `badge` styles the pill, `dot` the small
// status marker, `bar` the dashboard progress bar. Grouping by kind avoids
// the old flat colour map where "Critical" (a priority AND a severity)
// could only have one colour.
const tone = {
  gray: { badge: 'bg-gray-100 text-gray-700 ring-gray-500/20', dot: 'bg-gray-400', bar: 'bg-gray-400' },
  blue: { badge: 'bg-blue-50 text-blue-700 ring-blue-600/20', dot: 'bg-blue-500', bar: 'bg-blue-500' },
  orange: { badge: 'bg-orange-50 text-orange-700 ring-orange-600/20', dot: 'bg-orange-500', bar: 'bg-orange-500' },
  green: { badge: 'bg-green-50 text-green-700 ring-green-600/20', dot: 'bg-green-500', bar: 'bg-green-500' },
  red: { badge: 'bg-red-50 text-red-700 ring-red-600/20', dot: 'bg-red-500', bar: 'bg-red-500' },
  darkRed: { badge: 'bg-red-100 text-red-800 ring-red-700/30', dot: 'bg-red-700', bar: 'bg-red-700' },
}

export const BADGE_STYLES = {
  status: { Open: tone.blue, 'In Progress': tone.orange, Resolved: tone.green, Closed: tone.gray, Reopened: tone.red },
  priority: { Low: tone.gray, Medium: tone.blue, High: tone.orange, Critical: tone.red },
  severity: { Minor: tone.gray, Major: tone.orange, Critical: tone.red, Blocker: tone.darkRed },
}
export const FALLBACK_BADGE_STYLE = tone.gray

export const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest first' },
  { value: 'oldest', label: 'Oldest first' },
  { value: 'updated', label: 'Recently updated' },
  { value: 'priority', label: 'Highest priority' },
  { value: 'severity', label: 'Highest severity' },
]

export const PAGE_SIZE = 10

// Field limits (backend: TITLE_MIN/MAX, DESCRIPTION_MIN/MAX, COMMENT_MAX, NAME_MAX, PASSWORD_MIN).
export const TITLE_MIN = 3
export const TITLE_MAX = 200
export const DESCRIPTION_MIN = 10
export const DESCRIPTION_MAX = 5000
export const COMMENT_MAX = 2000
export const NAME_MAX = 100
export const PROJECT_NAME_MAX = 80
export const REASON_MIN = 10
export const REASON_MAX = 1000
export const QUESTION_MAX = 500
export const ANSWER_MAX = 3000
export const PASSWORD_MIN = 8

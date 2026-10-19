export const ROLES = {
  ADMIN: 'admin',
  TESTER: 'tester',
  DEVELOPER: 'developer',
}

export const BUG_STATUS = {
  OPEN: 'Open',
  IN_PROGRESS: 'In Progress',
  RESOLVED: 'Resolved',
  CLOSED: 'Closed',
  REOPENED: 'Reopened',
}

export const STATUS_LIST = ['Open', 'In Progress', 'Resolved', 'Closed', 'Reopened']

export const PRIORITY_LIST = ['Low', 'Medium', 'High', 'Critical']

export const SEVERITY_LIST = ['Minor', 'Major', 'Critical', 'Blocker']

export const STATUS_COLORS = {
  Open: 'bg-blue-100 text-blue-700',
  'In Progress': 'bg-orange-100 text-orange-700',
  Resolved: 'bg-green-100 text-green-700',
  Closed: 'bg-gray-200 text-gray-700',
  Reopened: 'bg-red-100 text-red-700',
}

export const PRIORITY_COLORS = {
  Low: 'bg-gray-100 text-gray-700',
  Medium: 'bg-blue-100 text-blue-700',
  High: 'bg-orange-100 text-orange-700',
  Critical: 'bg-red-100 text-red-700',
}

export const SEVERITY_COLORS = {
  Minor: 'bg-gray-100 text-gray-700',
  Major: 'bg-orange-100 text-orange-700',
  Critical: 'bg-red-100 text-red-700',
  Blocker: 'bg-red-200 text-red-800',
}

import { ROLES } from './constants'

// Frontend-side hints only. The backend is the final authority for every
// permission check — these helpers just decide which buttons to show.

export function canCreateBug(user) {
  return user?.role === ROLES.TESTER
}

export function canAssignBug(user) {
  return user?.role === ROLES.ADMIN
}

export function canDeleteBug(user) {
  return user?.role === ROLES.ADMIN
}

export function canEditBug(user, bug) {
  if (!user || !bug) return false
  if (user.role === ROLES.ADMIN) return true
  if (user.role === ROLES.DEVELOPER) {
    return bug.assigned_to === user.id || bug.assigned_developer_id === user.id
  }
  return false
}

export function canManageUsers(user) {
  return user?.role === ROLES.ADMIN
}

// Which next statuses a role is allowed to attempt from the current status.
// The backend will still reject anything it doesn't allow — this only keeps
// obviously-wrong buttons off the screen.
export function availableStatusActions(user, currentStatus) {
  if (!user) return []
  const role = user.role

  if (role === ROLES.DEVELOPER) {
    if (currentStatus === 'Open') return ['In Progress']
    if (currentStatus === 'In Progress') return ['Resolved']
    if (currentStatus === 'Reopened') return ['In Progress']
    return []
  }

  if (role === ROLES.TESTER) {
    if (currentStatus === 'Resolved') return ['Closed', 'Reopened']
    return []
  }

  if (role === ROLES.ADMIN) {
    // Admin can manage more broadly; backend still validates.
    const all = ['Open', 'In Progress', 'Resolved', 'Closed', 'Reopened']
    return all.filter((s) => s !== currentStatus)
  }

  return []
}

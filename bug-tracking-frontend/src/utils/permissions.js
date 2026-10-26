import { ROLE_STATUS_MOVES, ROLES, WORKFLOW } from '@/config/constants'

// Frontend-side hints only. The backend is the final authority on every
// permission check - these helpers just decide which controls to show.

export const canCreateBug = (user) => user?.role === ROLES.TESTER
export const canAssignBug = (user) => user?.role === ROLES.ADMIN
export const canDeleteBug = (user) => user?.role === ROLES.ADMIN
export const canManageUsers = (user) => user?.role === ROLES.ADMIN

export function canEditBug(user, bug) {
  if (!user || !bug) return false
  if (user.role === ROLES.ADMIN) return true
  return user.role === ROLES.DEVELOPER && bug.assigned_to === user.id
}

// Next statuses this user may attempt: the workflow's legal moves, narrowed
// to the ones the user's role is allowed to make. Admins may make any legal move.
export function availableStatusActions(user, currentStatus) {
  if (!user) return []
  const next = WORKFLOW[currentStatus] ?? []
  if (user.role === ROLES.ADMIN) return next
  const allowed = ROLE_STATUS_MOVES[user.role]
  return allowed ? next.filter((status) => allowed.has(`${currentStatus}>${status}`)) : []
}

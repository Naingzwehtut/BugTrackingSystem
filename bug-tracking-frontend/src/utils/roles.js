import { ROLES } from '@/config/constants'

const ROLE_HOME = {
  [ROLES.OWNER]: '/owner/requests',
  [ROLES.ADMIN]: '/admin/dashboard',
  [ROLES.TESTER]: '/tester/dashboard',
  [ROLES.DEVELOPER]: '/developer/dashboard',
}

// Owners never need a project; everyone else must create or join one first.
export function needsProject(user, project) {
  return Boolean(user) && user.role !== ROLES.OWNER && !project
}

// Landing page for a role (used after login and by the "/" redirect).
export function getRoleHome(role) {
  return ROLE_HOME[role] ?? '/login'
}

// Where to send someone after login. Honour the page they originally asked
// for, unless it belongs to a different role's area (e.g. /admin/* for a tester).
export function resolvePostLoginPath(user, requestedPath) {
  const roleAreas = Object.values(ROLES)
  const forbiddenArea = roleAreas.some(
    (role) => role !== user.role && requestedPath?.startsWith(`/${role}/`),
  )
  return requestedPath && requestedPath !== '/login' && !forbiddenArea ? requestedPath : getRoleHome(user.role)
}

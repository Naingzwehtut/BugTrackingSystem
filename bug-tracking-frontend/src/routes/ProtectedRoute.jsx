import { Navigate, Outlet, useLocation } from 'react-router-dom'
import LoadingSpinner from '@/components/feedback/LoadingSpinner'
import { useAuth } from '@/hooks/useAuth'
import { getRoleHome, needsProject } from '@/utils/roles'

const WELCOME = '/welcome'

/**
 * Everything inside requires a signed-in user. Users who haven't created or
 * joined a project yet (owners never need one) are kept on /welcome, and
 * sent onward from it once they have one.
 */
export default function ProtectedRoute() {
  const { user, project, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <LoadingSpinner label="Checking your session..." />
      </div>
    )
  }

  if (!user) return <Navigate to="/login" state={{ from: location }} replace />

  const onWelcome = location.pathname === WELCOME
  const withoutProject = needsProject(user, project)
  if (withoutProject && !onWelcome) return <Navigate to={WELCOME} replace />
  if (!withoutProject && onWelcome) return <Navigate to={getRoleHome(user.role)} replace />
  return <Outlet />
}

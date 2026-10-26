import { Navigate, Outlet, useLocation } from 'react-router-dom'
import LoadingSpinner from '@/components/feedback/LoadingSpinner'
import { useAuth } from '@/hooks/useAuth'
import { resolvePostLoginPath } from '@/utils/roles'

// Wraps /login and /register. Someone who is already signed in (or has just
// signed in) is sent on to where they were headed, or their role's home page.
export default function AuthLayout() {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <LoadingSpinner label="Checking your session..." />
      </div>
    )
  }

  if (user) {
    // Keep the query string too, so a filtered bug-list link survives sign-in.
    const from = location.state?.from
    return <Navigate to={resolvePostLoginPath(user, from && `${from.pathname}${from.search ?? ''}`)} replace />
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-b from-primary-50/60 to-gray-50 px-4 py-8">
      <Outlet />
    </main>
  )
}

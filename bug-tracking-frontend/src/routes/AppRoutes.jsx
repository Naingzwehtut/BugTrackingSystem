import { lazy, Suspense } from 'react'
import LoadingSpinner from '@/components/feedback/LoadingSpinner'
import { Navigate, Route, Routes } from 'react-router-dom'
import { ROLES } from '@/config/constants'
import { useAuth } from '@/hooks/useAuth'
import AuthLayout from '@/layouts/AuthLayout'
import DashboardLayout from '@/layouts/DashboardLayout'
import Login from '@/pages/auth/Login'
import Register from '@/pages/auth/Register'
import NotFound from '@/pages/NotFound'
import Unauthorized from '@/pages/Unauthorized'
import { getRoleHome } from '@/utils/roles'
import ProtectedRoute from './ProtectedRoute'
import RoleRoute from './RoleRoute'

// Signed-in pages are loaded on demand so the first screen downloads less code.
const AdminDashboard = lazy(() => import('@/pages/admin/AdminDashboard'))
const UserManagement = lazy(() => import('@/pages/admin/UserManagement'))
const TesterDashboard = lazy(() => import('@/pages/tester/TesterDashboard'))
const CreateBug = lazy(() => import('@/pages/tester/CreateBug'))
const DeveloperDashboard = lazy(() => import('@/pages/developer/DeveloperDashboard'))
const BugList = lazy(() => import('@/pages/bugs/BugList'))
const BugDetails = lazy(() => import('@/pages/bugs/BugDetails'))
const Notifications = lazy(() => import('@/pages/Notifications'))
const Welcome = lazy(() => import('@/pages/Welcome'))
const HelpCenter = lazy(() => import('@/pages/admin/HelpCenter'))
const OwnerRequests = lazy(() => import('@/pages/owner/OwnerRequests'))
const OwnerProjects = lazy(() => import('@/pages/owner/OwnerProjects'))
const Settings = lazy(() => import('@/pages/Settings'))

function RoleHomeRedirect() {
  const { user } = useAuth()
  return <Navigate to={user ? getRoleHome(user.role) : '/login'} replace />
}

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Route>
      <Route path="/unauthorized" element={<Unauthorized />} />

      {/* Signed-in */}
      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<RoleHomeRedirect />} />
        {/* No project yet: create one, join one, or wait for an admin request. */}
        <Route
          path="/welcome"
          element={
            <Suspense fallback={<LoadingSpinner />}>
              <Welcome />
            </Suspense>
          }
        />

        <Route element={<DashboardLayout />}>
          <Route element={<RoleRoute allowedRoles={[ROLES.OWNER]} />}>
            <Route path="/owner/requests" element={<OwnerRequests />} />
            <Route path="/owner/projects" element={<OwnerProjects />} />
          </Route>

          <Route element={<RoleRoute allowedRoles={[ROLES.ADMIN]} />}>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/users" element={<UserManagement />} />
            <Route path="/admin/help" element={<HelpCenter />} />
          </Route>

          <Route element={<RoleRoute allowedRoles={[ROLES.TESTER]} />}>
            <Route path="/tester/dashboard" element={<TesterDashboard />} />
            <Route path="/tester/create-bug" element={<CreateBug />} />
          </Route>

          <Route element={<RoleRoute allowedRoles={[ROLES.DEVELOPER]} />}>
            <Route path="/developer/dashboard" element={<DeveloperDashboard />} />
          </Route>

          {/* Project members (owners have no project, so no bugs) */}
          <Route element={<RoleRoute allowedRoles={[ROLES.ADMIN, ROLES.TESTER, ROLES.DEVELOPER]} />}>
            <Route path="/bugs" element={<BugList />} />
            <Route path="/bugs/:id" element={<BugDetails />} />
          </Route>

          {/* Everyone signed in */}
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/settings" element={<Settings />} />
        </Route>
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}

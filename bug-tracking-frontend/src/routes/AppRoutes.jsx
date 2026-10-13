import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { ROLES } from '../utils/constants'

import AuthLayout from '../layouts/AuthLayout.jsx'
import DashboardLayout from '../layouts/DashboardLayout.jsx'

import Login from '../pages/auth/Login.jsx'
import Register from '../pages/auth/Register.jsx'
import Unauthorized from '../pages/Unauthorized.jsx'
import NotFound from '../pages/NotFound.jsx'

import AdminDashboard from '../pages/admin/AdminDashboard.jsx'
import UserManagement from '../pages/admin/UserManagement.jsx'

import TesterDashboard from '../pages/tester/TesterDashboard.jsx'
import CreateBug from '../pages/tester/CreateBug.jsx'

import DeveloperDashboard from '../pages/developer/DeveloperDashboard.jsx'

import BugList from '../pages/bugs/BugList.jsx'
import BugDetails from '../pages/bugs/BugDetails.jsx'

import Notifications from '../pages/Notifications.jsx'
import Settings from '../pages/Settings.jsx'

import ProtectedRoute from './ProtectedRoute.jsx'
import RoleRoute from './RoleRoute.jsx'

function RoleHomeRedirect() {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  if (user.role === ROLES.ADMIN) return <Navigate to="/admin/dashboard" replace />
  if (user.role === ROLES.TESTER) return <Navigate to="/tester/dashboard" replace />
  if (user.role === ROLES.DEVELOPER) return <Navigate to="/developer/dashboard" replace />
  return <Navigate to="/login" replace />
}

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public auth routes */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Route>

      <Route path="/unauthorized" element={<Unauthorized />} />

      {/* Protected routes */}
      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<RoleHomeRedirect />} />

        <Route element={<DashboardLayout />}>
          {/* Admin */}
          <Route element={<RoleRoute allowedRoles={[ROLES.ADMIN]} />}>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/users" element={<UserManagement />} />
          </Route>

          {/* Tester */}
          <Route element={<RoleRoute allowedRoles={[ROLES.TESTER]} />}>
            <Route path="/tester/dashboard" element={<TesterDashboard />} />
            <Route path="/tester/create-bug" element={<CreateBug />} />
          </Route>

          {/* Developer */}
          <Route element={<RoleRoute allowedRoles={[ROLES.DEVELOPER]} />}>
            <Route path="/developer/dashboard" element={<DeveloperDashboard />} />
          </Route>

          {/* Shared, authenticated-only routes */}
          <Route
            element={
              <RoleRoute allowedRoles={[ROLES.ADMIN, ROLES.TESTER, ROLES.DEVELOPER]} />
            }
          >
            <Route path="/bugs" element={<BugList />} />
            <Route path="/bugs/:id" element={<BugDetails />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/settings" element={<Settings />} />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}

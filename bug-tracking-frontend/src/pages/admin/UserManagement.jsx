import { useEffect, useState } from 'react'
import * as userService from '../../services/userService'
import { getErrorMessage } from '../../services/api'
import { useToast } from '../../components/common/Toast.jsx'
import LoadingSpinner from '../../components/common/LoadingSpinner.jsx'
import ErrorState from '../../components/common/ErrorState.jsx'
import EmptyState from '../../components/common/EmptyState.jsx'
import { formatDate } from '../../utils/formatDate'
import { ROLES } from '../../utils/constants'

const ROLE_OPTIONS = [ROLES.ADMIN, ROLES.TESTER, ROLES.DEVELOPER]

export default function UserManagement() {
  const { showToast } = useToast()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [updatingId, setUpdatingId] = useState(null)

  async function load() {
    setLoading(true)
    setError('')
    try {
      const res = await userService.getUsers()
      setUsers(res.data?.users || res.data || [])
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  async function handleRoleChange(userId, newRole) {
    setUpdatingId(userId)
    try {
      await userService.updateUserRole(userId, newRole)
      showToast('User role updated successfully.', 'success')
      setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u)))
    } catch (err) {
      showToast(getErrorMessage(err), 'error')
    } finally {
      setUpdatingId(null)
    }
  }

  if (loading) return <LoadingSpinner label="Loading users..." />
  if (error) return <ErrorState message={error} onRetry={load} />

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-xl font-semibold text-gray-900">User Management</h1>
        <p className="text-sm text-gray-500">View users and manage their roles.</p>
      </div>

      <div className="card overflow-x-auto">
        {users.length === 0 ? (
          <EmptyState message="No users found." />
        ) : (
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50">
              <tr className="text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Created</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-800">{u.name}</td>
                  <td className="px-4 py-3 text-gray-600">{u.email}</td>
                  <td className="px-4 py-3 capitalize text-gray-600">{u.role}</td>
                  <td className="px-4 py-3 text-gray-500">{formatDate(u.created_at)}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end">
                      <select
                        className="input w-36 py-1.5"
                        value={u.role}
                        disabled={updatingId === u.id}
                        onChange={(e) => handleRoleChange(u.id, e.target.value)}
                      >
                        {ROLE_OPTIONS.map((r) => (
                          <option key={r} value={r}>
                            {r.charAt(0).toUpperCase() + r.slice(1)}
                          </option>
                        ))}
                      </select>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

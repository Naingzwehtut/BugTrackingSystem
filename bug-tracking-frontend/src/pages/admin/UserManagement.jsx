import { Search, ShieldAlert } from 'lucide-react'
import { useMemo, useState } from 'react'
import EmptyState from '@/components/feedback/EmptyState'
import ErrorState from '@/components/feedback/ErrorState'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import PageHeader from '@/components/ui/PageHeader'
import Skeleton from '@/components/ui/Skeleton'
import { Table, TableBody, TableHead, Td, Th } from '@/components/ui/Table'
import { ROLE_LABELS, ROLE_LIST, ROLES } from '@/config/constants'
import { useAuth } from '@/hooks/useAuth'
import { useFetch } from '@/hooks/useFetch'
import { usePageTitle } from '@/hooks/usePageTitle'
import { useToast } from '@/hooks/useToast'
import { getErrorMessage } from '@/services/api'
import { getUsers, updateUserRole } from '@/services/userService'
import { formatDate, initials } from '@/utils/format'

function UsersSkeleton() {
  return (
    <div className="flex flex-col gap-4" role="status" aria-label="Loading users">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-10 w-full max-w-sm" />
      <div className="card flex flex-col gap-3 p-4">
        {Array.from({ length: 5 }, (_, index) => (
          <Skeleton key={index} className="h-10" />
        ))}
      </div>
    </div>
  )
}

function RoleFilter({ value, counts, onChange }) {
  const options = [['', 'All', counts.total], ...ROLE_LIST.map((role) => [role, ROLE_LABELS[role], counts[role] ?? 0])]
  return (
    <div role="group" aria-label="Filter by role" className="flex flex-wrap gap-1.5">
      {options.map(([role, label, count]) => (
        <button
          key={role || 'all'}
          type="button"
          aria-pressed={value === role}
          onClick={() => onChange(role)}
          className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
            value === role ? 'bg-primary-600 text-white' : 'bg-white text-gray-600 ring-1 ring-inset ring-gray-200 hover:bg-gray-50'
          }`}
        >
          {label} <span className="tabular-nums opacity-70">{count}</span>
        </button>
      ))}
    </div>
  )
}

export default function UserManagement() {
  usePageTitle('Users')
  const { user: currentUser } = useAuth()
  const toast = useToast()
  const [updatingId, setUpdatingId] = useState(null)
  const [query, setQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  // Granting or removing admin rights is significant, so it's confirmed first.
  const [pendingAdminChange, setPendingAdminChange] = useState(null)

  const { data, loading, error, reload, setData } = useFetch((signal) => getUsers({ signal }), [])
  const users = useMemo(() => data ?? [], [data])

  const counts = useMemo(() => {
    const result = { total: users.length }
    for (const u of users) result[u.role] = (result[u.role] ?? 0) + 1
    return result
  }, [users])

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase()
    return users.filter(
      (u) =>
        (!roleFilter || u.role === roleFilter) &&
        (!q || u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)),
    )
  }, [users, query, roleFilter])

  async function applyRole(target, role) {
    setUpdatingId(target.id)
    try {
      await updateUserRole(target.id, role)
      setData((current) => current.map((u) => (u.id === target.id ? { ...u, role } : u)))
      toast.success(`${target.name} is now ${ROLE_LABELS[role] === 'Admin' ? 'an' : 'a'} ${ROLE_LABELS[role]}.`)
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setUpdatingId(null)
      setPendingAdminChange(null)
    }
  }

  function requestRoleChange(target, role) {
    if (role === target.role) return
    if (role === ROLES.ADMIN || target.role === ROLES.ADMIN) setPendingAdminChange({ user: target, role })
    else applyRole(target, role)
  }

  if (loading) return <UsersSkeleton />
  if (error) return <ErrorState message={error} onRetry={reload} />

  const change = pendingAdminChange
  return (
    <div className="flex flex-col gap-4">
      <PageHeader title="User Management" subtitle="View users and manage their roles." />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" aria-hidden="true" />
          <input
            type="search"
            aria-label="Search users by name or email"
            className="input pl-9"
            placeholder="Search name or email..."
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </div>
        <RoleFilter value={roleFilter} counts={counts} onChange={setRoleFilter} />
      </div>

      {visible.length === 0 ? (
        <div className="card">
          <EmptyState message={users.length === 0 ? 'No users found.' : 'No users match your search.'} />
        </div>
      ) : (
        <Table>
          <TableHead>
            <Th>User</Th>
            <Th className="hidden sm:table-cell">Joined</Th>
            <Th className="text-right">Role</Th>
          </TableHead>
          <TableBody>
            {visible.map((u) => {
              const isSelf = u.id === currentUser?.id
              return (
                <tr key={u.id} className="hover:bg-gray-50">
                  <Td>
                    <div className="flex items-center gap-3">
                      <span
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-100 text-xs font-semibold text-gray-600"
                        aria-hidden="true"
                      >
                        {initials(u.name)}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate font-medium text-gray-800">
                          {u.name}
                          {isSelf && <span className="ml-1.5 text-xs font-normal text-gray-400">(you)</span>}
                        </p>
                        <p className="truncate text-xs text-gray-500">{u.email}</p>
                      </div>
                    </div>
                  </Td>
                  <Td className="hidden whitespace-nowrap text-gray-500 sm:table-cell">{formatDate(u.created_at)}</Td>
                  <Td>
                    <div className="flex justify-end">
                      <select
                        aria-label={`Role for ${u.name}`}
                        className="input w-32 py-1.5"
                        value={u.role}
                        disabled={updatingId === u.id || isSelf}
                        title={isSelf ? 'You cannot change your own role' : undefined}
                        onChange={(event) => requestRoleChange(u, event.target.value)}
                      >
                        {ROLE_LIST.map((role) => (
                          <option key={role} value={role}>
                            {ROLE_LABELS[role]}
                          </option>
                        ))}
                      </select>
                    </div>
                  </Td>
                </tr>
              )
            })}
          </TableBody>
        </Table>
      )}

      <ConfirmDialog
        isOpen={Boolean(change)}
        title={change?.role === ROLES.ADMIN ? 'Grant admin access?' : 'Remove admin access?'}
        message={
          change?.role === ROLES.ADMIN ? (
            <>
              <span className="font-medium text-gray-900">{change?.user.name}</span> will be able to manage every
              bug and change any user&apos;s role, including yours.
            </>
          ) : (
            <>
              <span className="font-medium text-gray-900">{change?.user.name}</span> will lose admin access and
              become a {ROLE_LABELS[change?.role]}.
            </>
          )
        }
        confirmLabel={change?.role === ROLES.ADMIN ? 'Make admin' : 'Remove admin'}
        loadingLabel="Updating..."
        icon={ShieldAlert}
        variant={change?.role === ROLES.ADMIN ? 'primary' : 'danger'}
        loading={Boolean(change) && updatingId === change.user.id}
        onConfirm={() => applyRole(change.user, change.role)}
        onCancel={() => setPendingAdminChange(null)}
      />
    </div>
  )
}

import { Check, ShieldCheck, X } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import EmptyState from '@/components/feedback/EmptyState'
import ErrorState from '@/components/feedback/ErrorState'
import Button from '@/components/ui/Button'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import PageHeader from '@/components/ui/PageHeader'
import SegmentedControl from '@/components/ui/SegmentedControl'
import Skeleton from '@/components/ui/Skeleton'
import { useFetch } from '@/hooks/useFetch'
import { useNotifications } from '@/hooks/useNotifications'
import { usePageTitle } from '@/hooks/usePageTitle'
import { useToast } from '@/hooks/useToast'
import { decideAdminRequest, getAdminRequests } from '@/services/adminRequestService'
import { getErrorMessage } from '@/services/api'
import { formatDateTime, formatRelative, initials } from '@/utils/format'

const STATUS_STYLES = {
  pending: 'bg-amber-50 text-amber-700 ring-amber-600/20',
  approved: 'bg-green-50 text-green-700 ring-green-600/20',
  rejected: 'bg-gray-100 text-gray-600 ring-gray-500/20',
}

function RequestCard({ request, onDecide, busy }) {
  const isPending = request.status === 'pending'
  return (
    <li className="card p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-100 text-sm font-semibold text-primary-700" aria-hidden="true">
            {initials(request.user_name)}
          </span>
          <div className="min-w-0">
            <p className="truncate font-medium text-gray-900">{request.user_name ?? 'Unknown user'}</p>
            <p className="truncate text-xs text-gray-500">{request.user_email}</p>
          </div>
        </div>
        <span className={`rounded-full px-2.5 py-1 text-xs font-medium capitalize ring-1 ring-inset ${STATUS_STYLES[request.status]}`}>
          {request.status}
        </span>
      </div>
      <p className="mt-3 whitespace-pre-wrap rounded-lg bg-gray-50 px-3 py-2 text-sm text-gray-700">{request.reason}</p>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs text-gray-400">
          Requested <time title={formatDateTime(request.created_at)}>{formatRelative(request.created_at)}</time>
          {request.reviewed_by_name && (
            <>
              {' '}· {request.status} by {request.reviewed_by_name}
            </>
          )}
        </p>
        {isPending && (
          <div className="flex gap-2">
            <Button variant="secondary" icon={X} disabled={busy} onClick={() => onDecide(request, 'reject')}>
              Reject
            </Button>
            <Button variant="success" icon={Check} disabled={busy} onClick={() => onDecide(request, 'approve')}>
              Approve
            </Button>
          </div>
        )}
      </div>
    </li>
  )
}

export default function OwnerRequests() {
  usePageTitle('Admin Requests')
  const toast = useToast()
  const { items: notifications } = useNotifications()
  const [tab, setTab] = useState('pending')
  const [confirming, setConfirming] = useState(null)
  const [deciding, setDeciding] = useState(false)
  const { data, loading, error, reload, setData } = useFetch((signal) => getAdminRequests({ signal }), [])
  const requests = useMemo(() => data ?? [], [data])

  // A new request arriving live (notification) refreshes the list quietly.
  const latestRequestNotice = notifications.find((n) => n.type === 'admin_requested')?.id
  useEffect(() => {
    if (latestRequestNotice) reload({ silent: true })
  }, [latestRequestNotice, reload])

  const pending = requests.filter((r) => r.status === 'pending')
  const visible = tab === 'pending' ? pending : requests.filter((r) => r.status !== 'pending')

  async function decide() {
    const { request, decision } = confirming
    setDeciding(true)
    try {
      const updated = await decideAdminRequest(request.id, decision)
      setData((current) => current.map((r) => (r.id === request.id ? { ...r, ...updated } : r)))
      toast.success(decision === 'approve' ? `${request.user_name} is now an admin.` : 'Request rejected.')
      setConfirming(null)
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setDeciding(false)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col gap-4" role="status" aria-label="Loading requests">
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-40" />
        <Skeleton className="h-40" />
      </div>
    )
  }
  if (error) return <ErrorState message={error} onRetry={reload} />

  return (
    <div className="flex flex-col gap-4">
      <PageHeader title="Admin Requests" subtitle="People asking to run their own project. Approved admins can create one." />
      <SegmentedControl
        label="Show"
        className="w-full max-w-xs"
        value={tab}
        onChange={setTab}
        options={[
          { value: 'pending', label: `Pending (${pending.length})` },
          { value: 'history', label: 'History' },
        ]}
      />
      {visible.length === 0 ? (
        <div className="card">
          <EmptyState
            icon={ShieldCheck}
            message={tab === 'pending' ? 'No pending requests.' : 'No decisions yet.'}
            description={tab === 'pending' ? 'New requests appear here instantly, and you also get an email.' : undefined}
          />
        </div>
      ) : (
        <ul className="grid gap-3 lg:grid-cols-2">
          {visible.map((request) => (
            <RequestCard key={request.id} request={request} busy={deciding} onDecide={(r, decision) => setConfirming({ request: r, decision })} />
          ))}
        </ul>
      )}

      <ConfirmDialog
        isOpen={Boolean(confirming)}
        title={confirming?.decision === 'approve' ? 'Approve admin access?' : 'Reject this request?'}
        message={
          confirming?.decision === 'approve'
            ? `${confirming?.request.user_name} will be able to create a project, manage its members and every bug in it.`
            : `${confirming?.request.user_name} will be told it wasn't approved. They can still join a project with an invite code.`
        }
        confirmLabel={confirming?.decision === 'approve' ? 'Approve' : 'Reject'}
        loadingLabel="Saving..."
        variant={confirming?.decision === 'approve' ? 'success' : 'danger'}
        loading={deciding}
        onConfirm={decide}
        onCancel={() => setConfirming(null)}
      />
    </div>
  )
}

import { useState } from 'react'
import Button from '@/components/ui/Button'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import { BUG_STATUS } from '@/config/constants'
import { availableStatusActions } from '@/utils/permissions'
import { StatusBadge } from './BugBadges'

const VARIANT_BY_STATUS = {
  [BUG_STATUS.CLOSED]: 'secondary',
  [BUG_STATUS.REOPENED]: 'danger',
  [BUG_STATUS.RESOLVED]: 'success',
}

// Plain-language explanation of where the bug is in the workflow.
const STATUS_HINTS = {
  [BUG_STATUS.OPEN]: 'Waiting for the assigned developer to start work.',
  unassigned: 'Waiting for an admin to assign a developer.',
  [BUG_STATUS.IN_PROGRESS]: 'A developer is working on a fix.',
  [BUG_STATUS.RESOLVED]: 'Fixed and waiting for a tester to verify it (close or reopen).',
  [BUG_STATUS.REOPENED]: 'Verification failed, so it is back with the developer.',
  [BUG_STATUS.CLOSED]: 'Verified and closed. This is the final state.',
}

/**
 * Current status, what it means, and buttons for the moves this user may
 * make. Closing is final (the workflow has no way back from Closed), so it
 * asks for confirmation first.
 */
export default function StatusActions({ user, bug, onChangeStatus, pendingStatus }) {
  const actions = availableStatusActions(user, bug.status)
  const [confirmingClose, setConfirmingClose] = useState(false)
  const busy = Boolean(pendingStatus)

  function handleClick(status) {
    if (status === BUG_STATUS.CLOSED) setConfirmingClose(true)
    else onChangeStatus(status)
  }

  async function confirmClose() {
    await onChangeStatus(BUG_STATUS.CLOSED)
    setConfirmingClose(false)
  }

  return (
    <section className="card p-4" aria-labelledby="status-heading">
      <div className="flex items-center justify-between gap-2">
        <h2 id="status-heading" className="text-sm font-semibold text-gray-800">
          Status
        </h2>
        <StatusBadge status={bug.status} />
      </div>
      <p className="mt-2 text-sm text-gray-500">
        {bug.status === BUG_STATUS.OPEN && !bug.assigned_to ? STATUS_HINTS.unassigned : STATUS_HINTS[bug.status]}
      </p>

      {actions.length > 0 ? (
        <div className="mt-4 flex flex-wrap gap-2">
          {actions.map((status) => (
            <Button
              key={status}
              variant={VARIANT_BY_STATUS[status] ?? 'primary'}
              loading={pendingStatus === status}
              disabled={busy}
              onClick={() => handleClick(status)}
              className="flex-1"
            >
              {status === BUG_STATUS.REOPENED ? 'Reopen' : `Mark ${status}`}
            </Button>
          ))}
        </div>
      ) : (
        bug.status !== BUG_STATUS.CLOSED && (
          <p className="mt-3 rounded-md bg-gray-50 px-3 py-2 text-xs text-gray-500">
            The next step is for another role, so there&apos;s nothing for you to do here right now.
          </p>
        )
      )}

      <ConfirmDialog
        isOpen={confirmingClose}
        title="Close this bug?"
        message="Closing marks the fix as verified. A closed bug can't be reopened or moved to another status."
        confirmLabel="Close bug"
        loadingLabel="Closing..."
        variant="primary"
        loading={pendingStatus === BUG_STATUS.CLOSED}
        onConfirm={confirmClose}
        onCancel={() => setConfirmingClose(false)}
      />
    </section>
  )
}

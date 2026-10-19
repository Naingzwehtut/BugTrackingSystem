import { availableStatusActions } from '../../utils/permissions'

export default function StatusActions({ user, bug, onChangeStatus, updating }) {
  const actions = availableStatusActions(user, bug.status)

  if (actions.length === 0) return null

  const toneClass = (status) => {
    if (status === 'Closed') return 'btn-secondary'
    if (status === 'Reopened') return 'btn-danger'
    if (status === 'Resolved') return 'btn-success'
    return 'btn-primary'
  }

  return (
    <div className="flex flex-wrap gap-2">
      {actions.map((status) => (
        <button
          key={status}
          disabled={updating}
          onClick={() => onChangeStatus(status)}
          className={toneClass(status)}
        >
          Mark as {status}
        </button>
      ))}
    </div>
  )
}

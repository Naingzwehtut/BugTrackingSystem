import { Link } from 'react-router-dom'
import StatusBadge from '../bugs/StatusBadge.jsx'
import PriorityBadge from '../bugs/PriorityBadge.jsx'
import EmptyState from '../common/EmptyState.jsx'
import { formatDate } from '../../utils/formatDate'

export default function RecentBugs({ bugs }) {
  const recent = [...bugs]
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 5)

  return (
    <div className="card p-4">
      <h3 className="mb-3 text-sm font-semibold text-gray-800">Recent Bugs</h3>
      {recent.length === 0 ? (
        <EmptyState message="No bugs found." />
      ) : (
        <div className="flex flex-col divide-y divide-gray-100">
          {recent.map((bug) => (
            <Link
              key={bug.id}
              to={`/bugs/${bug.id}`}
              className="flex items-center justify-between gap-3 py-3 hover:bg-gray-50 -mx-1 px-1 rounded"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-gray-800">{bug.title}</p>
                <p className="text-xs text-gray-400">{formatDate(bug.created_at)}</p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <PriorityBadge priority={bug.priority} />
                <StatusBadge status={bug.status} />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

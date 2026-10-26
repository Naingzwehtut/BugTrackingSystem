import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import EmptyState from '@/components/feedback/EmptyState'
import { PriorityBadge, StatusBadge } from '@/components/bugs/BugBadges'
import { formatBugId, formatDateTime, formatRelative } from '@/utils/format'

// `bugs` should already be the (sorted, trimmed) list to display.
export default function RecentBugs({ bugs, emptyMessage = 'No bugs yet.', emptyAction }) {
  return (
    <section className="card p-4">
      <div className="mb-1 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-gray-800">Recent Bugs</h2>
        {bugs.length > 0 && (
          <Link to="/bugs" className="flex items-center gap-1 text-xs font-medium text-primary-600 hover:underline">
            View all <ArrowRight size={14} aria-hidden="true" />
          </Link>
        )}
      </div>
      {bugs.length === 0 ? (
        <EmptyState message={emptyMessage} action={emptyAction} />
      ) : (
        <ul className="flex flex-col divide-y divide-gray-100">
          {bugs.map((bug) => (
            <li key={bug.id}>
              <Link
                to={`/bugs/${bug.id}`}
                className="-mx-2 flex items-center justify-between gap-3 rounded-md px-2 py-3 hover:bg-gray-50"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-gray-800">{bug.title}</p>
                  <p className="text-xs text-gray-400">
                    <span className="font-mono">{formatBugId(bug.id)}</span> ·{' '}
                    <time dateTime={bug.created_at} title={formatDateTime(bug.created_at)}>
                      {formatRelative(bug.created_at)}
                    </time>
                  </p>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1.5 sm:flex-row sm:items-center sm:gap-2">
                  <PriorityBadge priority={bug.priority} />
                  <StatusBadge status={bug.status} />
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

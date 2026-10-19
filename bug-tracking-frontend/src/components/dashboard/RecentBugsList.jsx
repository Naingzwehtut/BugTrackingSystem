import { Link } from 'react-router-dom'
import StatusBadge from '../bugs/StatusBadge.jsx'
import { formatDate } from '../../utils/formatDate'
import EmptyState from '../common/EmptyState.jsx'

export default function RecentBugsList({ bugs, basePath }) {
  if (!bugs || bugs.length === 0) {
    return <EmptyState title="No recent bugs" description="Newly created bugs will show up here." />
  }

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
      <ul className="divide-y divide-gray-100">
        {bugs.slice(0, 6).map((bug) => (
          <li key={bug.id}>
            <Link
              to={`${basePath}/${bug.id}`}
              className="flex items-center justify-between gap-3 px-4 py-3 hover:bg-gray-50 sm:px-5"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-gray-900">{bug.title}</p>
                <p className="text-xs text-gray-400">Updated {formatDate(bug.updated_at || bug.created_at)}</p>
              </div>
              <StatusBadge status={bug.status} />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}

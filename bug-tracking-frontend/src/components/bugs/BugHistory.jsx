import { History } from 'lucide-react'
import EmptyState from '../common/EmptyState.jsx'
import { formatDateTime } from '../../utils/formatDate'

export default function BugHistory({ history }) {
  return (
    <div className="card p-4">
      <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-800">
        <History size={16} /> Activity Timeline
      </h3>

      {history.length === 0 ? (
        <EmptyState message="No history recorded yet." />
      ) : (
        <ol className="relative ml-2 border-l border-gray-200 pl-4">
          {history.map((h, idx) => (
            <li key={h.id || idx} className="mb-4 last:mb-0">
              <div className="absolute -ml-[21px] mt-1 h-2.5 w-2.5 rounded-full bg-primary-500" />
              <p className="text-sm text-gray-700">
                {h.description || h.action || h.message}
              </p>
              <p className="text-xs text-gray-400">{formatDateTime(h.created_at)}</p>
            </li>
          ))}
        </ol>
      )}
    </div>
  )
}

import { Link } from 'react-router-dom'
import { Eye, Trash2 } from 'lucide-react'
import StatusBadge from './StatusBadge.jsx'
import PriorityBadge from './PriorityBadge.jsx'
import SeverityBadge from './SeverityBadge.jsx'
import EmptyState from '../common/EmptyState.jsx'
import { formatDate } from '../../utils/formatDate'

export default function BugTable({ bugs, onDelete, canDelete }) {
  if (bugs.length === 0) {
    return <EmptyState message="No bugs found." />
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200">
      <table className="min-w-full divide-y divide-gray-200 text-sm">
        <thead className="bg-gray-50">
          <tr className="text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
            <th className="px-4 py-3">ID</th>
            <th className="px-4 py-3">Title</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Priority</th>
            <th className="px-4 py-3">Severity</th>
            <th className="px-4 py-3">Reporter</th>
            <th className="px-4 py-3">Assigned</th>
            <th className="px-4 py-3">Created</th>
            <th className="px-4 py-3">Updated</th>
            <th className="px-4 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 bg-white">
          {bugs.map((bug) => (
            <tr key={bug.id} className="hover:bg-gray-50">
              <td className="px-4 py-3 font-mono text-xs text-gray-500">#{bug.id}</td>
              <td className="px-4 py-3 max-w-[220px] truncate font-medium text-gray-800">
                {bug.title}
              </td>
              <td className="px-4 py-3"><StatusBadge status={bug.status} /></td>
              <td className="px-4 py-3"><PriorityBadge priority={bug.priority} /></td>
              <td className="px-4 py-3"><SeverityBadge severity={bug.severity} /></td>
              <td className="px-4 py-3 text-gray-600">
                {bug.reporter_name || bug.reporter?.name || '—'}
              </td>
              <td className="px-4 py-3 text-gray-600">
                {bug.assigned_developer_name || bug.assigned_developer?.name || 'Unassigned'}
              </td>
              <td className="px-4 py-3 text-gray-500">{formatDate(bug.created_at)}</td>
              <td className="px-4 py-3 text-gray-500">{formatDate(bug.updated_at)}</td>
              <td className="px-4 py-3">
                <div className="flex items-center justify-end gap-2">
                  <Link
                    to={`/bugs/${bug.id}`}
                    className="rounded-md p-1.5 text-gray-500 hover:bg-primary-50 hover:text-primary-600"
                    title="View details"
                  >
                    <Eye size={16} />
                  </Link>
                  {canDelete && (
                    <button
                      onClick={() => onDelete?.(bug)}
                      className="rounded-md p-1.5 text-gray-500 hover:bg-red-50 hover:text-red-600"
                      title="Delete bug"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

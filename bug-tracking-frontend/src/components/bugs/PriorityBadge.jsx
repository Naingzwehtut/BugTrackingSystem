import { PRIORITY_COLORS } from '../../utils/constants'

export default function PriorityBadge({ priority }) {
  const cls = PRIORITY_COLORS[priority] || 'bg-gray-100 text-gray-700'
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${cls}`}>
      {priority}
    </span>
  )
}

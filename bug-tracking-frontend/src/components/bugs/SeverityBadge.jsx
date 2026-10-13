import { SEVERITY_COLORS } from '../../utils/constants'

export default function SeverityBadge({ severity }) {
  const cls = SEVERITY_COLORS[severity] || 'bg-gray-100 text-gray-700'
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${cls}`}>
      {severity}
    </span>
  )
}

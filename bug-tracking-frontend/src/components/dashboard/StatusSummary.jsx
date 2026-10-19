import StatusBadge from '../bugs/StatusBadge.jsx'
import { STATUS_LIST } from '../../utils/constants'

export default function StatusSummary({ bugs }) {
  const counts = STATUS_LIST.reduce((acc, s) => {
    acc[s] = bugs.filter((b) => b.status === s).length
    return acc
  }, {})

  return (
    <div className="card p-4">
      <h3 className="mb-3 text-sm font-semibold text-gray-800">Status Summary</h3>
      <div className="flex flex-col gap-2">
        {STATUS_LIST.map((s) => (
          <div key={s} className="flex items-center justify-between">
            <StatusBadge status={s} />
            <span className="text-sm font-medium text-gray-700">{counts[s]}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

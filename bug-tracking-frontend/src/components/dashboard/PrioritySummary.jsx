import PriorityBadge from '../bugs/PriorityBadge.jsx'
import { PRIORITY_LIST } from '../../utils/constants'

export default function PrioritySummary({ bugs }) {
  const counts = PRIORITY_LIST.reduce((acc, p) => {
    acc[p] = bugs.filter((b) => b.priority === p).length
    return acc
  }, {})

  return (
    <div className="card p-4">
      <h3 className="mb-3 text-sm font-semibold text-gray-800">Priority Summary</h3>
      <div className="flex flex-col gap-2">
        {PRIORITY_LIST.map((p) => (
          <div key={p} className="flex items-center justify-between">
            <PriorityBadge priority={p} />
            <span className="text-sm font-medium text-gray-700">{counts[p]}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

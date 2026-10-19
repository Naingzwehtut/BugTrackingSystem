import { Search } from 'lucide-react'
import { STATUS_LIST, PRIORITY_LIST, SEVERITY_LIST } from '../../utils/constants'

export default function BugFilters({ filters, onChange, developers = [], showDeveloperFilter }) {
  function update(field) {
    return (e) => onChange({ ...filters, [field]: e.target.value })
  }

  return (
    <div className="card mb-4 flex flex-col gap-3 p-4 lg:flex-row lg:items-center lg:flex-wrap">
      <div className="relative flex-1 min-w-[200px]">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          className="input pl-9"
          placeholder="Search bugs by title..."
          value={filters.search}
          onChange={update('search')}
        />
      </div>

      <select className="input lg:w-40" value={filters.status} onChange={update('status')}>
        <option value="">All Statuses</option>
        {STATUS_LIST.map((s) => (
          <option key={s} value={s}>{s}</option>
        ))}
      </select>

      <select className="input lg:w-40" value={filters.priority} onChange={update('priority')}>
        <option value="">All Priorities</option>
        {PRIORITY_LIST.map((p) => (
          <option key={p} value={p}>{p}</option>
        ))}
      </select>

      <select className="input lg:w-40" value={filters.severity} onChange={update('severity')}>
        <option value="">All Severities</option>
        {SEVERITY_LIST.map((s) => (
          <option key={s} value={s}>{s}</option>
        ))}
      </select>

      {showDeveloperFilter && (
        <select className="input lg:w-48" value={filters.developer} onChange={update('developer')}>
          <option value="">All Developers</option>
          {developers.map((d) => (
            <option key={d.id} value={d.id}>{d.name}</option>
          ))}
        </select>
      )}

      <select className="input lg:w-40" value={filters.sort} onChange={update('sort')}>
        <option value="newest">Newest first</option>
        <option value="oldest">Oldest first</option>
      </select>
    </div>
  )
}

import { Search, X } from 'lucide-react'
import Button from '@/components/ui/Button'
import { PRIORITY_LIST, SEVERITY_LIST, SORT_OPTIONS, STATUS_LIST } from '@/config/constants'

const asOptions = (list) => list.map((item) => ({ value: item, label: item }))
const STATUS_OPTIONS = asOptions(STATUS_LIST)
const PRIORITY_OPTIONS = asOptions(PRIORITY_LIST)
const SEVERITY_OPTIONS = asOptions(SEVERITY_LIST)

function FilterSelect({ label, value, onChange, allLabel, options }) {
  return (
    <select aria-label={label} className={`input ${value ? 'border-primary-300 bg-primary-50/40' : ''}`} value={value} onChange={onChange}>
      {allLabel && <option value="">{allLabel}</option>}
      {options.map(({ value: optionValue, label: optionLabel }) => (
        <option key={optionValue} value={optionValue}>
          {optionLabel}
        </option>
      ))}
    </select>
  )
}

/**
 * Search on top, then the filter/sort selects in a grid that grows from two
 * columns on phones (instead of five full-width rows) to one row on wide
 * screens. Active filters are tinted so it's obvious why the list is shorter
 * than expected.
 */
export default function BugFilters({ filters, onChange, developers = [], showDeveloperFilter, activeCount, onClear }) {
  const update = (field) => (event) => onChange({ ...filters, [field]: event.target.value })

  return (
    <div className="card flex flex-col gap-3 p-4">
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" aria-hidden="true" />
        <input
          type="search"
          aria-label="Search bugs by title or ID"
          className="input pl-9"
          placeholder="Search by title or #id..."
          value={filters.search}
          onChange={update('search')}
        />
      </div>

      <div className={`grid grid-cols-2 gap-3 sm:grid-cols-3 ${showDeveloperFilter ? 'lg:grid-cols-6' : 'lg:grid-cols-5'}`}>
        <FilterSelect label="Filter by status" allLabel="All statuses" value={filters.status} onChange={update('status')} options={STATUS_OPTIONS} />
        <FilterSelect label="Filter by priority" allLabel="All priorities" value={filters.priority} onChange={update('priority')} options={PRIORITY_OPTIONS} />
        <FilterSelect label="Filter by severity" allLabel="All severities" value={filters.severity} onChange={update('severity')} options={SEVERITY_OPTIONS} />
        {showDeveloperFilter && (
          <FilterSelect
            label="Filter by developer"
            allLabel="All developers"
            value={filters.developer}
            onChange={update('developer')}
            options={developers.map((d) => ({ value: d.id, label: d.name }))}
          />
        )}
        <select aria-label="Sort order" className="input" value={filters.sort} onChange={update('sort')}>
          {SORT_OPTIONS.map(({ value, label }) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
        {activeCount > 0 && (
          <Button variant="ghost" icon={X} onClick={onClear}>
            Clear ({activeCount})
          </Button>
        )}
      </div>
    </div>
  )
}

import { Link } from 'react-router-dom'
import { BugBadge } from '@/components/bugs/BugBadges'
import { BADGE_STYLES } from '@/config/constants'
import { bugListUrl } from '@/utils/bugFilters'

/**
 * Breakdown card: one row per value with a count and a proportional bar.
 * Each row links to the bug list filtered to that value.
 *   <SummaryCard title="Status" kind="status" counts={stats.byStatus} total={stats.total} />
 */
export default function SummaryCard({ title, kind, counts, total }) {
  return (
    <section className="card p-4">
      <h2 className="mb-3 text-sm font-semibold text-gray-800">{title}</h2>
      <ul className="flex flex-col gap-1">
        {Object.entries(counts).map(([key, count]) => {
          const percent = total > 0 ? Math.round((count / total) * 100) : 0
          return (
            <li key={key}>
              <Link
                to={bugListUrl({ [kind]: key })}
                className="-mx-2 block rounded-md px-2 py-1.5 hover:bg-gray-50"
                aria-label={`${key}: ${count} of ${total} bugs`}
              >
                <div className="mb-1.5 flex items-center justify-between">
                  <BugBadge kind={kind} value={key} />
                  <span className="text-sm font-medium tabular-nums text-gray-700">
                    {count}
                    <span className="ml-1.5 text-xs font-normal text-gray-400">{percent}%</span>
                  </span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-100" aria-hidden="true">
                  <div
                    className={`h-full rounded-full transition-all ${BADGE_STYLES[kind]?.[key]?.bar ?? 'bg-primary-500'}`}
                    style={{ width: `${percent}%` }}
                  />
                </div>
              </Link>
            </li>
          )
        })}
      </ul>
    </section>
  )
}

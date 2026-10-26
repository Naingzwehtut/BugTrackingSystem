import { useMemo } from 'react'
import ErrorState from '@/components/feedback/ErrorState'
import PageHeader from '@/components/ui/PageHeader'
import { useBugs } from '@/hooks/useBugs'
import { useLiveRefresh } from '@/hooks/useLiveRefresh'
import { bugListUrl } from '@/utils/bugFilters'
import { computeBugStats, getRecentBugs } from '@/utils/bugStats'
import DashboardSkeleton from './DashboardSkeleton'
import RecentBugs from './RecentBugs'
import StatCard from './StatCard'
import SummaryCard from './SummaryCard'

// Responsive grid classes (written out in full so Tailwind can detect them).
const GRID_COLUMNS = {
  3: 'grid-cols-1 sm:grid-cols-3',
  4: 'grid-cols-2 md:grid-cols-4',
  6: 'grid-cols-2 md:grid-cols-3 xl:grid-cols-6',
}

/**
 * The one dashboard layout shared by every role. Pages only describe what
 * differs:
 *   stats           [{ label, icon, tone, status? }]  - omit `status` for the total
 *   showPriority    also show the priority breakdown
 *   actions         optional header buttons
 *   intro           optional block under the header (e.g. the admin's invite card)
 *   emptyMessage / emptyAction   what to show when there are no bugs yet
 * Every number links to the bug list, pre-filtered to what it counts.
 */
export default function BugDashboard({ title, subtitle, stats: cards, showPriority = false, actions, intro, emptyMessage, emptyAction }) {
  const { data, loading, error, reload } = useBugs()
  useLiveRefresh(reload) // numbers update as teammates work
  const bugs = useMemo(() => data ?? [], [data])
  const stats = useMemo(() => computeBugStats(bugs), [bugs])
  const recent = useMemo(() => getRecentBugs(bugs), [bugs])

  if (loading) return <DashboardSkeleton cards={cards.length} />
  if (error) return <ErrorState message={error} onRetry={reload} />

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title={title} subtitle={subtitle} actions={actions} />
      {intro}

      <div className={`grid gap-4 ${GRID_COLUMNS[cards.length] ?? GRID_COLUMNS[4]}`}>
        {cards.map(({ label, icon, tone, status }) => (
          <StatCard
            key={label}
            label={label}
            icon={icon}
            tone={tone}
            value={status ? stats.byStatus[status] : stats.total}
            to={bugListUrl(status ? { status } : {})}
          />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <RecentBugs bugs={recent} emptyMessage={emptyMessage} emptyAction={emptyAction} />
        </div>
        <div className="flex flex-col gap-4">
          <SummaryCard title="Status Summary" kind="status" counts={stats.byStatus} total={stats.total} />
          {showPriority && (
            <SummaryCard title="Priority Summary" kind="priority" counts={stats.byPriority} total={stats.total} />
          )}
        </div>
      </div>
    </div>
  )
}

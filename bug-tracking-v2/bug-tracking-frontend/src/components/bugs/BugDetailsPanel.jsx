import { formatDateTime, formatRelative } from '@/utils/format'
import AssignDeveloper from './AssignDeveloper'

function Row({ label, children }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2.5 text-sm">
      <dt className="shrink-0 text-gray-500">{label}</dt>
      <dd className="min-w-0 text-right font-medium text-gray-800">{children}</dd>
    </div>
  )
}

function When({ value }) {
  return (
    <time dateTime={value} title={formatDateTime(value)}>
      {formatRelative(value)}
    </time>
  )
}

/**
 * Side-panel facts about the bug. Admins also get the assignment control
 * here, next to the current assignee, instead of in a separate card.
 */
export default function BugDetailsPanel({ bug, canAssign, developers, assigning, onAssign }) {
  return (
    <section className="card p-4" aria-labelledby="details-heading">
      <h2 id="details-heading" className="text-sm font-semibold text-gray-800">
        Details
      </h2>
      <dl className="divide-y divide-gray-100">
        <Row label="Assignee">
          {bug.assigned_developer_name ?? <span className="font-normal text-gray-400">Unassigned</span>}
        </Row>
        <Row label="Reporter">{bug.reporter_name ?? '—'}</Row>
        <Row label="Created">
          <When value={bug.created_at} />
        </Row>
        <Row label="Updated">
          <When value={bug.updated_at} />
        </Row>
      </dl>
      {canAssign && (
        <div className="mt-2 border-t border-gray-100 pt-3">
          <AssignDeveloper
            developers={developers}
            currentDeveloperId={bug.assigned_to}
            assigning={assigning}
            onAssign={onAssign}
          />
        </div>
      )}
    </section>
  )
}

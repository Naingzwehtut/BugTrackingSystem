import { History } from 'lucide-react'
import { describeHistoryEntry } from '@/utils/bugHistory'
import { formatDateTime, formatRelative } from '@/utils/format'

// Dot colour per kind of change, so the timeline can be scanned at a glance.
const DOT_BY_ACTION = {
  created: 'bg-gray-400',
  status_changed: 'bg-primary-500',
  assignment_changed: 'bg-purple-500',
  priority_changed: 'bg-orange-500',
  severity_changed: 'bg-red-500',
}

// Newest first: the latest change is what people usually want to see.
export default function BugHistory({ history }) {
  const entries = [...history].reverse()

  return (
    <section className="card p-4" aria-labelledby="history-heading">
      <h2 id="history-heading" className="mb-4 flex items-center gap-2 text-sm font-semibold text-gray-800">
        <History size={16} aria-hidden="true" /> Activity
      </h2>

      {entries.length === 0 ? (
        <p className="text-sm text-gray-500">No activity recorded yet.</p>
      ) : (
        <ol className="relative ml-1.5 border-l border-gray-200">
          {entries.map((entry) => (
            <li key={entry.id} className="relative mb-4 pl-4 last:mb-0">
              <span
                className={`absolute -left-[5px] top-1.5 h-2.5 w-2.5 rounded-full ring-4 ring-white ${DOT_BY_ACTION[entry.action] ?? 'bg-primary-500'}`}
                aria-hidden="true"
              />
              <p className="text-sm text-gray-700">{describeHistoryEntry(entry)}</p>
              <p className="text-xs text-gray-400">
                {entry.user_name && <>{entry.user_name} · </>}
                <time dateTime={entry.created_at} title={formatDateTime(entry.created_at)}>
                  {formatRelative(entry.created_at)}
                </time>
              </p>
            </li>
          ))}
        </ol>
      )}
    </section>
  )
}

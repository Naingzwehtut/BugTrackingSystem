import { ChevronRight, Trash2 } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import EmptyState from '@/components/feedback/EmptyState'
import { Table, TableBody, TableHead, Td, Th } from '@/components/ui/Table'
import { formatBugId, formatDate, formatDateTime, formatRelative } from '@/utils/format'
import { PriorityBadge, SeverityBadge, StatusBadge } from './BugBadges'

function DeleteButton({ bug, onDelete }) {
  return (
    <button
      type="button"
      onClick={() => onDelete(bug)}
      aria-label={`Delete ${bug.title}`}
      className="rounded-md p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600"
    >
      <Trash2 size={16} />
    </button>
  )
}

// Phones: one card per bug. A 10-column table squeezed to 390px hid the
// status column off-screen; cards show every key fact without sideways scrolling.
function BugCards({ bugs, canDelete, onDelete, linkState }) {
  return (
    <ul className="flex flex-col gap-3 md:hidden">
      {bugs.map((bug) => (
        <li key={bug.id} className="card relative p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="font-mono text-xs text-gray-400">{formatBugId(bug.id)}</p>
              <Link
                to={`/bugs/${bug.id}`}
                state={linkState}
                className="mt-0.5 block font-medium text-gray-900 after:absolute after:inset-0 after:rounded-xl"
              >
                {bug.title}
              </Link>
            </div>
            {canDelete ? (
              <div className="relative z-10">
                <DeleteButton bug={bug} onDelete={onDelete} />
              </div>
            ) : (
              <ChevronRight size={18} className="mt-4 shrink-0 text-gray-300" aria-hidden="true" />
            )}
          </div>
          <div className="mt-3 flex flex-wrap gap-1.5">
            <StatusBadge status={bug.status} />
            <PriorityBadge priority={bug.priority} label="Priority" />
            <SeverityBadge severity={bug.severity} label="Severity" />
          </div>
          <p className="mt-3 text-xs text-gray-500">
            {bug.assigned_developer_name ?? 'Unassigned'} · updated {formatRelative(bug.updated_at ?? bug.created_at)}
          </p>
        </li>
      ))}
    </ul>
  )
}

function BugRows({ bugs, canDelete, onDelete, linkState }) {
  return (
    <Table className="hidden md:block">
      <TableHead>
        <Th>ID</Th>
        <Th>Title</Th>
        <Th>Status</Th>
        <Th>Priority</Th>
        <Th>Severity</Th>
        <Th className="hidden lg:table-cell">Assigned</Th>
        <Th className="hidden xl:table-cell">Reporter</Th>
        <Th className="hidden xl:table-cell">Updated</Th>
        {canDelete && (
          <Th className="text-right">
            <span className="sr-only">Actions</span>
          </Th>
        )}
      </TableHead>
      <TableBody>
        {bugs.map((bug) => (
          <tr key={bug.id} className="group relative hover:bg-gray-50">
            <Td className="whitespace-nowrap font-mono text-xs text-gray-500">{formatBugId(bug.id)}</Td>
            <Td className="max-w-[320px]">
              {/* The link's ::after covers the row, so the whole row is clickable. */}
              <Link
                to={`/bugs/${bug.id}`}
                state={linkState}
                title={bug.title}
                className="block truncate font-medium text-gray-800 after:absolute after:inset-0 group-hover:text-primary-700"
              >
                {bug.title}
              </Link>
            </Td>
            <Td><StatusBadge status={bug.status} /></Td>
            <Td><PriorityBadge priority={bug.priority} /></Td>
            <Td><SeverityBadge severity={bug.severity} /></Td>
            <Td className="hidden whitespace-nowrap text-gray-600 lg:table-cell">
              {bug.assigned_developer_name || <span className="text-gray-400">Unassigned</span>}
            </Td>
            <Td className="hidden whitespace-nowrap text-gray-600 xl:table-cell">{bug.reporter_name || '—'}</Td>
            <Td className="hidden whitespace-nowrap text-gray-500 xl:table-cell">
              <time dateTime={bug.updated_at} title={formatDateTime(bug.updated_at)}>
                {formatDate(bug.updated_at)}
              </time>
            </Td>
            {canDelete && (
              <Td className="relative z-10 text-right">
                <DeleteButton bug={bug} onDelete={onDelete} />
              </Td>
            )}
          </tr>
        ))}
      </TableBody>
    </Table>
  )
}

export default function BugTable({ bugs, canDelete, onDelete, emptyMessage = 'No bugs found.', emptyDescription, emptyAction }) {
  // Lets the details page's "Back to bugs" return to this exact filtered list.
  const location = useLocation()
  const linkState = { from: `${location.pathname}${location.search}` }

  if (bugs.length === 0) {
    return (
      <div className="card">
        <EmptyState message={emptyMessage} description={emptyDescription} action={emptyAction} />
      </div>
    )
  }

  return (
    <>
      <BugCards bugs={bugs} canDelete={canDelete} onDelete={onDelete} linkState={linkState} />
      <BugRows bugs={bugs} canDelete={canDelete} onDelete={onDelete} linkState={linkState} />
    </>
  )
}

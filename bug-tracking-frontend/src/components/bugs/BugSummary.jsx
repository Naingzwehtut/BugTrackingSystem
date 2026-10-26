import { Check, Copy, Pencil } from 'lucide-react'
import { useState } from 'react'
import Button from '@/components/ui/Button'
import { formatBugId } from '@/utils/format'
import { PriorityBadge, SeverityBadge, StatusBadge } from './BugBadges'

// Click the reference to copy the full bug id (handy for chat or commit messages).
function CopyableId({ id }) {
  const [copied, setCopied] = useState(false)

  async function copy() {
    try {
      await navigator.clipboard.writeText(id)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      // Clipboard can be blocked (e.g. insecure origin); the id is still visible.
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      title="Copy full bug ID"
      className="group inline-flex items-center gap-1 rounded font-mono text-xs text-gray-400 hover:text-gray-600"
    >
      Bug {formatBugId(id)}
      {copied ? (
        <Check size={12} className="text-green-600" aria-hidden="true" />
      ) : (
        <Copy size={12} className="opacity-0 transition group-hover:opacity-100" aria-hidden="true" />
      )}
      <span className="sr-only" aria-live="polite">
        {copied ? 'Copied' : ''}
      </span>
    </button>
  )
}

// Title, labelled badges and (as children) the description.
export default function BugSummary({ bug, onEdit, children }) {
  return (
    <div className="card p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <CopyableId id={bug.id} />
          <h1 className="mt-0.5 break-words text-xl font-semibold text-gray-900">{bug.title}</h1>
        </div>
        {onEdit && (
          <Button variant="secondary" icon={Pencil} onClick={onEdit} className="shrink-0 px-3">
            <span className="hidden sm:inline">Edit</span>
            <span className="sr-only sm:hidden">Edit bug details</span>
          </Button>
        )}
      </div>

      {/* Labelled: "Critical" alone could be a priority or a severity. */}
      <div className="mt-3 flex flex-wrap gap-2">
        <StatusBadge status={bug.status} />
        <PriorityBadge priority={bug.priority} label="Priority" />
        <SeverityBadge severity={bug.severity} label="Severity" />
      </div>

      <div className="mt-5 border-t border-gray-100 pt-4">{children}</div>
    </div>
  )
}

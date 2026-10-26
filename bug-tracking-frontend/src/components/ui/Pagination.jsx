import { ChevronLeft, ChevronRight } from 'lucide-react'
import Button from './Button'

// "Showing 11–20 of 34" with Previous / Next. Renders nothing for a single page.
export default function Pagination({ page, pageSize, total, onPageChange }) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  if (totalPages <= 1) return null

  const first = (page - 1) * pageSize + 1
  const last = Math.min(page * pageSize, total)

  return (
    <nav
      aria-label="Pagination"
      className="flex flex-col items-center gap-3 text-sm text-gray-500 sm:flex-row sm:justify-between"
    >
      <p aria-live="polite">
        Showing <span className="font-medium text-gray-700">{first}–{last}</span> of{' '}
        <span className="font-medium text-gray-700">{total}</span>
      </p>
      <div className="flex items-center gap-2">
        <Button variant="secondary" icon={ChevronLeft} disabled={page === 1} onClick={() => onPageChange(page - 1)}>
          Previous
        </Button>
        <span className="whitespace-nowrap px-1 text-xs tabular-nums">
          Page {page} of {totalPages}
        </span>
        <Button variant="secondary" disabled={page === totalPages} onClick={() => onPageChange(page + 1)}>
          Next <ChevronRight size={16} aria-hidden="true" />
        </Button>
      </div>
    </nav>
  )
}

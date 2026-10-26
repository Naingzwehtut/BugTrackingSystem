// Intl formatters are comparatively expensive to build, so create them once.
const dateFormat = new Intl.DateTimeFormat(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
const dateTimeFormat = new Intl.DateTimeFormat(undefined, {
  year: 'numeric',
  month: 'short',
  day: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
})
const relativeFormat = new Intl.RelativeTimeFormat(undefined, { numeric: 'auto' })

function toDate(value) {
  if (!value) return null
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

function format(formatter, value) {
  const date = toDate(value)
  return date ? formatter.format(date) : '—'
}

export const formatDate = (value) => format(dateFormat, value)
export const formatDateTime = (value) => format(dateTimeFormat, value)

const UNITS = [
  ['year', 365 * 24 * 3600],
  ['month', 30 * 24 * 3600],
  ['week', 7 * 24 * 3600],
  ['day', 24 * 3600],
  ['hour', 3600],
  ['minute', 60],
]

/**
 * "just now", "5 minutes ago", "yesterday", "3 weeks ago".
 * Pair it with formatDateTime in a tooltip so the exact time is one hover away.
 */
export function formatRelative(value, now = Date.now()) {
  const date = toDate(value)
  if (!date) return '—'
  const seconds = Math.round((date.getTime() - now) / 1000)
  if (Math.abs(seconds) < 45) return 'just now'
  for (const [unit, size] of UNITS) {
    if (Math.abs(seconds) >= size || unit === 'minute') {
      return relativeFormat.format(Math.round(seconds / size), unit)
    }
  }
  return 'just now'
}

// Bug ids are UUIDs; show a short, readable reference instead of 36 characters.
export const BUG_REF_LENGTH = 8
export function formatBugId(id) {
  return id ? `#${String(id).slice(0, BUG_REF_LENGTH)}` : '—'
}

// "Aye Admin" -> "AA"; used for avatar circles.
export function initials(name = '') {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  return (parts[0][0] + (parts.length > 1 ? parts[parts.length - 1][0] : '')).toUpperCase()
}

import { PRIORITY_LIST, SEVERITY_LIST, SORT_OPTIONS, STATUS_LIST } from '@/config/constants'

export const DEFAULT_FILTERS = Object.freeze({
  search: '',
  status: '',
  priority: '',
  severity: '',
  developer: '',
  sort: 'newest',
})

const FILTER_KEYS = ['search', 'status', 'priority', 'severity', 'developer']

// Values accepted from the URL; anything else falls back to the default so a
// hand-edited link like ?status=Banana can't produce a confusing empty list.
const ALLOWED = {
  status: STATUS_LIST,
  priority: PRIORITY_LIST,
  severity: SEVERITY_LIST,
  sort: SORT_OPTIONS.map((option) => option.value),
}

export function countActiveFilters(filters) {
  return FILTER_KEYS.filter((key) => filters[key]).length
}

/** URLSearchParams -> { filters, page }. Invalid values are dropped. */
export function parseListParams(params) {
  const filters = { ...DEFAULT_FILTERS }
  for (const key of Object.keys(DEFAULT_FILTERS)) {
    const value = params.get(key)
    if (value && (!ALLOWED[key] || ALLOWED[key].includes(value))) filters[key] = value
  }
  const page = Number.parseInt(params.get('page'), 10)
  return { filters, page: Number.isFinite(page) && page > 0 ? page : 1 }
}

/** { filters, page } -> URLSearchParams, leaving defaults out to keep links short. */
export function buildListParams(filters, page = 1) {
  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(filters)) {
    if (value && value !== DEFAULT_FILTERS[key]) params.set(key, value)
  }
  if (page > 1) params.set('page', String(page))
  return params
}

/** Link target for a pre-filtered bug list, e.g. bugListUrl({ status: 'Open' }). */
export function bugListUrl(filters = {}) {
  const query = buildListParams({ ...DEFAULT_FILTERS, ...filters }).toString()
  return query ? `/bugs?${query}` : '/bugs'
}

const time = (value) => {
  const ms = new Date(value).getTime()
  return Number.isNaN(ms) ? 0 : ms
}
const rank = (list, value) => list.indexOf(value)

// Each comparator sorts "most relevant first"; ties fall back to newest.
const COMPARATORS = {
  newest: (a, b) => time(b.created_at) - time(a.created_at),
  oldest: (a, b) => time(a.created_at) - time(b.created_at),
  updated: (a, b) => time(b.updated_at ?? b.created_at) - time(a.updated_at ?? a.created_at),
  priority: (a, b) => rank(PRIORITY_LIST, b.priority) - rank(PRIORITY_LIST, a.priority),
  severity: (a, b) => rank(SEVERITY_LIST, b.severity) - rank(SEVERITY_LIST, a.severity),
}

function matchesSearch(bug, query) {
  if (!query) return true
  // "#1a2b" or "1a2b" finds a bug by the short reference shown in the UI.
  const idQuery = query.replace(/^#/, '')
  return bug.title?.toLowerCase().includes(query) || (idQuery.length >= 3 && String(bug.id).startsWith(idQuery))
}

// Pure filter + sort used by the bug list (kept out of the component so it
// can be unit-tested and memoised cleanly).
export function filterAndSortBugs(bugs, filters) {
  const query = filters.search.trim().toLowerCase()

  const result = bugs.filter(
    (bug) =>
      matchesSearch(bug, query) &&
      (!filters.status || bug.status === filters.status) &&
      (!filters.priority || bug.priority === filters.priority) &&
      (!filters.severity || bug.severity === filters.severity) &&
      (!filters.developer || bug.assigned_to === filters.developer),
  )

  const compare = COMPARATORS[filters.sort] ?? COMPARATORS.newest
  return result.sort((a, b) => compare(a, b) || COMPARATORS.newest(a, b))
}

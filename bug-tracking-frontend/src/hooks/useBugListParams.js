import { useCallback, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { buildListParams, DEFAULT_FILTERS, parseListParams } from '@/utils/bugFilters'

/**
 * Bug-list filters, sort and page, stored in the URL (?status=Open&page=2).
 *
 * Previously they lived in component state, so opening a bug and pressing
 * Back reset everything. In the URL they survive Back/Forward and reloads,
 * can be shared as a link, and let dashboard cards link straight to a
 * filtered list.
 */
export function useBugListParams() {
  const [searchParams, setSearchParams] = useSearchParams()
  const { filters, page } = useMemo(() => parseListParams(searchParams), [searchParams])

  // Filter edits replace the history entry (typing in search shouldn't add
  // one entry per keystroke); page changes push one so Back returns to it.
  const setFilters = useCallback(
    (next) => setSearchParams(buildListParams(next, 1), { replace: true }),
    [setSearchParams],
  )
  const setPage = useCallback(
    (nextPage) => setSearchParams(buildListParams(filters, nextPage)),
    [filters, setSearchParams],
  )
  const clearFilters = useCallback(() => setFilters(DEFAULT_FILTERS), [setFilters])

  return { filters, page, setFilters, setPage, clearFilters }
}


import { useEffect, useRef } from 'react'
import { useNotifications } from './useNotifications'

/**
 * Re-run `reload({ silent: true })` when a new live notification arrives
 * that `matches(notification)` - e.g. a bug page refreshes when someone
 * changes that bug, without the person pressing anything.
 */
export function useLiveRefresh(reload, matches = (notification) => Boolean(notification.bug_id)) {
  const { items } = useNotifications()
  const latest = items[0]
  const seen = useRef(latest?.id)
  const matchesRef = useRef(matches)
  useEffect(() => {
    matchesRef.current = matches
  })

  useEffect(() => {
    if (!latest || latest.id === seen.current) return
    seen.current = latest.id
    if (matchesRef.current(latest)) reload({ silent: true })
  }, [latest, reload])
}

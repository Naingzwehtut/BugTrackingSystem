import { useCallback, useState } from 'react'
import * as bugService from '@/services/bugService'
import * as commentService from '@/services/commentService'
import * as userService from '@/services/userService'
import { getErrorMessage } from '@/services/api'
import { useFetch } from './useFetch'
import { useToast } from './useToast'

/**
 * Everything the bug-details page needs: the bug, its comments and history
 * (loaded in parallel), the developer list for admins, and the actions that
 * change them.
 *
 * Actions update local state from the API response instead of reloading the
 * whole page, so the screen doesn't flash a spinner or lose scroll position.
 * `pending.<action>` is truthy while that action runs (for status changes it
 * holds the target status, so only the clicked button shows a spinner).
 */
export function useBugDetails(bugId, { isAdmin }) {
  const toast = useToast()
  const [pending, setPending] = useState({})

  const { data, loading, error, reload, setData } = useFetch(
    async (signal) => {
      const [bug, comments, history, developers] = await Promise.all([
        bugService.getBugById(bugId, { signal }),
        commentService.getComments(bugId, { signal }),
        bugService.getBugHistory(bugId, { signal }),
        isAdmin ? userService.getDevelopers({ signal }) : Promise.resolve([]),
      ])
      return { bug, comments, history, developers }
    },
    [bugId, isAdmin],
  )

  const refreshHistory = useCallback(async () => {
    try {
      const history = await bugService.getBugHistory(bugId)
      setData((current) => current && { ...current, history })
    } catch {
      // The audit trail is secondary; a failed refresh shouldn't interrupt the user.
    }
  }, [bugId, setData])

  // Runs an action with a pending flag + toast feedback. Resolves to the
  // action's result, or null if it failed.
  const perform = useCallback(
    async (key, action, successMessage, pendingValue = true) => {
      setPending((current) => ({ ...current, [key]: pendingValue }))
      try {
        const result = await action()
        if (successMessage) toast.success(successMessage)
        return result
      } catch (err) {
        toast.error(getErrorMessage(err))
        return null
      } finally {
        setPending((current) => ({ ...current, [key]: false }))
      }
    },
    [toast],
  )

  // Apply an updated bug from the API; optionally re-read the audit trail.
  const applyBug = useCallback(
    (bug, { withHistory = false } = {}) => {
      if (!bug) return false
      setData((current) => current && { ...current, bug })
      if (withHistory) refreshHistory()
      return true
    },
    [setData, refreshHistory],
  )

  const assign = useCallback(
    async (developerId) =>
      applyBug(
        await perform('assign', () => bugService.assignBug(bugId, developerId), 'Developer assigned.'),
        { withHistory: true },
      ),
    [bugId, perform, applyBug],
  )

  const changeStatus = useCallback(
    async (status) =>
      applyBug(
        await perform('status', () => bugService.updateBugStatus(bugId, status), `Status changed to ${status}.`, status),
        { withHistory: true },
      ),
    [bugId, perform, applyBug],
  )

  const saveDescription = useCallback(
    async (description) =>
      applyBug(await perform('description', () => bugService.updateBug(bugId, { description }), 'Description updated.')),
    [bugId, perform, applyBug],
  )

  // Admin triage: title / priority / severity (priority & severity changes are audited).
  const saveDetails = useCallback(
    async (fields) =>
      applyBug(await perform('details', () => bugService.updateBug(bugId, fields), 'Bug details updated.'), {
        withHistory: true,
      }),
    [bugId, perform, applyBug],
  )

  const addComment = useCallback(
    async (text) => {
      const comment = await perform('comment', () => commentService.addComment(bugId, text))
      if (comment) setData((current) => current && { ...current, comments: [...current.comments, comment] })
      return Boolean(comment)
    },
    [bugId, perform, setData],
  )

  return { ...data, loading, error, reload, pending, assign, changeStatus, saveDescription, saveDetails, addComment }
}

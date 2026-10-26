import axios from 'axios'
import { useCallback, useEffect, useRef, useState } from 'react'
import { getErrorMessage } from '@/services/api'

/**
 * Run an async loader and track { data, loading, error }.
 *
 *   const { data, loading, error, reload, setData } = useFetch(
 *     (signal) => bugService.getBugs({}, { signal }),
 *     [],            // re-run when these change
 *   )
 *
 * - The loader receives an AbortSignal; in-flight requests are cancelled when
 *   the component unmounts, the deps change, or `reload` is called again, so a
 *   slow old response can never overwrite a newer one.
 * - `reload({ silent: true })` refreshes without flipping back to the spinner.
 * - `setData` lets callers update local state after a mutation (no refetch).
 */
export function useFetch(loader, deps = []) {
  const [state, setState] = useState({ data: null, loading: true, error: '' })
  const loaderRef = useRef(loader)
  const controllerRef = useRef(null)

  useEffect(() => {
    loaderRef.current = loader
  })

  const load = useCallback(async ({ silent = false } = {}) => {
    controllerRef.current?.abort()
    const controller = new AbortController()
    controllerRef.current = controller

    if (!silent) setState((previous) => ({ ...previous, loading: true, error: '' }))
    try {
      const data = await loaderRef.current(controller.signal)
      if (!controller.signal.aborted) setState({ data, loading: false, error: '' })
    } catch (error) {
      if (axios.isCancel(error) || controller.signal.aborted) return
      setState((previous) => ({ ...previous, loading: false, error: getErrorMessage(error) }))
    }
  }, [])

  useEffect(() => {
    load()
    return () => controllerRef.current?.abort()
    // `deps` is supplied by the caller; `load` is stable.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [load, ...deps])

  const setData = useCallback((update) => {
    setState((previous) => ({
      ...previous,
      data: typeof update === 'function' ? update(previous.data) : update,
    }))
  }, [])

  return { ...state, reload: load, setData }
}

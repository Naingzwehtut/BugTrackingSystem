import axios from 'axios'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useToast } from '@/hooks/useToast'
import { setUnauthorizedHandler } from '@/services/api'
import * as authService from '@/services/authService'
import { tokenStorage } from '@/utils/storage'
import { AuthContext } from './authContext'

const EMPTY_SESSION = { user: null, project: null, adminRequest: null }

const toSession = (data) => ({
  user: data?.user ?? null,
  project: data?.project ?? null,
  adminRequest: data?.admin_request ?? null,
})

/**
 * The signed-in session: the user, their project (null until they create or
 * join one) and their latest admin request. `refreshSession()` re-reads it
 * after anything that changes role or project (creating/joining a project,
 * an owner approving a request, an admin promoting you).
 */
export function AuthProvider({ children }) {
  const [session, setSession] = useState(EMPTY_SESSION)
  const toast = useToast()
  const userRef = useRef(null)
  useEffect(() => {
    userRef.current = session.user
  }, [session.user])

  // Only "loading" if there is a stored token to verify.
  const [loading, setLoading] = useState(() => Boolean(tokenStorage.get()))

  const clearSession = useCallback(() => {
    tokenStorage.clear()
    setSession(EMPTY_SESSION)
  }, [])

  // Restore the session from a stored token on first load.
  useEffect(() => {
    if (!tokenStorage.get()) return undefined
    const controller = new AbortController()

    authService
      .getSession({ signal: controller.signal })
      .then((data) => setSession(toSession(data)))
      .catch((error) => {
        if (!axios.isCancel(error)) clearSession()
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false)
      })

    return () => controller.abort()
  }, [clearSession])

  // Let the HTTP layer sign us out when the server rejects our token. Tell
  // the person why they landed on the login page (only if they were signed in
  // - a stale token being rejected on first load needs no announcement).
  useEffect(() => {
    setUnauthorizedHandler(() => {
      if (userRef.current) toast.info('Your session has expired. Please sign in again.')
      clearSession()
    })
    return () => setUnauthorizedHandler(null)
  }, [clearSession, toast])

  const login = useCallback(async (email, password) => {
    const data = await authService.login(email, password)
    tokenStorage.set(data.token)
    setSession(toSession(data))
    return data.user
  }, [])

  const refreshSession = useCallback(async () => {
    try {
      const data = await authService.getSession()
      setSession(toSession(data))
      return toSession(data)
    } catch {
      return null
    }
  }, [])

  const updateUser = useCallback((user) => setSession((current) => ({ ...current, user })), [])

  const value = useMemo(
    () => ({
      ...session,
      loading,
      login,
      register: authService.register,
      logout: clearSession,
      refreshSession,
      updateUser,
    }),
    [session, loading, login, clearSession, refreshSession, updateUser],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

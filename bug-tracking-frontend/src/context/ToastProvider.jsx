import { CheckCircle2, Info, X, XCircle } from 'lucide-react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { ToastContext } from './toastContext'

const TOAST_DURATION_MS = 5000
const MAX_TOASTS = 4

const VARIANTS = {
  success: { icon: CheckCircle2, iconClass: 'text-green-600', border: 'border-green-200' },
  error: { icon: XCircle, iconClass: 'text-red-600', border: 'border-red-200' },
  info: { icon: Info, iconClass: 'text-blue-600', border: 'border-blue-200' },
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const timers = useRef(new Map())
  const nextId = useRef(0)

  const dismiss = useCallback((id) => {
    clearTimeout(timers.current.get(id))
    timers.current.delete(id)
    setToasts((current) => current.filter((toast) => toast.id !== id))
  }, [])

  const show = useCallback(
    (message, type = 'info') => {
      if (!message) return
      const id = ++nextId.current
      setToasts((current) => [...current, { id, message, type }].slice(-MAX_TOASTS))
      timers.current.set(id, setTimeout(() => dismiss(id), TOAST_DURATION_MS))
    },
    [dismiss],
  )

  // Don't leave timers running if the provider ever unmounts.
  useEffect(() => {
    const pending = timers.current
    return () => pending.forEach(clearTimeout)
  }, [])

  const toast = useMemo(
    () => ({
      success: (message) => show(message, 'success'),
      error: (message) => show(message, 'error'),
      info: (message) => show(message, 'info'),
    }),
    [show],
  )

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed right-0 top-16 z-50 flex w-full max-w-sm flex-col gap-2 px-4 sm:right-4 sm:px-0"
      >
        {toasts.map(({ id, message, type }) => {
          const { icon: Icon, iconClass, border } = VARIANTS[type] ?? VARIANTS.info
          return (
            <div
              key={id}
              role={type === 'error' ? 'alert' : 'status'}
              className={`pointer-events-auto flex items-start gap-2 rounded-lg border bg-white px-4 py-3 shadow-lg ${border}`}
            >
              <Icon size={18} className={`mt-0.5 shrink-0 ${iconClass}`} />
              <p className="flex-1 text-sm text-gray-700">{message}</p>
              <button
                type="button"
                onClick={() => dismiss(id)}
                aria-label="Dismiss notification"
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={14} />
              </button>
            </div>
          )
        })}
      </div>
    </ToastContext.Provider>
  )
}

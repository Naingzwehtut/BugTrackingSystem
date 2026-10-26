import { X } from 'lucide-react'
import { useEffect, useId, useRef } from 'react'

const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

const SIZES = { sm: 'max-w-md', md: 'max-w-lg' }

/**
 * Accessible dialog:
 *  - Escape or a backdrop click closes it (unless `dismissible` is false,
 *    e.g. while a request is running)
 *  - focus moves into the dialog, Tab stays inside it, and focus returns to
 *    the trigger on close
 *  - the page behind doesn't scroll
 *
 * `onClose` is read through a ref. Callers usually pass an inline arrow, and
 * having it in the effect's deps re-ran the effect on every render - which
 * yanked focus back to the dialog container mid-interaction.
 */
export default function Modal({ title, description, isOpen, onClose, dismissible = true, size = 'sm', children }) {
  const titleId = useId()
  const descriptionId = useId()
  const dialogRef = useRef(null)
  const onCloseRef = useRef(onClose)
  const dismissibleRef = useRef(dismissible)

  useEffect(() => {
    onCloseRef.current = onClose
    dismissibleRef.current = dismissible
  })

  useEffect(() => {
    if (!isOpen) return undefined
    const previouslyFocused = document.activeElement
    const dialog = dialogRef.current
    const first = dialog?.querySelector('[data-autofocus]') ?? dialog
    first?.focus()

    const { overflow } = document.body.style
    document.body.style.overflow = 'hidden'

    function onKeyDown(event) {
      if (event.key === 'Escape' && dismissibleRef.current) {
        onCloseRef.current()
        return
      }
      if (event.key !== 'Tab' || !dialog) return
      const items = [...dialog.querySelectorAll(FOCUSABLE)]
      if (items.length === 0) return
      const [head, tail] = [items[0], items[items.length - 1]]
      if (event.shiftKey && (document.activeElement === head || document.activeElement === dialog)) {
        event.preventDefault()
        tail.focus()
      } else if (!event.shiftKey && document.activeElement === tail) {
        event.preventDefault()
        head.focus()
      }
    }

    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = overflow
      previouslyFocused?.focus?.()
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-40 flex items-end justify-center bg-gray-900/40 p-4 backdrop-blur-[1px] sm:items-center"
      onMouseDown={(event) => event.target === event.currentTarget && dismissible && onClose()}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descriptionId : undefined}
        tabIndex={-1}
        className={`card w-full ${SIZES[size] ?? SIZES.sm} p-5 shadow-xl focus:outline-none`}
      >
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <h2 id={titleId} className="text-base font-semibold text-gray-900">
              {title}
            </h2>
            {description && (
              <p id={descriptionId} className="mt-1 text-sm text-gray-500">
                {description}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={!dismissible}
            aria-label="Close dialog"
            className="-m-1 rounded-md p-1 text-gray-400 hover:text-gray-600 disabled:opacity-40"
          >
            <X size={18} />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}

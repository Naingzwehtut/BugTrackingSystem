import { X } from 'lucide-react'
import { useEffect } from 'react'
import { NavLink } from 'react-router-dom'
import { NAV_ITEMS } from '@/config/navigation'
import { useNotifications } from '@/hooks/useNotifications'

export default function Sidebar({ role, open, onClose }) {
  const items = NAV_ITEMS[role] ?? []
  const { unreadCount } = useNotifications()

  // Escape closes the mobile drawer.
  useEffect(() => {
    if (!open) return undefined
    const onKeyDown = (event) => event.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [open, onClose])

  return (
    <>
      {open && <div className="fixed inset-0 z-30 bg-black/40 lg:hidden" onClick={onClose} aria-hidden="true" />}

      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 transform border-r border-gray-200 bg-white transition-transform lg:static lg:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
          <div className="flex items-center gap-2">
            <img src="/logo.svg" alt="" className="h-8 w-8" />
            <span className="font-semibold text-gray-900">BugTrack</span>
          </div>
          <button type="button" onClick={onClose} aria-label="Close menu" className="text-gray-400 hover:text-gray-600 lg:hidden">
            <X size={20} />
          </button>
        </div>

        <nav aria-label="Primary" className="flex flex-col gap-1 p-3">
          {items.map(({ label, to, icon: Icon }) => (
            <NavLink
              key={label}
              to={to}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  isActive ? 'bg-primary-50 text-primary-700' : 'text-gray-600 hover:bg-gray-100'
                }`
              }
            >
              <Icon size={18} aria-hidden="true" />
              <span className="flex-1">{label}</span>
              {to === '/notifications' && unreadCount > 0 && (
                <span className="rounded-full bg-red-500 px-1.5 py-0.5 text-[11px] font-semibold leading-none text-white">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  )
}

import { ChevronDown, LogOut, Menu, Settings } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { ROLE_LABELS } from '@/config/constants'
import { initials } from '@/utils/format'
import NotificationBell from '@/components/notifications/NotificationBell'

export default function Topbar({ onMenuClick }) {
  const { user, project, logout } = useAuth()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const menuRef = useRef(null)

  // Close the menu on outside click or Escape.
  useEffect(() => {
    if (!open) return undefined
    const onPointerDown = (event) => !menuRef.current?.contains(event.target) && setOpen(false)
    const onKeyDown = (event) => event.key === 'Escape' && setOpen(false)
    document.addEventListener('mousedown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('mousedown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  function handleLogout() {
    logout()
    navigate('/login')
  }

  return (
    <header className="sticky top-0 z-20 flex items-center justify-between border-b border-gray-200 bg-white/90 px-4 py-3 backdrop-blur lg:px-6">
      <button type="button" onClick={onMenuClick} aria-label="Open menu" className="-ml-1 rounded-md p-1 text-gray-500 hover:text-gray-700 lg:hidden">
        <Menu size={22} />
      </button>
      <p className="hidden truncate text-sm text-gray-500 lg:block">
        {project ? (
          <>
            Project: <span className="font-medium text-gray-800">{project.name}</span>
          </>
        ) : (
          'Platform administration'
        )}
      </p>

      <div className="flex items-center gap-1 sm:gap-2">
      <NotificationBell />
      <div className="relative" ref={menuRef}>
        <button
          type="button"
          onClick={() => setOpen((current) => !current)}
          aria-haspopup="menu"
          aria-expanded={open}
          className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-gray-100"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-100 text-sm font-semibold text-primary-700">
            {initials(user?.name)}
          </span>
          <span className="hidden text-left sm:block">
            <span className="block text-sm font-medium leading-tight text-gray-800">{user?.name}</span>
            <span className="block text-xs leading-tight text-gray-400">{ROLE_LABELS[user?.role]}</span>
          </span>
          <ChevronDown size={16} className="text-gray-400" aria-hidden="true" />
        </button>

        {open && (
          <div role="menu" className="absolute right-0 mt-2 w-56 rounded-lg border border-gray-200 bg-white py-1 shadow-lg">
            <div className="border-b border-gray-100 px-4 py-2.5">
              <p className="truncate text-sm font-medium text-gray-800">{user?.name}</p>
              <p className="truncate text-xs text-gray-500">{user?.email}</p>
            </div>
            <Link
              to="/settings"
              role="menuitem"
              onClick={() => setOpen(false)}
              className="flex w-full items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
            >
              <Settings size={16} aria-hidden="true" /> Settings
            </Link>
            <button
              type="button"
              role="menuitem"
              onClick={handleLogout}
              className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
            >
              <LogOut size={16} aria-hidden="true" /> Sign out
            </button>
          </div>
        )}
      </div>
      </div>
    </header>
  )
}

import { useState, useRef, useEffect } from 'react'
import { Menu, ChevronDown, LogOut, User } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { useNavigate } from 'react-router-dom'

export default function Topbar({ onMenuClick }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  function handleLogout() {
    logout()
    navigate('/login')
  }

  return (
    <header className="sticky top-0 z-20 flex items-center justify-between border-b border-gray-200 bg-white px-4 py-3 lg:px-6">
      <button onClick={onMenuClick} className="text-gray-500 hover:text-gray-700 lg:hidden">
        <Menu size={22} />
      </button>

      <div className="hidden lg:block" />

      <div className="relative" ref={ref}>
        <button
          onClick={() => setOpen((o) => !o)}
          className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-gray-100"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-100 text-primary-700 font-semibold text-sm">
            {user?.name?.[0]?.toUpperCase() || <User size={16} />}
          </div>
          <div className="hidden text-left sm:block">
            <p className="text-sm font-medium text-gray-800 leading-tight">{user?.name}</p>
            <p className="text-xs text-gray-400 capitalize leading-tight">{user?.role}</p>
          </div>
          <ChevronDown size={16} className="text-gray-400" />
        </button>

        {open && (
          <div className="absolute right-0 mt-2 w-44 rounded-lg border border-gray-200 bg-white py-1 shadow-lg">
            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
            >
              <LogOut size={16} /> Logout
            </button>
          </div>
        )}
      </div>
    </header>
  )
}

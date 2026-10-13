import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  Bug,
  PlusCircle,
  Users,
  Bell,
  Settings,
  X,
  ListChecks,
} from 'lucide-react'
import { ROLES } from '../../utils/constants'

const NAV_ITEMS = {
  [ROLES.ADMIN]: [
    { label: 'Dashboard', to: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'Bugs', to: '/bugs', icon: Bug },
    { label: 'Users', to: '/admin/users', icon: Users },
    { label: 'Notifications', to: '/notifications', icon: Bell },
    { label: 'Settings', to: '/settings', icon: Settings },
  ],
  [ROLES.TESTER]: [
    { label: 'Dashboard', to: '/tester/dashboard', icon: LayoutDashboard },
    { label: 'My Bugs', to: '/bugs', icon: Bug },
    { label: 'Create Bug', to: '/tester/create-bug', icon: PlusCircle },
    { label: 'Notifications', to: '/notifications', icon: Bell },
    { label: 'Settings', to: '/settings', icon: Settings },
  ],
  [ROLES.DEVELOPER]: [
    { label: 'Dashboard', to: '/developer/dashboard', icon: LayoutDashboard },
    { label: 'Assigned Bugs', to: '/developer/dashboard', icon: ListChecks },
    { label: 'All Bugs', to: '/bugs', icon: Bug },
    { label: 'Notifications', to: '/notifications', icon: Bell },
    { label: 'Settings', to: '/settings', icon: Settings },
  ],
}

export default function Sidebar({ role, open, onClose }) {
  const items = NAV_ITEMS[role] || []

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div className="fixed inset-0 z-30 bg-black/40 lg:hidden" onClick={onClose} />
      )}

      <aside
        className={`fixed z-40 inset-y-0 left-0 w-64 transform bg-white border-r border-gray-200 transition-transform lg:static lg:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <img src="/logo.svg" alt="Logo" className="h-8 w-8" />
            <span className="font-semibold text-gray-900">BugTrack</span>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 lg:hidden">
            <X size={20} />
          </button>
        </div>

        <nav className="flex flex-col gap-1 p-3">
          {items.map(({ label, to, icon: Icon }) => (
            <NavLink
              key={label}
              to={to}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  )
}

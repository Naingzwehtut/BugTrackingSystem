import { LayoutDashboard, Bug, Users, Bell, Settings, ListChecks, PlusCircle, FolderKanban } from 'lucide-react'
import { ROLES } from './constants'

// Sidebar links per role, in the order they should render.
export const NAV_CONFIG = {
  [ROLES.ADMIN]: [
    { label: 'Dashboard', to: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'Bugs', to: '/admin/bugs', icon: Bug },
    { label: 'Users', to: '/admin/users', icon: Users },
    { label: 'Notifications', to: '/admin/notifications', icon: Bell },
    { label: 'Settings', to: '/admin/settings', icon: Settings },
  ],
  [ROLES.TESTER]: [
    { label: 'Dashboard', to: '/tester/dashboard', icon: LayoutDashboard },
    { label: 'My Bugs', to: '/tester/bugs', icon: ListChecks },
    { label: 'Create Bug', to: '/tester/bugs/new', icon: PlusCircle },
    { label: 'Notifications', to: '/tester/notifications', icon: Bell },
    { label: 'Settings', to: '/tester/settings', icon: Settings },
  ],
  [ROLES.DEVELOPER]: [
    { label: 'Dashboard', to: '/developer/dashboard', icon: LayoutDashboard },
    { label: 'Assigned Bugs', to: '/developer/assigned', icon: FolderKanban },
    { label: 'All Bugs', to: '/developer/bugs', icon: Bug },
    { label: 'Notifications', to: '/developer/notifications', icon: Bell },
    { label: 'Settings', to: '/developer/settings', icon: Settings },
  ],
}

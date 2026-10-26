import { Bell, Bug, FolderKanban, Inbox, LayoutDashboard, LifeBuoy, ListChecks, PlusCircle, Settings, ShieldCheck, Users } from 'lucide-react'
import { ROLES } from './constants'

const common = [
  { label: 'Notifications', to: '/notifications', icon: Bell },
  { label: 'Settings', to: '/settings', icon: Settings },
]

// Sidebar links per role, in display order. One source of truth (the app
// previously had two diverging copies, one of them unused and pointing at
// routes that didn't exist).
export const NAV_ITEMS = {
  [ROLES.OWNER]: [
    { label: 'Admin Requests', to: '/owner/requests', icon: ShieldCheck },
    { label: 'Projects', to: '/owner/projects', icon: Inbox },
    ...common,
  ],
  [ROLES.ADMIN]: [
    { label: 'Dashboard', to: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'Bugs', to: '/bugs', icon: Bug },
    { label: 'Users', to: '/admin/users', icon: Users },
    { label: 'Help Center', to: '/admin/help', icon: LifeBuoy },
    ...common,
  ],
  [ROLES.TESTER]: [
    { label: 'Dashboard', to: '/tester/dashboard', icon: LayoutDashboard },
    { label: 'Bugs', to: '/bugs', icon: ListChecks },
    { label: 'Create Bug', to: '/tester/create-bug', icon: PlusCircle },
    ...common,
  ],
  [ROLES.DEVELOPER]: [
    { label: 'Dashboard', to: '/developer/dashboard', icon: LayoutDashboard },
    { label: 'Assigned Bugs', to: '/bugs', icon: FolderKanban },
    ...common,
  ],
}

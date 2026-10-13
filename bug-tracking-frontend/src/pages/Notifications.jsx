import { Bell } from 'lucide-react'
import EmptyState from '../components/common/EmptyState.jsx'

export default function Notifications() {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-xl font-semibold text-gray-900">Notifications</h1>
        <p className="text-sm text-gray-500">Stay up to date with bug activity.</p>
      </div>
      <div className="card p-4">
        <EmptyState message="No notifications yet." icon={Bell} />
      </div>
    </div>
  )
}

import { Inbox } from 'lucide-react'

export default function EmptyState({ message = 'No data found.', description, icon: Icon = Inbox, action }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 px-4 py-14 text-center text-gray-400">
      <Icon size={36} aria-hidden="true" />
      <p className="text-sm font-medium text-gray-500">{message}</p>
      {description && <p className="text-xs">{description}</p>}
      {action}
    </div>
  )
}

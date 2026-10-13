import { Inbox } from 'lucide-react'

export default function EmptyState({ message = 'No data found.', icon: Icon = Inbox }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-14 text-gray-400">
      <Icon size={36} />
      <p className="text-sm">{message}</p>
    </div>
  )
}

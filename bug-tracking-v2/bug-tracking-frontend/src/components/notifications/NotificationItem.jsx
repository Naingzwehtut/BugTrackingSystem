import { AtSign, Bug, CheckCircle2, LifeBuoy, MessageSquare, RotateCcw, ShieldCheck, UserCog, UserPlus } from 'lucide-react'
import { formatDateTime, formatRelative } from '@/utils/format'

// Icon + colour per notification type, so the list can be scanned at a glance.
const TYPE_STYLES = {
  bug_created: { icon: Bug, tone: 'bg-blue-50 text-blue-600' },
  bug_assigned: { icon: AtSign, tone: 'bg-purple-50 text-purple-600' },
  bug_unassigned: { icon: AtSign, tone: 'bg-gray-100 text-gray-500' },
  status_changed: { icon: CheckCircle2, tone: 'bg-green-50 text-green-600' },
  comment_added: { icon: MessageSquare, tone: 'bg-primary-50 text-primary-600' },
  bug_updated: { icon: RotateCcw, tone: 'bg-orange-50 text-orange-600' },
  role_changed: { icon: UserCog, tone: 'bg-purple-50 text-purple-600' },
  member_joined: { icon: UserPlus, tone: 'bg-teal-50 text-teal-600' },
  admin_requested: { icon: ShieldCheck, tone: 'bg-amber-50 text-amber-600' },
  admin_request_decided: { icon: ShieldCheck, tone: 'bg-green-50 text-green-600' },
  support_question: { icon: LifeBuoy, tone: 'bg-amber-50 text-amber-600' },
  support_answered: { icon: LifeBuoy, tone: 'bg-green-50 text-green-600' },
}
const FALLBACK = { icon: Bug, tone: 'bg-gray-100 text-gray-500' }

/** One notification row; used by the bell dropdown and the Notifications page. */
export default function NotificationItem({ notification, onOpen, compact = false }) {
  const { icon: Icon, tone } = TYPE_STYLES[notification.type] ?? FALLBACK
  const unread = !notification.is_read

  return (
    <button
      type="button"
      onClick={() => onOpen(notification)}
      className={`flex w-full items-start gap-3 rounded-lg px-3 text-left transition hover:bg-gray-50 ${compact ? 'py-2.5' : 'py-3'} ${
        unread ? 'bg-primary-50/40' : ''
      }`}
    >
      <span className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${tone}`} aria-hidden="true">
        <Icon size={15} />
      </span>
      <span className="min-w-0 flex-1">
        <span className={`block text-sm ${unread ? 'font-medium text-gray-900' : 'text-gray-600'} ${compact ? 'line-clamp-2' : ''}`}>
          {notification.message}
        </span>
        <time dateTime={notification.created_at} title={formatDateTime(notification.created_at)} className="text-xs text-gray-400">
          {formatRelative(notification.created_at)}
        </time>
      </span>
      {unread && <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-primary-500" aria-label="Unread" />}
    </button>
  )
}

import { Bug, CheckCircle2, CircleDot, Clock, RotateCcw, XCircle } from 'lucide-react'
import BugDashboard from '@/components/dashboard/BugDashboard'
import InviteCard from '@/components/dashboard/InviteCard'
import { BUG_STATUS } from '@/config/constants'
import { usePageTitle } from '@/hooks/usePageTitle'

const STATS = [
  { label: 'Total Bugs', icon: Bug, tone: 'primary' },
  { label: 'Open', icon: CircleDot, tone: 'primary', status: BUG_STATUS.OPEN },
  { label: 'In Progress', icon: Clock, tone: 'orange', status: BUG_STATUS.IN_PROGRESS },
  { label: 'Resolved', icon: CheckCircle2, tone: 'green', status: BUG_STATUS.RESOLVED },
  { label: 'Closed', icon: XCircle, tone: 'gray', status: BUG_STATUS.CLOSED },
  { label: 'Reopened', icon: RotateCcw, tone: 'red', status: BUG_STATUS.REOPENED },
]

export default function AdminDashboard() {
  usePageTitle('Admin Dashboard')
  return (
    <BugDashboard
      title="Admin Dashboard"
      subtitle="Overview of every bug in your project."
      stats={STATS}
      showPriority
      intro={<InviteCard />}
    />
  )
}

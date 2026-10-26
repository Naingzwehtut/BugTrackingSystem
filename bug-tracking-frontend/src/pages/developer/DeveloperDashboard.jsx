import { Bug, CheckCircle2, Clock } from 'lucide-react'
import BugDashboard from '@/components/dashboard/BugDashboard'
import { BUG_STATUS } from '@/config/constants'
import { usePageTitle } from '@/hooks/usePageTitle'

const STATS = [
  { label: 'Assigned Bugs', icon: Bug, tone: 'primary' },
  { label: 'In Progress', icon: Clock, tone: 'orange', status: BUG_STATUS.IN_PROGRESS },
  { label: 'Resolved', icon: CheckCircle2, tone: 'green', status: BUG_STATUS.RESOLVED },
]

export default function DeveloperDashboard() {
  usePageTitle('Developer Dashboard')
  // The API already limits developers to bugs assigned to them.
  return (
    <BugDashboard
      title="Developer Dashboard"
      subtitle="Bugs assigned to you."
      stats={STATS}
      emptyMessage="Nothing is assigned to you yet. An admin will assign bugs to you."
    />
  )
}

import { Bug, CheckCircle2, CircleDot, PlusCircle, RotateCcw } from 'lucide-react'
import { Link } from 'react-router-dom'
import BugDashboard from '@/components/dashboard/BugDashboard'
import { BUG_STATUS } from '@/config/constants'
import { usePageTitle } from '@/hooks/usePageTitle'

const STATS = [
  { label: 'Total Bugs', icon: Bug, tone: 'primary' },
  { label: 'Open', icon: CircleDot, tone: 'primary', status: BUG_STATUS.OPEN },
  { label: 'Resolved', icon: CheckCircle2, tone: 'green', status: BUG_STATUS.RESOLVED },
  { label: 'Reopened', icon: RotateCcw, tone: 'red', status: BUG_STATUS.REOPENED },
]

const CREATE_LINK = (
  <Link to="/tester/create-bug" className="btn-primary">
    <PlusCircle size={16} aria-hidden="true" /> Create Bug
  </Link>
)

export default function TesterDashboard() {
  usePageTitle('Tester Dashboard')
  return (
    <BugDashboard
      title="Tester Dashboard"
      // Testers see every bug (they verify fixes across the project), not only their own.
      subtitle="Track reported bugs and verify fixes."
      stats={STATS}
      actions={CREATE_LINK}
      emptyMessage="No bugs have been reported yet."
      emptyAction={CREATE_LINK}
    />
  )
}

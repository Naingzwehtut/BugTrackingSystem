import { useEffect, useState } from 'react'
import { Bug, CircleDot, Clock, CheckCircle2, XCircle, RotateCcw } from 'lucide-react'
import * as bugService from '../../services/bugService'
import { getErrorMessage } from '../../services/api'
import StatCard from '../../components/dashboard/StatCard.jsx'
import StatusSummary from '../../components/dashboard/StatusSummary.jsx'
import PrioritySummary from '../../components/dashboard/PrioritySummary.jsx'
import RecentBugs from '../../components/dashboard/RecentBugs.jsx'
import LoadingSpinner from '../../components/common/LoadingSpinner.jsx'
import ErrorState from '../../components/common/ErrorState.jsx'

export default function AdminDashboard() {
  const [bugs, setBugs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  async function load() {
    setLoading(true)
    setError('')
    try {
      const res = await bugService.getBugs()
      setBugs(res.data?.bugs || res.data || [])
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  if (loading) return <LoadingSpinner label="Loading dashboard..." />
  if (error) return <ErrorState message={error} onRetry={load} />

  const count = (status) => bugs.filter((b) => b.status === status).length

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold text-gray-900">Admin Dashboard</h1>
        <p className="text-sm text-gray-500">Overview of all bugs in the system.</p>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">
        <StatCard label="Total Bugs" value={bugs.length} icon={Bug} tone="primary" />
        <StatCard label="Open" value={count('Open')} icon={CircleDot} tone="primary" />
        <StatCard label="In Progress" value={count('In Progress')} icon={Clock} tone="orange" />
        <StatCard label="Resolved" value={count('Resolved')} icon={CheckCircle2} tone="green" />
        <StatCard label="Closed" value={count('Closed')} icon={XCircle} tone="gray" />
        <StatCard label="Reopened" value={count('Reopened')} icon={RotateCcw} tone="red" />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <RecentBugs bugs={bugs} />
        </div>
        <div className="flex flex-col gap-4">
          <StatusSummary bugs={bugs} />
          <PrioritySummary bugs={bugs} />
        </div>
      </div>
    </div>
  )
}

import { useEffect, useState } from 'react'
import { Bug, Clock, CheckCircle2 } from 'lucide-react'
import * as bugService from '../../services/bugService'
import { getErrorMessage } from '../../services/api'
import StatCard from '../../components/dashboard/StatCard.jsx'
import RecentBugs from '../../components/dashboard/RecentBugs.jsx'
import StatusSummary from '../../components/dashboard/StatusSummary.jsx'
import LoadingSpinner from '../../components/common/LoadingSpinner.jsx'
import ErrorState from '../../components/common/ErrorState.jsx'

export default function DeveloperDashboard() {
  const [bugs, setBugs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  async function load() {
    setLoading(true)
    setError('')
    try {
      // Backend restricts developers to their assigned bugs already.
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
        <h1 className="text-xl font-semibold text-gray-900">Developer Dashboard</h1>
        <p className="text-sm text-gray-500">Bugs assigned to you.</p>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
        <StatCard label="Assigned Bugs" value={bugs.length} icon={Bug} tone="primary" />
        <StatCard label="In Progress" value={count('In Progress')} icon={Clock} tone="orange" />
        <StatCard label="Resolved" value={count('Resolved')} icon={CheckCircle2} tone="green" />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <RecentBugs bugs={bugs} />
        </div>
        <StatusSummary bugs={bugs} />
      </div>
    </div>
  )
}

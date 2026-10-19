import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Trash2 } from 'lucide-react'
import * as bugService from '../../services/bugService'
import * as userService from '../../services/userService'
import { getErrorMessage } from '../../services/api'
import { useAuth } from '../../hooks/useAuth'
import { useToast } from '../../components/common/Toast.jsx'
import BugTable from '../../components/bugs/BugTable.jsx'
import BugFilters from '../../components/bugs/BugFilters.jsx'
import Modal from '../../components/common/Modal.jsx'
import LoadingSpinner from '../../components/common/LoadingSpinner.jsx'
import ErrorState from '../../components/common/ErrorState.jsx'
import { canDeleteBug } from '../../utils/permissions'
import { ROLES } from '../../utils/constants'

const PAGE_SIZE = 10

export default function BugList() {
  const { user } = useAuth()
  const { showToast } = useToast()
  const navigate = useNavigate()

  const [bugs, setBugs] = useState([])
  const [developers, setDevelopers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [page, setPage] = useState(1)
  const [bugToDelete, setBugToDelete] = useState(null)
  const [deleting, setDeleting] = useState(false)

  const [filters, setFilters] = useState({
    search: '',
    status: '',
    priority: '',
    severity: '',
    developer: '',
    sort: 'newest',
  })

  async function load() {
    setLoading(true)
    setError('')
    try {
      const res = await bugService.getBugs()
      setBugs(res.data?.bugs || res.data || [])
      if (user?.role === ROLES.ADMIN) {
        const devRes = await userService.getDevelopers()
        setDevelopers(devRes.data?.developers || devRes.data || [])
      }
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const filtered = useMemo(() => {
    let result = [...bugs]

    if (filters.search) {
      const q = filters.search.toLowerCase()
      result = result.filter((b) => b.title?.toLowerCase().includes(q))
    }
    if (filters.status) result = result.filter((b) => b.status === filters.status)
    if (filters.priority) result = result.filter((b) => b.priority === filters.priority)
    if (filters.severity) result = result.filter((b) => b.severity === filters.severity)
    if (filters.developer) {
      result = result.filter(
        (b) => String(b.assigned_to || b.assigned_developer_id) === String(filters.developer)
      )
    }

    result.sort((a, b) => {
      const diff = new Date(b.created_at) - new Date(a.created_at)
      return filters.sort === 'newest' ? diff : -diff
    })

    return result
  }, [bugs, filters])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  function handleFilterChange(next) {
    setFilters(next)
    setPage(1)
  }

  async function confirmDelete() {
    if (!bugToDelete) return
    setDeleting(true)
    try {
      await bugService.deleteBug(bugToDelete.id)
      showToast('Bug deleted successfully.', 'success')
      setBugs((prev) => prev.filter((b) => b.id !== bugToDelete.id))
      setBugToDelete(null)
    } catch (err) {
      showToast(getErrorMessage(err), 'error')
    } finally {
      setDeleting(false)
    }
  }

  if (loading) return <LoadingSpinner label="Loading bugs..." />
  if (error) return <ErrorState message={error} onRetry={load} />

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-xl font-semibold text-gray-900">Bugs</h1>
        <p className="text-sm text-gray-500">Browse, filter and manage reported bugs.</p>
      </div>

      <BugFilters
        filters={filters}
        onChange={handleFilterChange}
        developers={developers}
        showDeveloperFilter={user?.role === ROLES.ADMIN}
      />

      <BugTable
        bugs={paginated}
        canDelete={canDeleteBug(user)}
        onDelete={(bug) => setBugToDelete(bug)}
      />

      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-gray-500">
          <span>
            Page {page} of {totalPages}
          </span>
          <div className="flex gap-2">
            <button
              className="btn-secondary"
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
            >
              Previous
            </button>
            <button
              className="btn-secondary"
              disabled={page === totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </button>
          </div>
        </div>
      )}

      <Modal
        title="Delete Bug"
        isOpen={!!bugToDelete}
        onClose={() => setBugToDelete(null)}
      >
        <p className="mb-4 text-sm text-gray-600">
          Are you sure you want to delete{' '}
          <span className="font-medium text-gray-900">"{bugToDelete?.title}"</span>? This
          action cannot be undone.
        </p>
        <div className="flex justify-end gap-3">
          <button className="btn-secondary" onClick={() => setBugToDelete(null)}>
            Cancel
          </button>
          <button disabled={deleting} onClick={confirmDelete} className="btn-danger">
            <Trash2 size={14} /> {deleting ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </Modal>
    </div>
  )
}

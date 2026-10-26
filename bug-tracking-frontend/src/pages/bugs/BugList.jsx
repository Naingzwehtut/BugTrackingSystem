import { PlusCircle, Trash2, X } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import BugFilters from '@/components/bugs/BugFilters'
import BugTable from '@/components/bugs/BugTable'
import ErrorState from '@/components/feedback/ErrorState'
import Button from '@/components/ui/Button'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import PageHeader from '@/components/ui/PageHeader'
import Pagination from '@/components/ui/Pagination'
import Skeleton from '@/components/ui/Skeleton'
import { PAGE_SIZE, ROLES } from '@/config/constants'
import { useAuth } from '@/hooks/useAuth'
import { useBugListParams } from '@/hooks/useBugListParams'
import { useDebouncedValue } from '@/hooks/useDebouncedValue'
import { useFetch } from '@/hooks/useFetch'
import { useLiveRefresh } from '@/hooks/useLiveRefresh'
import { usePageTitle } from '@/hooks/usePageTitle'
import { useToast } from '@/hooks/useToast'
import { getErrorMessage } from '@/services/api'
import { deleteBug, getBugs } from '@/services/bugService'
import { getDevelopers } from '@/services/userService'
import { countActiveFilters, filterAndSortBugs } from '@/utils/bugFilters'
import { canCreateBug, canDeleteBug } from '@/utils/permissions'

function ListSkeleton() {
  return (
    <div className="flex flex-col gap-4" role="status" aria-label="Loading bugs">
      <Skeleton className="h-8 w-40" />
      <Skeleton className="h-16" />
      <div className="card flex flex-col gap-3 p-4">
        {Array.from({ length: 6 }, (_, index) => (
          <Skeleton key={index} className="h-9" />
        ))}
      </div>
    </div>
  )
}

export default function BugList() {
  const { user } = useAuth()
  const toast = useToast()
  const isAdmin = user?.role === ROLES.ADMIN
  const isDeveloper = user?.role === ROLES.DEVELOPER
  const title = isDeveloper ? 'Assigned Bugs' : 'Bugs'
  usePageTitle(title)

  const { data, loading, error, reload, setData } = useFetch(
    async (signal) => {
      // Bugs and (for admins) the developer filter options load in parallel.
      const [bugs, developers] = await Promise.all([
        getBugs({}, { signal }),
        isAdmin ? getDevelopers({ signal }) : Promise.resolve([]),
      ])
      return { bugs, developers }
    },
    [isAdmin],
  )

  useLiveRefresh(reload) // new or changed bugs appear without a reload

  // Filters, sort and page live in the URL, so Back from a bug keeps them.
  const { filters, page, setFilters, setPage, clearFilters } = useBugListParams()
  const [bugToDelete, setBugToDelete] = useState(null)
  const [deleting, setDeleting] = useState(false)

  // Wait until typing pauses before re-filtering the whole list.
  const search = useDebouncedValue(filters.search)
  const { status, priority, severity, developer, sort } = filters
  const bugs = data?.bugs

  const filtered = useMemo(
    () => filterAndSortBugs(bugs ?? [], { search, status, priority, severity, developer, sort }),
    [bugs, search, status, priority, severity, developer, sort],
  )

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)
  const visible = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)
  const activeCount = countActiveFilters(filters)

  // Changing page jumps back to the top of the list, not the bottom of the old page.
  const topRef = useRef(null)
  const previousPage = useRef(currentPage)
  useEffect(() => {
    if (previousPage.current !== currentPage) topRef.current?.scrollIntoView({ block: 'start' })
    previousPage.current = currentPage
  }, [currentPage])

  async function confirmDelete() {
    setDeleting(true)
    try {
      await deleteBug(bugToDelete.id)
      setData((current) => ({ ...current, bugs: current.bugs.filter((bug) => bug.id !== bugToDelete.id) }))
      toast.success('Bug deleted.')
      setBugToDelete(null)
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setDeleting(false)
    }
  }

  if (loading) return <ListSkeleton />
  if (error) return <ErrorState message={error} onRetry={reload} />

  const total = bugs.length
  const subtitle = isDeveloper ? 'Bugs that have been assigned to you.' : 'Browse, filter and manage reported bugs.'

  // Two different "empty" situations deserve two different messages.
  const empty =
    total === 0
      ? {
          emptyMessage: isDeveloper ? 'No bugs are assigned to you yet.' : 'No bugs have been reported yet.',
          emptyAction: canCreateBug(user) && (
            <Link to="/tester/create-bug" className="btn-primary mt-2">
              <PlusCircle size={16} aria-hidden="true" /> Report the first bug
            </Link>
          ),
        }
      : {
          emptyMessage: 'No bugs match these filters.',
          emptyDescription: 'Try a different search or clear the filters.',
          emptyAction: (
            <Button variant="secondary" icon={X} onClick={clearFilters} className="mt-2">
              Clear filters
            </Button>
          ),
        }

  return (
    <div ref={topRef} className="flex scroll-mt-20 flex-col gap-4">
      <PageHeader
        title={title}
        subtitle={subtitle}
        actions={
          canCreateBug(user) && (
            <Link to="/tester/create-bug" className="btn-primary">
              <PlusCircle size={16} aria-hidden="true" /> Create Bug
            </Link>
          )
        }
      />

      <BugFilters
        filters={filters}
        onChange={setFilters}
        developers={data.developers}
        showDeveloperFilter={isAdmin}
        activeCount={activeCount}
        onClear={clearFilters}
      />

      {activeCount > 0 && filtered.length > 0 && (
        <p className="-mb-1 text-xs text-gray-500" aria-live="polite">
          {filtered.length} of {total} bugs match
        </p>
      )}

      <BugTable bugs={visible} canDelete={canDeleteBug(user)} onDelete={setBugToDelete} {...empty} />

      <Pagination page={currentPage} pageSize={PAGE_SIZE} total={filtered.length} onPageChange={setPage} />

      <ConfirmDialog
        isOpen={Boolean(bugToDelete)}
        title="Delete bug?"
        message={
          <>
            <span className="font-medium text-gray-900">&ldquo;{bugToDelete?.title}&rdquo;</span> and all of its
            comments and history will be permanently deleted. This cannot be undone.
          </>
        }
        confirmLabel="Delete bug"
        loadingLabel="Deleting..."
        icon={Trash2}
        loading={deleting}
        onConfirm={confirmDelete}
        onCancel={() => setBugToDelete(null)}
      />
    </div>
  )
}

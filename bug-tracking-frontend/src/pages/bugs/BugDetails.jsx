import { ArrowLeft } from 'lucide-react'
import { useState } from 'react'
import { Link, useLocation, useParams } from 'react-router-dom'
import BugDetailsPanel from '@/components/bugs/BugDetailsPanel'
import BugHistory from '@/components/bugs/BugHistory'
import BugSummary from '@/components/bugs/BugSummary'
import CommentSection from '@/components/bugs/CommentSection'
import DescriptionEditor from '@/components/bugs/DescriptionEditor'
import EditBugDialog from '@/components/bugs/EditBugDialog'
import StatusActions from '@/components/bugs/StatusActions'
import ErrorState from '@/components/feedback/ErrorState'
import Skeleton from '@/components/ui/Skeleton'
import { useAuth } from '@/hooks/useAuth'
import { useBugDetails } from '@/hooks/useBugDetails'
import { useLiveRefresh } from '@/hooks/useLiveRefresh'
import { usePageTitle } from '@/hooks/usePageTitle'
import { canAssignBug, canEditBug } from '@/utils/permissions'

function DetailsSkeleton() {
  return (
    <div className="flex flex-col gap-4" role="status" aria-label="Loading bug details">
      <Skeleton className="h-5 w-28" />
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="flex flex-col gap-4 lg:col-span-2">
          <Skeleton className="h-64" />
          <Skeleton className="h-48" />
        </div>
        <div className="flex flex-col gap-4">
          <Skeleton className="h-36" />
          <Skeleton className="h-48" />
        </div>
      </div>
    </div>
  )
}

/**
 * Two columns on wide screens: the bug itself and its discussion on the left,
 * the workflow, facts and audit trail in a side panel on the right (the layout
 * people know from GitHub/Jira). On phones the panel comes first so the
 * status and next action are visible without scrolling past every comment.
 */
export default function BugDetails() {
  const { id } = useParams()
  const location = useLocation()
  const { user } = useAuth()
  const isAdmin = canAssignBug(user)
  const [editing, setEditing] = useState(false)
  const {
    bug,
    comments,
    history,
    developers,
    loading,
    error,
    reload,
    pending,
    assign,
    changeStatus,
    saveDescription,
    saveDetails,
    addComment,
  } = useBugDetails(id, { isAdmin })

  usePageTitle(bug?.title)
  // Someone else changed or commented on this bug: show it straight away.
  useLiveRefresh(reload, (notification) => notification.bug_id === id)

  if (loading) return <DetailsSkeleton />
  if (error) return <ErrorState message={error} onRetry={reload} />
  if (!bug) return <ErrorState message="The requested bug could not be found." />

  // Return to the list exactly as it was left (filters and page), if we came from it.
  const backTo = location.state?.from ?? '/bugs'

  return (
    <div className="flex flex-col gap-4">
      <Link to={backTo} className="flex w-fit items-center gap-1 text-sm text-gray-500 hover:text-gray-700">
        <ArrowLeft size={16} aria-hidden="true" /> Back to bugs
      </Link>

      {/* Wide screens: left column (bug + comments) and a sticky side panel.
          Phones: the left column becomes `display: contents`, so the order
          classes can slot the panel between the bug and the comments. */}
      <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-3">
        <div className="contents lg:col-span-2 lg:flex lg:flex-col lg:gap-4">
          <div className="order-1">
            <BugSummary bug={bug} onEdit={isAdmin ? () => setEditing(true) : undefined}>
              <DescriptionEditor
                // Remount when the saved text changes so the editor never shows a stale draft.
                key={bug.description}
                description={bug.description}
                canEdit={canEditBug(user, bug)}
                saving={pending.description}
                onSave={saveDescription}
              />
            </BugSummary>
          </div>
          <div className="order-3">
            <CommentSection
              comments={comments}
              currentUserId={user?.id}
              onAddComment={addComment}
              submitting={pending.comment}
            />
          </div>
        </div>

        <aside aria-label="Bug status and details" className="order-2 flex flex-col gap-4 lg:sticky lg:top-20">
          <StatusActions user={user} bug={bug} onChangeStatus={changeStatus} pendingStatus={pending.status} />
          <BugDetailsPanel
            bug={bug}
            canAssign={isAdmin}
            developers={developers}
            assigning={pending.assign}
            onAssign={assign}
          />
          <BugHistory history={history} />
        </aside>
      </div>

      {isAdmin && (
        <EditBugDialog
          bug={bug}
          isOpen={editing}
          saving={pending.details}
          onSave={saveDetails}
          onClose={() => setEditing(false)}
        />
      )}
    </div>
  )
}

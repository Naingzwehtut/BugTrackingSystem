import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, UserCog, Save } from 'lucide-react'
import * as bugService from '../../services/bugService'
import * as userService from '../../services/userService'
import * as commentService from '../../services/commentService'
import { getErrorMessage } from '../../services/api'
import { useAuth } from '../../hooks/useAuth'
import { useToast } from '../../components/common/Toast.jsx'

import StatusBadge from '../../components/bugs/StatusBadge.jsx'
import PriorityBadge from '../../components/bugs/PriorityBadge.jsx'
import SeverityBadge from '../../components/bugs/SeverityBadge.jsx'
import StatusActions from '../../components/bugs/StatusActions.jsx'
import CommentSection from '../../components/bugs/CommentSection.jsx'
import BugHistory from '../../components/bugs/BugHistory.jsx'
import LoadingSpinner from '../../components/common/LoadingSpinner.jsx'
import ErrorState from '../../components/common/ErrorState.jsx'

import { formatDateTime } from '../../utils/formatDate'
import { canAssignBug, canEditBug } from '../../utils/permissions'
import { ROLES } from '../../utils/constants'

export default function BugDetails() {
  const { id } = useParams()
  const { user } = useAuth()
  const { showToast } = useToast()
  const navigate = useNavigate()

  const [bug, setBug] = useState(null)
  const [comments, setComments] = useState([])
  const [history, setHistory] = useState([])
  const [developers, setDevelopers] = useState([])

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [selectedDeveloper, setSelectedDeveloper] = useState('')
  const [assigning, setAssigning] = useState(false)
  const [updatingStatus, setUpdatingStatus] = useState(false)
  const [postingComment, setPostingComment] = useState(false)

  const [editingDescription, setEditingDescription] = useState(false)
  const [descriptionDraft, setDescriptionDraft] = useState('')
  const [savingDescription, setSavingDescription] = useState(false)

  async function load() {
    setLoading(true)
    setError('')
    try {
      const [bugRes, commentsRes, historyRes] = await Promise.all([
        bugService.getBugById(id),
        commentService.getComments(id),
        bugService.getBugHistory(id),
      ])
      const bugData = bugRes.data?.bug || bugRes.data
      setBug(bugData)
      setDescriptionDraft(bugData?.description || '')
      setComments(commentsRes.data?.comments || commentsRes.data || [])
      setHistory(historyRes.data?.history || historyRes.data || [])

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
  }, [id])

  async function handleAssign() {
    if (!selectedDeveloper) return
    setAssigning(true)
    try {
      await bugService.assignBug(id, selectedDeveloper)
      showToast('Developer assigned successfully.', 'success')
      load()
    } catch (err) {
      showToast(getErrorMessage(err), 'error')
    } finally {
      setAssigning(false)
    }
  }

  async function handleStatusChange(status) {
    setUpdatingStatus(true)
    try {
      await bugService.updateBugStatus(id, status)
      showToast(`Status updated to ${status}.`, 'success')
      load()
    } catch (err) {
      showToast(getErrorMessage(err), 'error')
    } finally {
      setUpdatingStatus(false)
    }
  }

  async function handleAddComment(text) {
    setPostingComment(true)
    try {
      await commentService.addComment(id, text)
      const res = await commentService.getComments(id)
      setComments(res.data?.comments || res.data || [])
    } catch (err) {
      showToast(getErrorMessage(err), 'error')
    } finally {
      setPostingComment(false)
    }
  }

  async function handleSaveDescription() {
    setSavingDescription(true)
    try {
      await bugService.updateBug(id, { description: descriptionDraft })
      showToast('Description updated.', 'success')
      setEditingDescription(false)
      load()
    } catch (err) {
      showToast(getErrorMessage(err), 'error')
    } finally {
      setSavingDescription(false)
    }
  }

  if (loading) return <LoadingSpinner label="Loading bug details..." />
  if (error) return <ErrorState message={error} onRetry={load} />
  if (!bug) return <ErrorState message="The requested bug could not be found." />

  const editableDescription = canEditBug(user, bug)

  return (
    <div className="flex flex-col gap-4">
      <button
        onClick={() => navigate('/bugs')}
        className="flex w-fit items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
      >
        <ArrowLeft size={16} /> Back to bugs
      </button>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="flex flex-col gap-4 lg:col-span-2">
          <div className="card p-5">
            <div className="mb-3 flex flex-wrap items-start justify-between gap-2">
              <div>
                <p className="font-mono text-xs text-gray-400">Bug #{bug.id}</p>
                <h1 className="text-lg font-semibold text-gray-900">{bug.title}</h1>
              </div>
              <div className="flex flex-wrap gap-2">
                <StatusBadge status={bug.status} />
                <PriorityBadge priority={bug.priority} />
                <SeverityBadge severity={bug.severity} />
              </div>
            </div>

            <div className="mb-4 grid grid-cols-2 gap-3 text-xs text-gray-500 sm:grid-cols-4">
              <div>
                <p className="text-gray-400">Reporter</p>
                <p className="font-medium text-gray-700">
                  {bug.reporter_name || bug.reporter?.name || '—'}
                </p>
              </div>
              <div>
                <p className="text-gray-400">Assigned Developer</p>
                <p className="font-medium text-gray-700">
                  {bug.assigned_developer_name || bug.assigned_developer?.name || 'Unassigned'}
                </p>
              </div>
              <div>
                <p className="text-gray-400">Created</p>
                <p className="font-medium text-gray-700">{formatDateTime(bug.created_at)}</p>
              </div>
              <div>
                <p className="text-gray-400">Updated</p>
                <p className="font-medium text-gray-700">{formatDateTime(bug.updated_at)}</p>
              </div>
            </div>

            <div>
              <div className="mb-1 flex items-center justify-between">
                <p className="label mb-0">Description</p>
                {editableDescription && !editingDescription && (
                  <button
                    className="text-xs font-medium text-primary-600 hover:underline"
                    onClick={() => setEditingDescription(true)}
                  >
                    Edit
                  </button>
                )}
              </div>

              {editingDescription ? (
                <div className="flex flex-col gap-2">
                  <textarea
                    className="input resize-none"
                    rows={5}
                    value={descriptionDraft}
                    onChange={(e) => setDescriptionDraft(e.target.value)}
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      className="btn-secondary"
                      onClick={() => {
                        setEditingDescription(false)
                        setDescriptionDraft(bug.description || '')
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      className="btn-primary"
                      disabled={savingDescription}
                      onClick={handleSaveDescription}
                    >
                      <Save size={14} /> {savingDescription ? 'Saving...' : 'Save'}
                    </button>
                  </div>
                </div>
              ) : (
                <p className="whitespace-pre-wrap text-sm text-gray-700">{bug.description}</p>
              )}
            </div>
          </div>

          {canAssignBug(user) && (
            <div className="card p-5">
              <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-800">
                <UserCog size={16} /> Assign Developer
              </h3>
              <div className="flex flex-col gap-3 sm:flex-row">
                <select
                  className="input sm:flex-1"
                  value={selectedDeveloper}
                  onChange={(e) => setSelectedDeveloper(e.target.value)}
                >
                  <option value="">Select a developer...</option>
                  {developers.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>
                <button
                  className="btn-primary"
                  disabled={!selectedDeveloper || assigning}
                  onClick={handleAssign}
                >
                  {assigning ? 'Assigning...' : 'Assign'}
                </button>
              </div>
            </div>
          )}

          <div className="card p-5">
            <h3 className="mb-3 text-sm font-semibold text-gray-800">Status Actions</h3>
            <StatusActions
              user={user}
              bug={bug}
              onChangeStatus={handleStatusChange}
              updating={updatingStatus}
            />
          </div>

          <CommentSection
            comments={comments}
            onAddComment={handleAddComment}
            submitting={postingComment}
          />
        </div>

        <div>
          <BugHistory history={history} />
        </div>
      </div>
    </div>
  )
}

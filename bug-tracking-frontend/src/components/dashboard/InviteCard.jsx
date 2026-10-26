import { Check, Copy, RefreshCw, Users } from 'lucide-react'
import { useState } from 'react'
import Button from '@/components/ui/Button'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import Skeleton from '@/components/ui/Skeleton'
import { ROLE_LABELS } from '@/config/constants'
import { useFetch } from '@/hooks/useFetch'
import { useToast } from '@/hooks/useToast'
import { getErrorMessage } from '@/services/api'
import { getCurrentProject, regenerateInviteCode } from '@/services/projectService'

/**
 * Admin dashboard card: the project's invite code (copy / regenerate) and
 * member counts. Teammates enter the code on the Register page.
 */
export default function InviteCard() {
  const toast = useToast()
  const { data: project, loading, setData } = useFetch((signal) => getCurrentProject({ signal }), [])
  const [copied, setCopied] = useState(false)
  const [confirming, setConfirming] = useState(false)
  const [regenerating, setRegenerating] = useState(false)

  if (loading) return <Skeleton className="h-28" />
  if (!project) return null

  async function copy() {
    try {
      await navigator.clipboard.writeText(project.invite_code)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      toast.info(`Invite code: ${project.invite_code}`)
    }
  }

  async function regenerate() {
    setRegenerating(true)
    try {
      setData(await regenerateInviteCode())
      toast.success('New invite code created. The old one no longer works.')
      setConfirming(false)
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setRegenerating(false)
    }
  }

  const counts = Object.entries(project.role_counts ?? {})
    .map(([role, count]) => `${count} ${ROLE_LABELS[role] ?? role}${count === 1 ? '' : 's'}`)
    .join(' · ')

  return (
    <section className="card flex flex-col gap-4 bg-gradient-to-r from-primary-50 to-white p-5 sm:flex-row sm:items-center sm:justify-between" aria-labelledby="invite-heading">
      <div className="min-w-0">
        <h2 id="invite-heading" className="text-sm font-semibold text-gray-800">
          Invite your team to <span className="text-primary-700">{project.name}</span>
        </h2>
        <p className="mt-1 text-sm text-gray-500">Teammates enter this code when they register. Everyone joins as a Tester.</p>
        <p className="mt-2 flex items-center gap-1.5 text-xs text-gray-500">
          <Users size={14} aria-hidden="true" /> {project.member_count} member{project.member_count === 1 ? '' : 's'}
          {counts && <span className="text-gray-400">({counts})</span>}
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <code className="rounded-lg border border-primary-200 bg-white px-4 py-2 font-mono text-lg font-semibold tracking-wider text-gray-900">
          {project.invite_code}
        </code>
        <Button variant="secondary" icon={copied ? Check : Copy} onClick={copy}>
          {copied ? 'Copied' : 'Copy'}
        </Button>
        <Button variant="ghost" icon={RefreshCw} onClick={() => setConfirming(true)} aria-label="Create a new invite code">
          <span className="hidden sm:inline">New code</span>
        </Button>
      </div>
      <ConfirmDialog
        isOpen={confirming}
        title="Create a new invite code?"
        message="The current code stops working immediately. People who already joined stay in the project."
        confirmLabel="Create new code"
        loadingLabel="Creating..."
        variant="primary"
        icon={RefreshCw}
        loading={regenerating}
        onConfirm={regenerate}
        onCancel={() => setConfirming(false)}
      />
    </section>
  )
}

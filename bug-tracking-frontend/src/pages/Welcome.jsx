import { Clock, FolderPlus, KeyRound, LogOut, ShieldCheck, XCircle } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AuthCard from '@/components/layout/AuthCard'
import Alert from '@/components/ui/Alert'
import Button from '@/components/ui/Button'
import Field from '@/components/ui/Field'
import { PROJECT_NAME_MAX, REASON_MAX, ROLES } from '@/config/constants'
import { useAuth } from '@/hooks/useAuth'
import { usePageTitle } from '@/hooks/usePageTitle'
import { useToast } from '@/hooks/useToast'
import { requestAdmin } from '@/services/adminRequestService'
import { getErrorMessage } from '@/services/api'
import { createProject, joinProject } from '@/services/projectService'
import { validateInviteCode, validateProjectName, validateReason } from '@/utils/validation'

// A small form with one field, one button, a validator and an API call.
function SingleFieldForm({ label, placeholder, validate, submitLabel, loadingLabel, onSubmit, as, maxLength, mono, icon }) {
  const [value, setValue] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    const problem = validate(value)
    setError(problem)
    if (problem) return
    setLoading(true)
    try {
      await onSubmit(value.trim())
    } catch (err) {
      setError(getErrorMessage(err))
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-3">
      <Field
        as={as}
        rows={as === 'textarea' ? 3 : undefined}
        label={label}
        placeholder={placeholder}
        maxLength={maxLength}
        className={mono ? 'font-mono uppercase placeholder:normal-case' : as === 'textarea' ? 'resize-y' : ''}
        value={value}
        onChange={(event) => {
          setValue(event.target.value)
          setError('')
        }}
        error={error}
      />
      <Button type="submit" icon={icon} loading={loading} loadingText={loadingLabel} className="w-full">
        {submitLabel}
      </Button>
    </form>
  )
}

function Divider({ children }) {
  return (
    <div className="my-5 flex items-center gap-3 text-xs text-gray-400">
      <span className="h-px flex-1 bg-gray-200" /> {children} <span className="h-px flex-1 bg-gray-200" />
    </div>
  )
}

/**
 * Where users land until they belong to a project:
 *  - approved admins create their project (and get its invite code)
 *  - pending admin requests wait here; the page updates live on approval
 *  - everyone else joins with an invite code, or requests admin access
 */
export default function Welcome() {
  usePageTitle('Welcome')
  const { user, adminRequest, refreshSession, logout } = useAuth()
  const navigate = useNavigate()
  const toast = useToast()

  const isApprovedAdmin = user?.role === ROLES.ADMIN
  const pending = adminRequest?.status === 'pending'
  const rejected = adminRequest?.status === 'rejected'

  async function afterJoinOrCreate(message) {
    toast.success(message)
    await refreshSession() // ProtectedRoute then sends them to their dashboard
  }

  const join = (
    <SingleFieldForm
      label="Project invite code"
      placeholder="BUG-7KQ2X9"
      validate={validateInviteCode}
      maxLength={12}
      mono
      icon={KeyRound}
      submitLabel="Join project"
      loadingLabel="Joining..."
      onSubmit={async (code) => {
        const project = await joinProject(code)
        await afterJoinOrCreate(`Welcome to ${project.name}! You joined as a Tester.`)
      }}
    />
  )

  let title, subtitle, body
  if (isApprovedAdmin) {
    title = 'Create your project'
    subtitle = 'Your admin access was approved.'
    body = (
      <>
        <Alert variant="success" className="mb-4">
          After creating it, share the project&apos;s <strong>invite code</strong> with your team. They enter it when they
          register.
        </Alert>
        <SingleFieldForm
          label="Project name"
          placeholder="e.g. CSC480 Mobile App"
          validate={validateProjectName}
          maxLength={PROJECT_NAME_MAX}
          icon={FolderPlus}
          submitLabel="Create project"
          loadingLabel="Creating..."
          onSubmit={async (name) => {
            const project = await createProject(name)
            await afterJoinOrCreate(`${project.name} created. Invite code: ${project.invite_code}`)
            navigate('/admin/dashboard', { replace: true })
          }}
        />
      </>
    )
  } else if (pending) {
    title = 'Request under review'
    subtitle = 'The owners have been emailed about your admin request.'
    body = (
      <>
        <div className="mb-2 flex items-start gap-3 rounded-lg bg-amber-50 p-4 text-sm text-amber-800">
          <Clock size={18} className="mt-0.5 shrink-0" aria-hidden="true" />
          <p>
            You&apos;ll get a notification and an email as soon as they decide. This page updates on its own, so there&apos;s no
            need to refresh.
          </p>
        </div>
        <Divider>or join an existing project</Divider>
        {join}
      </>
    )
  } else {
    title = 'Join a project'
    subtitle = 'Enter the invite code your project admin gave you.'
    body = (
      <>
        {rejected && (
          <div className="mb-4 flex items-start gap-3 rounded-lg bg-red-50 p-4 text-sm text-red-700">
            <XCircle size={18} className="mt-0.5 shrink-0" aria-hidden="true" />
            <p>Your admin request wasn&apos;t approved. You can join a project with an invite code, or ask again below.</p>
          </div>
        )}
        {join}
        <Divider>or run your own project</Divider>
        <SingleFieldForm
          as="textarea"
          label="Why do you need admin access?"
          placeholder="e.g. I'm the team lead for our project."
          validate={validateReason}
          maxLength={REASON_MAX}
          icon={ShieldCheck}
          submitLabel="Request admin access"
          loadingLabel="Sending..."
          onSubmit={async (reason) => {
            await requestAdmin(reason)
            await afterJoinOrCreate('Request sent. The owners will review it.')
          }}
        />
      </>
    )
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-b from-primary-50/60 to-gray-50 px-4 py-8">
      <AuthCard
        title={title}
        subtitle={subtitle}
        footer={
          <>
            Signed in as <span className="font-medium text-gray-700">{user?.email}</span> ·{' '}
            <button
              type="button"
              onClick={() => {
                logout()
                navigate('/login')
              }}
              className="inline-flex items-center gap-1 font-medium text-primary-600 hover:underline"
            >
              <LogOut size={13} aria-hidden="true" /> Sign out
            </button>
          </>
        }
      >
        {body}
      </AuthCard>
    </main>
  )
}

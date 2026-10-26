import { KeyRound, ShieldCheck } from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import AuthCard from '@/components/layout/AuthCard'
import Alert from '@/components/ui/Alert'
import Button from '@/components/ui/Button'
import Field from '@/components/ui/Field'
import PasswordField from '@/components/ui/PasswordField'
import SegmentedControl from '@/components/ui/SegmentedControl'
import { NAME_MAX, REASON_MAX } from '@/config/constants'
import { useAuth } from '@/hooks/useAuth'
import { usePageTitle } from '@/hooks/usePageTitle'
import { useToast } from '@/hooks/useToast'
import { getErrorMessage } from '@/services/api'
import {
  compactErrors,
  validateEmail,
  validateInviteCode,
  validateName,
  validatePassword,
  validateReason,
} from '@/utils/validation'

const MODES = [
  { value: 'join', label: 'Join a project', icon: KeyRound },
  { value: 'admin', label: 'Request admin access', icon: ShieldCheck },
]

export default function Register() {
  usePageTitle('Create account')
  const { register } = useAuth()
  const navigate = useNavigate()
  const toast = useToast()

  const [mode, setMode] = useState('join')
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '', inviteCode: '', reason: '' })
  const [errors, setErrors] = useState({})
  const [serverError, setServerError] = useState('')
  const [loading, setLoading] = useState(false)

  // Editing a field clears its error straight away.
  const update = (field) => (event) => {
    setForm((current) => ({ ...current, [field]: event.target.value }))
    setErrors((current) => ({ ...current, [field]: '' }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setServerError('')

    const found = compactErrors({
      name: validateName(form.name),
      email: validateEmail(form.email),
      password: validatePassword(form.password),
      confirm: form.password === form.confirm ? '' : 'Passwords do not match.',
      inviteCode: mode === 'join' ? validateInviteCode(form.inviteCode) : '',
      reason: mode === 'admin' ? validateReason(form.reason) : '',
    })
    setErrors(found)
    if (Object.keys(found).length > 0) return

    setLoading(true)
    try {
      const base = { name: form.name.trim(), email: form.email.trim(), password: form.password }
      const payload =
        mode === 'join'
          ? { ...base, invite_code: form.inviteCode.trim() }
          : { ...base, request_admin: true, reason: form.reason.trim() }
      const { message } = await register(payload)
      toast.success(message || 'Account created. Sign in to continue.')
      // Pre-fill the email so signing in is just the password.
      navigate('/login', { state: { email: form.email.trim() } })
    } catch (err) {
      setServerError(getErrorMessage(err))
      setLoading(false)
    }
  }

  return (
    <AuthCard
      title="Create an account"
      subtitle="Join your team's bug tracker"
      footer={
        <>
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-primary-600 hover:underline">
            Sign in
          </Link>
        </>
      }
    >
      <SegmentedControl label="How are you joining?" options={MODES} value={mode} onChange={setMode} className="mb-4" />

      <Alert variant="info" className="mb-4">
        {mode === 'join' ? (
          <>
            Ask your project admin for the <strong>invite code</strong>. Everyone joins as a <strong>Tester</strong>; your
            admin can promote you later.
          </>
        ) : (
          <>
            The platform owners will review your request and email you. Once approved, you can create a project and
            invite your team.
          </>
        )}
      </Alert>
      <Alert variant="error" className="mb-4">
        {serverError}
      </Alert>

      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
        <Field label="Name" autoComplete="name" maxLength={NAME_MAX} value={form.name} onChange={update('name')} error={errors.name} />
        <Field label="Email" type="email" autoComplete="email" value={form.email} onChange={update('email')} error={errors.email} />
        <PasswordField
          label="Password"
          autoComplete="new-password"
          value={form.password}
          onChange={update('password')}
          error={errors.password}
          hint="At least 8 characters, including a letter and a number."
        />
        <PasswordField
          label="Confirm Password"
          autoComplete="new-password"
          value={form.confirm}
          onChange={update('confirm')}
          error={errors.confirm}
        />

        {mode === 'join' ? (
          <Field
            label="Project invite code"
            placeholder="BUG-7KQ2X9"
            autoComplete="off"
            className="font-mono uppercase placeholder:normal-case"
            maxLength={12}
            value={form.inviteCode}
            onChange={update('inviteCode')}
            error={errors.inviteCode}
          />
        ) : (
          <Field
            as="textarea"
            rows={3}
            label="Why do you need admin access?"
            placeholder="e.g. I'm the team lead for our CSC480 mobile app project."
            className="resize-y"
            maxLength={REASON_MAX}
            value={form.reason}
            onChange={update('reason')}
            error={errors.reason}
          />
        )}

        <Button type="submit" loading={loading} loadingText="Creating account..." className="w-full">
          {mode === 'join' ? 'Create account & join' : 'Create account & send request'}
        </Button>
      </form>
    </AuthCard>
  )
}

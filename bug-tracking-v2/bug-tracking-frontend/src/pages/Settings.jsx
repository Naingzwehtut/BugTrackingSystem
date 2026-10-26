import { Mail } from 'lucide-react'
import { useState } from 'react'
import PageHeader from '@/components/ui/PageHeader'
import { ROLE_LABELS } from '@/config/constants'
import { useAuth } from '@/hooks/useAuth'
import { usePageTitle } from '@/hooks/usePageTitle'
import { useToast } from '@/hooks/useToast'
import { getErrorMessage } from '@/services/api'
import { updatePreferences } from '@/services/authService'

function Toggle({ id, checked, disabled, onChange, label, description }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <label htmlFor={id} className="text-sm font-medium text-gray-800">
          {label}
        </label>
        <p className="text-xs text-gray-500">{description}</p>
      </div>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition disabled:opacity-50 ${checked ? 'bg-primary-600' : 'bg-gray-300'}`}
      >
        <span className={`inline-block h-5 w-5 rounded-full bg-white shadow transition ${checked ? 'translate-x-5' : 'translate-x-0.5'}`} />
      </button>
    </div>
  )
}

export default function Settings() {
  usePageTitle('Settings')
  const { user, project, updateUser } = useAuth()
  const toast = useToast()
  const [saving, setSaving] = useState(false)

  const details = [
    ['Name', user?.name],
    ['Email', user?.email],
    ['Role', ROLE_LABELS[user?.role] ?? user?.role],
    ...(project ? [['Project', project.name]] : []),
  ]

  async function toggleEmail(next) {
    setSaving(true)
    try {
      updateUser(await updatePreferences({ email_notifications: next }))
      toast.success(next ? 'Email notifications turned on.' : 'Email notifications turned off.')
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <PageHeader title="Settings" subtitle="Your account and notification preferences." />
      <div className="grid max-w-3xl gap-4 md:grid-cols-2">
        <section className="card p-5" aria-labelledby="account-heading">
          <h2 id="account-heading" className="mb-4 text-sm font-semibold text-gray-800">
            Account
          </h2>
          <dl className="flex flex-col gap-4">
            {details.map(([label, value]) => (
              <div key={label}>
                <dt className="label">{label}</dt>
                <dd className="text-sm text-gray-800">{value}</dd>
              </div>
            ))}
          </dl>
        </section>
        <section className="card p-5" aria-labelledby="prefs-heading">
          <h2 id="prefs-heading" className="mb-4 flex items-center gap-2 text-sm font-semibold text-gray-800">
            <Mail size={16} aria-hidden="true" /> Notifications
          </h2>
          <Toggle
            id="email-notifications"
            label="Email notifications"
            description="Emails for important events: assigned to you, ready to verify, reopened, role changes. In-app notifications always stay on."
            checked={user?.email_notifications !== false}
            disabled={saving}
            onChange={toggleEmail}
          />
        </section>
      </div>
    </div>
  )
}

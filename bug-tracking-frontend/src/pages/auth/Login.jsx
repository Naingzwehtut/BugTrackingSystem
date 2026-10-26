import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import AuthCard from '@/components/layout/AuthCard'
import Alert from '@/components/ui/Alert'
import Button from '@/components/ui/Button'
import Field from '@/components/ui/Field'
import PasswordField from '@/components/ui/PasswordField'
import { useAuth } from '@/hooks/useAuth'
import { usePageTitle } from '@/hooks/usePageTitle'
import { getErrorMessage } from '@/services/api'

export default function Login() {
  usePageTitle('Sign in')
  const { login } = useAuth()
  const location = useLocation()
  // Arriving from registration pre-fills the email.
  const [form, setForm] = useState({ email: location.state?.email ?? '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const update = (field) => (event) => setForm((current) => ({ ...current, [field]: event.target.value }))

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setLoading(true)
    try {
      // AuthLayout redirects as soon as the user is set, so no navigate() here.
      await login(form.email.trim(), form.password)
    } catch (err) {
      setError(getErrorMessage(err))
      setLoading(false)
    }
  }

  return (
    <AuthCard
      title="Bug Tracking System"
      subtitle="Sign in to your account"
      footer={
        <>
          Don&apos;t have an account?{' '}
          <Link to="/register" className="font-medium text-primary-600 hover:underline">
            Create one
          </Link>
        </>
      }
    >
      <Alert variant="error" className="mb-4">
        {error}
      </Alert>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Field
          label="Email"
          type="email"
          required
          autoComplete="email"
          autoFocus={!form.email}
          placeholder="you@example.com"
          value={form.email}
          onChange={update('email')}
        />
        <PasswordField
          label="Password"
          required
          autoComplete="current-password"
          autoFocus={Boolean(form.email)}
          placeholder="••••••••"
          value={form.password}
          onChange={update('password')}
        />
        <Button type="submit" loading={loading} loadingText="Signing in..." className="w-full">
          Sign in
        </Button>
      </form>
    </AuthCard>
  )
}

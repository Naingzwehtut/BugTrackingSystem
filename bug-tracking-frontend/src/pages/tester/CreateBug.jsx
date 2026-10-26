import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Alert from '@/components/ui/Alert'
import Button from '@/components/ui/Button'
import Field from '@/components/ui/Field'
import PageHeader from '@/components/ui/PageHeader'
import { DESCRIPTION_MAX, DESCRIPTION_MIN, PRIORITY_LIST, SEVERITY_LIST, TITLE_MAX } from '@/config/constants'
import { usePageTitle } from '@/hooks/usePageTitle'
import { useToast } from '@/hooks/useToast'
import { getErrorMessage } from '@/services/api'
import { createBug } from '@/services/bugService'
import { compactErrors, validateDescription, validateTitle } from '@/utils/validation'

const INITIAL_FORM = {
  title: '',
  description: '',
  // Sensible middle-of-the-road defaults; the tester raises them if needed.
  severity: 'Major',
  priority: 'Medium',
}

const asOptions = (list) => list.map((item) => <option key={item}>{item}</option>)

export default function CreateBug() {
  usePageTitle('Create Bug')
  const navigate = useNavigate()
  const toast = useToast()

  const [form, setForm] = useState(INITIAL_FORM)
  const [errors, setErrors] = useState({})
  const [serverError, setServerError] = useState('')
  const [loading, setLoading] = useState(false)

  const update = (field) => (event) => {
    setForm((current) => ({ ...current, [field]: event.target.value }))
    setErrors((current) => ({ ...current, [field]: '' }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setServerError('')

    const found = compactErrors({
      title: validateTitle(form.title),
      description: validateDescription(form.description),
    })
    setErrors(found)
    if (Object.keys(found).length > 0) return

    setLoading(true)
    try {
      const bug = await createBug({ ...form, title: form.title.trim(), description: form.description.trim() })
      toast.success('Bug created successfully.')
      navigate(`/bugs/${bug.id}`)
    } catch (err) {
      setServerError(getErrorMessage(err))
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <PageHeader title="Create Bug" subtitle="Report a new issue for the team to triage." />

      <div className="card p-6">
        <Alert variant="error" className="mb-4">
          {serverError}
        </Alert>

        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
          <Field
            label="Title"
            maxLength={TITLE_MAX}
            placeholder="e.g. Checkout fails when a coupon is applied"
            autoFocus
            value={form.title}
            onChange={update('title')}
            error={errors.title}
          />
          <Field
            as="textarea"
            label="Description"
            rows={7}
            className="resize-y"
            maxLength={DESCRIPTION_MAX}
            showCount
            placeholder={'Steps to reproduce:\n1. ...\n\nExpected:\nActual:'}
            value={form.description}
            onChange={update('description')}
            error={errors.description}
            hint={`What happened, what you expected, and how to reproduce it (at least ${DESCRIPTION_MIN} characters).`}
          />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field as="select" label="Priority" value={form.priority} onChange={update('priority')}>
              {asOptions(PRIORITY_LIST)}
            </Field>
            <Field as="select" label="Severity" value={form.severity} onChange={update('severity')}>
              {asOptions(SEVERITY_LIST)}
            </Field>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            {/* Go back if we came from inside the app; otherwise to the dashboard. */}
            <Button variant="secondary" onClick={() => (window.history.state?.idx > 0 ? navigate(-1) : navigate('/tester/dashboard'))}>
              Cancel
            </Button>
            <Button type="submit" loading={loading} loadingText="Creating...">
              Create Bug
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

import { Save } from 'lucide-react'
import { useState } from 'react'
import Button from '@/components/ui/Button'
import Field from '@/components/ui/Field'
import Modal from '@/components/ui/Modal'
import { PRIORITY_LIST, SEVERITY_LIST, TITLE_MAX } from '@/config/constants'
import { validateTitle } from '@/utils/validation'

const options = (list) => list.map((item) => <option key={item}>{item}</option>)

/**
 * Admin triage: edit title, priority and severity. The API always supported
 * this (and records priority/severity changes in the history), but the UI had
 * no way to do it. Only changed fields are sent.
 */
export default function EditBugDialog({ bug, isOpen, saving, onSave, onClose }) {
  return (
    <Modal title="Edit bug details" description="Priority and severity changes appear in the activity timeline." isOpen={isOpen} onClose={onClose} dismissible={!saving} size="md">
      {/* Mounted only while open, so each opening starts from the saved values. */}
      {isOpen && <EditForm bug={bug} saving={saving} onSave={onSave} onCancel={onClose} />}
    </Modal>
  )
}

function EditForm({ bug, saving, onSave, onCancel }) {
  const [form, setForm] = useState({ title: bug.title, priority: bug.priority, severity: bug.severity })
  const [touched, setTouched] = useState(false)
  const titleError = touched ? validateTitle(form.title) : ''

  const changes = Object.fromEntries(
    Object.entries({ ...form, title: form.title.trim() }).filter(([key, value]) => value !== bug[key]),
  )
  const hasChanges = Object.keys(changes).length > 0

  const update = (field) => (event) => setForm((current) => ({ ...current, [field]: event.target.value }))

  async function handleSubmit(event) {
    event.preventDefault()
    setTouched(true)
    if (validateTitle(form.title) || !hasChanges) return
    if (await onSave(changes)) onCancel()
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
      <Field
        label="Title"
        value={form.title}
        maxLength={TITLE_MAX}
        onChange={update('title')}
        onBlur={() => setTouched(true)}
        error={titleError}
        data-autofocus
      />
      <div className="grid grid-cols-2 gap-4">
        <Field as="select" label="Priority" value={form.priority} onChange={update('priority')}>
          {options(PRIORITY_LIST)}
        </Field>
        <Field as="select" label="Severity" value={form.severity} onChange={update('severity')}>
          {options(SEVERITY_LIST)}
        </Field>
      </div>
      <div className="flex flex-col-reverse gap-2 pt-1 sm:flex-row sm:justify-end">
        <Button variant="secondary" onClick={onCancel} disabled={saving}>
          Cancel
        </Button>
        <Button type="submit" icon={Save} loading={saving} loadingText="Saving..." disabled={!hasChanges}>
          Save changes
        </Button>
      </div>
    </form>
  )
}

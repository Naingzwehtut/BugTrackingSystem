import { Pencil, Save } from 'lucide-react'
import { useState } from 'react'
import Button from '@/components/ui/Button'
import Field from '@/components/ui/Field'
import { DESCRIPTION_MAX } from '@/config/constants'
import { validateDescription } from '@/utils/validation'

// Read-only description with an inline editor for people allowed to edit.
export default function DescriptionEditor({ description, canEdit, saving, onSave }) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(description)
  const error = editing ? validateDescription(draft) : ''
  const unchanged = draft.trim() === description

  function startEditing() {
    setDraft(description)
    setEditing(true)
  }

  async function handleSave() {
    if (unchanged) {
      setEditing(false)
      return
    }
    if (await onSave(draft.trim())) setEditing(false)
  }

  function handleKeyDown(event) {
    if (event.key === 'Escape') setEditing(false)
    if (event.key === 'Enter' && (event.metaKey || event.ctrlKey) && !error) handleSave()
  }

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-gray-800">Description</h2>
        {canEdit && !editing && (
          <button
            type="button"
            className="flex items-center gap-1 rounded px-1 text-xs font-medium text-primary-600 hover:underline"
            onClick={startEditing}
          >
            <Pencil size={12} aria-hidden="true" /> Edit
          </button>
        )}
      </div>

      {editing ? (
        <div className="flex flex-col gap-2">
          <Field
            as="textarea"
            label={<span className="sr-only">Bug description</span>}
            className="resize-y"
            rows={8}
            autoFocus
            maxLength={DESCRIPTION_MAX}
            showCount
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={handleKeyDown}
            error={error}
            hint="Ctrl/⌘ + Enter to save, Esc to cancel."
          />
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setEditing(false)} disabled={saving}>
              Cancel
            </Button>
            <Button icon={Save} loading={saving} loadingText="Saving..." disabled={Boolean(error)} onClick={handleSave}>
              Save
            </Button>
          </div>
        </div>
      ) : (
        <p className="whitespace-pre-wrap break-words text-sm leading-relaxed text-gray-700">{description}</p>
      )}
    </div>
  )
}

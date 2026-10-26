import { UserCog } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import Button from '@/components/ui/Button'

// Admin-only control to assign (or reassign) a bug to a developer.
export default function AssignDeveloper({ developers, currentDeveloperId, assigning, onAssign }) {
  const [selected, setSelected] = useState('')
  const unchanged = !selected || selected === currentDeveloperId

  async function handleSubmit(event) {
    event.preventDefault()
    if (unchanged) return
    if (await onAssign(selected)) setSelected('')
  }

  if (developers.length === 0) {
    return (
      <p className="text-xs text-gray-500">
        No developers yet.{' '}
        <Link to="/admin/users" className="font-medium text-primary-600 hover:underline">
          Promote a user to Developer
        </Link>{' '}
        to assign bugs.
      </p>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2">
      <label htmlFor="assign-developer" className="flex items-center gap-1.5 text-xs font-medium text-gray-600">
        <UserCog size={14} aria-hidden="true" /> {currentDeveloperId ? 'Reassign to' : 'Assign to'}
      </label>
      <div className="flex gap-2">
        <select
          id="assign-developer"
          className="input min-w-0 flex-1"
          value={selected}
          onChange={(event) => setSelected(event.target.value)}
        >
          <option value="">Choose a developer...</option>
          {developers.map((developer) => (
            <option key={developer.id} value={developer.id} disabled={developer.id === currentDeveloperId}>
              {developer.name}
              {developer.id === currentDeveloperId ? ' (current)' : ''}
            </option>
          ))}
        </select>
        <Button type="submit" loading={assigning} disabled={unchanged}>
          Assign
        </Button>
      </div>
    </form>
  )
}

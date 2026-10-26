import { Eye, EyeOff } from 'lucide-react'
import { useState } from 'react'
import { FieldShell } from './Field'

// Password input with a show/hide toggle.
export default function PasswordField({ label, error, hint, ...props }) {
  const [visible, setVisible] = useState(false)

  return (
    <FieldShell label={label} error={error} hint={hint}>
      {(control) => (
        <div className="relative">
          <input
            {...control}
            type={visible ? 'text' : 'password'}
            className={`input pr-10 ${error ? 'input-error' : ''}`}
            {...props}
          />
          <button
            type="button"
            onClick={() => setVisible((current) => !current)}
            aria-label={visible ? 'Hide password' : 'Show password'}
            aria-pressed={visible}
            className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-gray-400 hover:text-gray-600"
          >
            {visible ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
      )}
    </FieldShell>
  )
}

import { useId } from 'react'

/**
 * Label + any control + hint/error/character count, wired for screen readers
 * (label `for`, aria-invalid, aria-describedby). Field and PasswordField both
 * render through this, so the wiring exists in one place only.
 *
 *   <FieldShell label="Email" error={err}>{(control) => <input {...control} />}</FieldShell>
 */
export function FieldShell({ label, error, hint, count, maxLength, children }) {
  const id = useId()
  const messageId = `${id}-message`
  const message = error || hint
  const showCount = typeof count === 'number' && maxLength

  const control = {
    id,
    'aria-invalid': error ? true : undefined,
    'aria-describedby': message ? messageId : undefined,
    maxLength,
  }

  return (
    <div>
      <label htmlFor={id} className="label">
        {label}
      </label>
      {children(control)}
      {(message || showCount) && (
        <div className="mt-1 flex items-start justify-between gap-3 text-xs">
          <p id={messageId} className={error ? 'text-red-600' : 'text-gray-500'}>
            {message}
          </p>
          {showCount && (
            <span className={`shrink-0 tabular-nums ${count > maxLength * 0.9 ? 'text-orange-600' : 'text-gray-400'}`}>
              {count}/{maxLength}
            </span>
          )}
        </div>
      )}
    </div>
  )
}

/**
 * Labelled input, textarea or select.
 *
 *   <Field label="Email" type="email" value={v} onChange={...} error={errors.email} />
 *   <Field as="textarea" rows={5} label="Description" maxLength={5000} showCount ... />
 *   <Field as="select" label="Priority" ...><option>...</option></Field>
 */
export default function Field({
  label,
  error,
  hint,
  showCount = false,
  maxLength,
  as: Control = 'input',
  className = '',
  children,
  ...props
}) {
  const count = showCount ? String(props.value ?? '').length : undefined
  return (
    <FieldShell label={label} error={error} hint={hint} count={count} maxLength={maxLength}>
      {(control) => (
        <Control {...control} className={`input ${error ? 'input-error' : ''} ${className}`} {...props}>
          {children}
        </Control>
      )}
    </FieldShell>
  )
}

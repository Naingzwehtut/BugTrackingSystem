import { Loader2 } from 'lucide-react'

const VARIANTS = {
  primary: 'btn-primary',
  secondary: 'btn-secondary',
  danger: 'btn-danger',
  success: 'btn-success',
  ghost: 'btn-ghost',
}

/**
 * Button with built-in loading state.
 *   <Button variant="primary" loading={saving} loadingText="Saving..." icon={Save}>Save</Button>
 * While `loading`, it is disabled and shows a spinner (no double submits).
 */
export default function Button({
  variant = 'primary',
  loading = false,
  loadingText,
  icon: Icon,
  type = 'button',
  className = '',
  disabled,
  children,
  ...props
}) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={`${VARIANTS[variant]} ${className}`}
      {...props}
    >
      {loading ? <Loader2 size={16} className="animate-spin" aria-hidden="true" /> : Icon && <Icon size={16} aria-hidden="true" />}
      {loading && loadingText ? loadingText : children}
    </button>
  )
}

import { AlertCircle, CheckCircle2, Info } from 'lucide-react'

const VARIANTS = {
  error: { icon: AlertCircle, classes: 'border-red-200 bg-red-50 text-red-700' },
  success: { icon: CheckCircle2, classes: 'border-green-200 bg-green-50 text-green-700' },
  info: { icon: Info, classes: 'border-blue-200 bg-blue-50 text-blue-700' },
}

// Inline message box for form-level errors, confirmations and hints.
export default function Alert({ variant = 'info', children, className = '' }) {
  if (!children) return null
  const { icon: Icon, classes } = VARIANTS[variant]
  return (
    <div
      role={variant === 'error' ? 'alert' : 'status'}
      className={`flex items-start gap-2 rounded-lg border px-3 py-2 text-sm ${classes} ${className}`}
    >
      <Icon size={16} className="mt-0.5 shrink-0" aria-hidden="true" />
      <div>{children}</div>
    </div>
  )
}

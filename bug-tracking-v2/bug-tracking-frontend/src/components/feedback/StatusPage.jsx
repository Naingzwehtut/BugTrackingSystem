import { Link } from 'react-router-dom'

// Full-screen message used by the 404 and "access denied" pages.
export default function StatusPage({ icon: Icon, iconClass = 'text-gray-400', title, message, actionLabel }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 px-4 text-center">
      <Icon size={40} className={iconClass} aria-hidden="true" />
      <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
      <p className="text-sm text-gray-500">{message}</p>
      <Link to="/" className="btn-primary mt-2">
        {actionLabel}
      </Link>
    </div>
  )
}

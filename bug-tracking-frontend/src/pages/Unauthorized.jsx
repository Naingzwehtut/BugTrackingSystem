import { Link } from 'react-router-dom'
import { ShieldAlert } from 'lucide-react'

export default function Unauthorized() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-gray-50 text-center px-4">
      <ShieldAlert size={40} className="text-red-500" />
      <h1 className="text-xl font-semibold text-gray-900">Access denied</h1>
      <p className="text-sm text-gray-500">You do not have permission to view this page.</p>
      <Link to="/" className="btn-primary mt-2">
        Go back
      </Link>
    </div>
  )
}

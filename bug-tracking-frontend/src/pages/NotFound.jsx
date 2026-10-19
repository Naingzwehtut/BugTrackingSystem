import { Link } from 'react-router-dom'
import { FileQuestion } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-gray-50 text-center px-4">
      <FileQuestion size={40} className="text-gray-400" />
      <h1 className="text-xl font-semibold text-gray-900">Page not found</h1>
      <p className="text-sm text-gray-500">The page you are looking for does not exist.</p>
      <Link to="/" className="btn-primary mt-2">
        Go home
      </Link>
    </div>
  )
}

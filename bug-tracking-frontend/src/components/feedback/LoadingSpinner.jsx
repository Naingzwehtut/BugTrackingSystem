import { Loader2 } from 'lucide-react'

export default function LoadingSpinner({ label = 'Loading...' }) {
  return (
    <div role="status" className="flex flex-col items-center justify-center gap-2 py-10 text-gray-500">
      <Loader2 className="animate-spin text-primary-600" size={28} aria-hidden="true" />
      <p className="text-sm">{label}</p>
    </div>
  )
}

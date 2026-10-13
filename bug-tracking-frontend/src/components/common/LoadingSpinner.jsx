import { Loader2 } from 'lucide-react'

export default function LoadingSpinner({ label = 'Loading...' }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-10 text-gray-500">
      <Loader2 className="animate-spin text-primary-600" size={28} />
      <p className="text-sm">{label}</p>
    </div>
  )
}

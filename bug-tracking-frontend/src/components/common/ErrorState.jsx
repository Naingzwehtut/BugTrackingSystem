import { AlertTriangle, RotateCcw } from 'lucide-react'

export default function ErrorState({ message = 'Unable to load data. Please try again.', onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-14 text-red-500">
      <AlertTriangle size={32} />
      <p className="text-sm">{message}</p>
      {onRetry && (
        <button onClick={onRetry} className="btn-secondary">
          <RotateCcw size={14} /> Try again
        </button>
      )}
    </div>
  )
}

import { AlertTriangle, RotateCcw } from 'lucide-react'
import Button from '@/components/ui/Button'

export default function ErrorState({ message = 'Unable to load data. Please try again.', onRetry }) {
  return (
    <div role="alert" className="flex flex-col items-center justify-center gap-3 px-4 py-14 text-center text-red-500">
      <AlertTriangle size={32} aria-hidden="true" />
      <p className="text-sm">{message}</p>
      {onRetry && (
        <Button variant="secondary" icon={RotateCcw} onClick={() => onRetry()}>
          Try again
        </Button>
      )}
    </div>
  )
}

import { FileQuestion } from 'lucide-react'
import StatusPage from '@/components/feedback/StatusPage'
import { usePageTitle } from '@/hooks/usePageTitle'

export default function NotFound() {
  usePageTitle('Page not found')
  return (
    <StatusPage
      icon={FileQuestion}
      title="Page not found"
      message="The page you are looking for does not exist."
      actionLabel="Go home"
    />
  )
}

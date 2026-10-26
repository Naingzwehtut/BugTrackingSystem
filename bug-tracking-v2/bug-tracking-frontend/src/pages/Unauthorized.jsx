import { ShieldAlert } from 'lucide-react'
import StatusPage from '@/components/feedback/StatusPage'
import { usePageTitle } from '@/hooks/usePageTitle'

export default function Unauthorized() {
  usePageTitle('Access denied')
  return (
    <StatusPage
      icon={ShieldAlert}
      iconClass="text-red-500"
      title="Access denied"
      message="You do not have permission to view this page."
      actionLabel="Go back"
    />
  )
}

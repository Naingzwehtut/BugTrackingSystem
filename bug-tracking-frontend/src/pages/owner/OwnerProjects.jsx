import { FolderKanban } from 'lucide-react'
import EmptyState from '@/components/feedback/EmptyState'
import ErrorState from '@/components/feedback/ErrorState'
import PageHeader from '@/components/ui/PageHeader'
import Skeleton from '@/components/ui/Skeleton'
import { Table, TableBody, TableHead, Td, Th } from '@/components/ui/Table'
import { useFetch } from '@/hooks/useFetch'
import { usePageTitle } from '@/hooks/usePageTitle'
import { getAllProjects } from '@/services/projectService'
import { formatDate } from '@/utils/format'

// Owner overview of every project on the platform.
export default function OwnerProjects() {
  usePageTitle('Projects')
  const { data, loading, error, reload } = useFetch((signal) => getAllProjects({ signal }), [])

  if (loading) return <Skeleton className="h-64" />
  if (error) return <ErrorState message={error} onRetry={reload} />

  const projects = data ?? []
  return (
    <div className="flex flex-col gap-4">
      <PageHeader title="Projects" subtitle={`${projects.length} project${projects.length === 1 ? '' : 's'} on the platform.`} />
      {projects.length === 0 ? (
        <div className="card">
          <EmptyState icon={FolderKanban} message="No projects yet." description="Approved admins create projects from their Welcome page." />
        </div>
      ) : (
        <Table>
          <TableHead>
            <Th>Project</Th>
            <Th>Invite code</Th>
            <Th className="hidden md:table-cell">Admins</Th>
            <Th className="text-right">Members</Th>
            <Th className="text-right">Open / total bugs</Th>
            <Th className="hidden lg:table-cell">Created</Th>
          </TableHead>
          <TableBody>
            {projects.map((project) => (
              <tr key={project.id} className="hover:bg-gray-50">
                <Td className="font-medium text-gray-800">{project.name}</Td>
                <Td className="font-mono text-xs text-gray-600">{project.invite_code}</Td>
                <Td className="hidden text-gray-600 md:table-cell">{project.admins.join(', ') || '—'}</Td>
                <Td className="text-right tabular-nums">{project.member_count}</Td>
                <Td className="text-right tabular-nums">
                  {project.open_bug_count} / {project.bug_count}
                </Td>
                <Td className="hidden whitespace-nowrap text-gray-500 lg:table-cell">{formatDate(project.created_at)}</Td>
              </tr>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  )
}

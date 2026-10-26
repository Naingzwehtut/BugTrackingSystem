import { Suspense, useCallback, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import ErrorBoundary from '@/components/feedback/ErrorBoundary'
import LoadingSpinner from '@/components/feedback/LoadingSpinner'
import Sidebar from '@/components/layout/Sidebar'
import Topbar from '@/components/layout/Topbar'
import SupportChat from '@/components/support/SupportChat'
import { useAuth } from '@/hooks/useAuth'

export default function DashboardLayout() {
  const { user, project } = useAuth()
  const { pathname } = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const closeSidebar = useCallback(() => setSidebarOpen(false), [])

  return (
    <div className="flex min-h-screen">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-2 focus:top-2 focus:z-50 focus:rounded focus:bg-white focus:px-3 focus:py-2"
      >
        Skip to content
      </a>
      <Sidebar role={user?.role} open={sidebarOpen} onClose={closeSidebar} />
      <div className="flex min-h-screen min-w-0 flex-1 flex-col">
        <Topbar onMenuClick={() => setSidebarOpen(true)} />
        <main id="main-content" className={`flex-1 p-4 lg:p-6 ${project ? "pb-24 lg:pb-24" : ""}`}>
          {/* A crash in one page keeps the navigation usable; changing page resets it. */}
          <ErrorBoundary inline resetKey={pathname}>
            {/* Pages are code-split, so show a spinner while a page chunk loads. */}
            <Suspense fallback={<LoadingSpinner />}>
              <div className="mx-auto w-full max-w-7xl">
                <Outlet />
              </div>
            </Suspense>
          </ErrorBoundary>
        </main>
      </div>
      {/* Help chat for project members (owners have no project FAQ). */}
      {project && <SupportChat />}
    </div>
  )
}

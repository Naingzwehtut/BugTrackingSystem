# Bug Tracking System — Frontend

React 18 + Vite + Tailwind CSS client for the Bug Tracking API
(`../bug-tracking-backend`). Role-based UI for **Admin**, **Tester** and **Developer**.

## Quick start

```bash
npm install
cp .env.example .env      # set VITE_API_URL (default http://localhost:5000)
npm run dev               # http://localhost:5173
```

| Script | What it does |
|---|---|
| `npm run dev` | Dev server with hot reload |
| `npm run build` | Production build into `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm run lint` | ESLint (React + hooks rules) |
| `npm test` | Vitest unit tests for the pure logic in `src/utils` and `src/services` |

## Project structure

```
src/
├── config/        constants.js (roles, statuses, workflow, badge colours), navigation.js
├── context/       AuthProvider (session: user + project + admin request), ToastProvider,
│                  NotificationProvider (live stream + polling fallback)
├── hooks/         useAuth, useToast, useNotifications, useLiveRefresh, useFetch, useBugs,
│                  useBugDetails, useBugListParams,
│                  useDebouncedValue, usePageTitle
├── services/      api.js (axios + error handling), auth/bug/comment/user/project/adminRequest/
│                  notification/support services, notificationStream.js (SSE over fetch), mappers.js
├── utils/         permissions, bugStats, bugFilters, bugHistory, faqMatch, validation, format, roles, storage
├── components/
│   ├── ui/         Button, Field (+ FieldShell), PasswordField, SegmentedControl, Alert, Badge, Modal, ConfirmDialog,
│   │               Table, Pagination, PageHeader, Skeleton
│   ├── feedback/   EmptyState, ErrorState, LoadingSpinner, ErrorBoundary, StatusPage
│   ├── layout/     Sidebar, Topbar, AuthCard
│   ├── bugs/       BugTable, BugFilters, BugBadges, BugSummary, DescriptionEditor, EditBugDialog,
│   │               BugDetailsPanel, AssignDeveloper, StatusActions, CommentSection, BugHistory
│   ├── dashboard/  BugDashboard, InviteCard, StatCard, SummaryCard, RecentBugs, DashboardSkeleton
│   ├── notifications/ NotificationBell, NotificationItem
│   └── support/    SupportChat (floating help chat)
├── layouts/       AuthLayout, DashboardLayout
├── routes/        AppRoutes (lazy-loaded pages), ProtectedRoute, RoleRoute
└── pages/         auth/, owner/, admin/ (incl. HelpCenter), tester/, developer/, bugs/,
                   Welcome (no project yet), Notifications, Settings, ...
```

Imports use the `@/` alias for `src/` (e.g. `import Button from '@/components/ui/Button'`).

## How the pieces fit

- **Data flow:** page → hook (`useFetch` / `useBugDetails`) → service → `api.js` (axios). Services return plain data
  (never raw response envelopes) and `mappers.js` normalises records.
- **Live notifications:** `NotificationProvider` opens `/api/notifications/stream` with `fetch()` (so the JWT goes in a
  header, not the URL), adds each event instantly, re-syncs on reconnect, and polls once a minute as a fallback.
  `useLiveRefresh` lets a page reload itself when a relevant notification arrives.
- **Auth:** `AuthProvider` restores the session from the stored token. If the API ever answers 401, the HTTP layer
  tells the provider to sign out and React Router redirects to `/login`.
- **Permissions:** `utils/permissions.js` decides which controls to show; the backend remains the real authority.
- **Dashboards:** one `BugDashboard` component; each role page only declares its stat cards. Every number links to
  the bug list pre-filtered to what it counts.
- **Bug list state lives in the URL** (`/bugs?status=Open&sort=priority&page=2`, via `useBugListParams`), so Back,
  reload and shared links keep the filters.

# Bug Tracking System — Frontend

A React + Vite + Tailwind CSS frontend for a university Bug Tracking System project.
It communicates with an existing Flask REST API (JWT auth, Supabase PostgreSQL,
deployed on Render). This project does **not** implement or modify any backend
logic — it only calls the documented endpoints.

## Tech Stack

- React 18 + Vite
- Tailwind CSS
- React Router v6
- Axios (central API service layer)
- Context API for auth/session state
- Lucide React icons

## Project Structure

```
bug-tracking-frontend/
├── public/
│   └── logo.svg
├── src/
│   ├── components/
│   │   ├── common/       # Sidebar, Topbar, Toast, Modal, states...
│   │   ├── bugs/         # BugTable, badges, comments, history, status actions
│   │   └── dashboard/    # StatCard, summaries, recent bugs
│   ├── pages/
│   │   ├── auth/         # Login, Register
│   │   ├── admin/        # AdminDashboard, UserManagement
│   │   ├── tester/       # TesterDashboard, CreateBug
│   │   ├── developer/    # DeveloperDashboard
│   │   └── bugs/         # BugList, BugDetails (shared across roles)
│   ├── services/         # api.js, authService, bugService, userService, commentService
│   ├── context/          # AuthContext
│   ├── hooks/            # useAuth
│   ├── routes/           # AppRoutes, ProtectedRoute, RoleRoute
│   ├── layouts/          # DashboardLayout, AuthLayout
│   └── utils/            # constants, formatDate, permissions
├── .env.example
└── package.json
```

## 1. Installation

```bash
npm install
```

## 2. Environment configuration

Copy the example file and point it at your running Flask backend:

```bash
cp .env.example .env
```

`.env`:

```
VITE_API_URL=http://localhost:5000
```

For production, set `VITE_API_URL` to your deployed Render backend URL
(e.g. `https://your-backend.onrender.com`). **Never commit `.env`** —
it's already listed in `.gitignore`.

## 3. Run locally

```bashn
npm run dev
```

The app runs at `http://localhost:5173` and calls the Flask API at
`VITE_API_URL` for every request, automatically attaching the JWT
(`Authorization: Bearer <token>`) once you're logged in.

## 4. Connecting to the existing Flask backend

Make sure your Flask API is running (locally or on Render) and exposes
CORS access to the frontend's origin. No backend code changes are needed —
this frontend only calls:

- `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me`
- `GET /api/users`, `GET /api/users/developers`, `PUT /api/users/:id/role`
- `POST /api/bugs`, `GET /api/bugs`, `GET /api/bugs/:id`, `PUT /api/bugs/:id`,
  `DELETE /api/bugs/:id`, `PUT /api/bugs/:id/assign`, `PUT /api/bugs/:id/status`,
  `GET /api/bugs/:id/history`
- `POST /api/bugs/:id/comments`, `GET /api/bugs/:id/comments`

The backend remains the **source of truth** for authorization and workflow
rules. The frontend only hides obviously-invalid buttons (e.g. a Tester
won't see a "Mark as In Progress" button) — every action is still validated
server-side, and 403/400 responses are shown as friendly error messages.

## 5. Production build

```bash
npm run build
```

This outputs static files to `dist/`. Preview it locally with:

```bash
npm run preview
```

## 6. Deployment

Deploy `dist/` to any static host (Vercel, Netlify, Render Static Site, GitHub
Pages, etc.). Set the `VITE_API_URL` environment variable in your hosting
provider's dashboard to your deployed Flask backend URL before building.

## Roles & Navigation

| Role      | Home route            | Navigation                                              |
|-----------|------------------------|----------------------------------------------------------|
| Admin     | `/admin/dashboard`     | Dashboard, Bugs, Users, Notifications, Settings, Logout  |
| Tester    | `/tester/dashboard`    | Dashboard, My Bugs, Create Bug, Notifications, Settings  |
| Developer | `/developer/dashboard` | Dashboard, Assigned Bugs, All Bugs, Notifications, Settings |

Public registration always creates a **Tester** account — there is no public
Admin signup option, matching the backend's behavior.

## Notes for graders / reviewers

- All Axios calls live in `src/services/*` — components never call Axios directly.
- `AuthContext` calls `GET /api/auth/me` on startup if a token is stored, and
  clears the session + redirects to `/login` if it's invalid or expired.
- Route protection is two-layered: `ProtectedRoute` (must be logged in) and
  `RoleRoute` (must have an allowed role) — unauthorized users are redirected
  to `/unauthorized`.
- Every API-driven page implements loading, error, and empty states.
- Status/priority/severity are rendered as colored badges as specified.

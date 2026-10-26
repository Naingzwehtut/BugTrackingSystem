import { Bug } from 'lucide-react'

// Centered card with the brand mark, shared by the Login and Register pages.
export default function AuthCard({ title, subtitle, footer, children }) {
  return (
    <div className="card w-full max-w-md p-8">
      <div className="mb-6 flex flex-col items-center text-center">
        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-primary-600 text-white">
          <Bug size={24} aria-hidden="true" />
        </div>
        <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
        <p className="mt-1 text-sm text-gray-500">{subtitle}</p>
      </div>
      {children}
      <p className="mt-6 text-center text-sm text-gray-500">{footer}</p>
    </div>
  )
}

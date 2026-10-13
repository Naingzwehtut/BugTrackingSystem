import { useAuth } from '../hooks/useAuth'

export default function Settings() {
  const { user } = useAuth()

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-xl font-semibold text-gray-900">Settings</h1>
        <p className="text-sm text-gray-500">Your account information.</p>
      </div>

      <div className="card max-w-md p-5">
        <div className="flex flex-col gap-4">
          <div>
            <p className="label mb-1">Name</p>
            <p className="text-sm text-gray-800">{user?.name}</p>
          </div>
          <div>
            <p className="label mb-1">Email</p>
            <p className="text-sm text-gray-800">{user?.email}</p>
          </div>
          <div>
            <p className="label mb-1">Role</p>
            <p className="text-sm capitalize text-gray-800">{user?.role}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

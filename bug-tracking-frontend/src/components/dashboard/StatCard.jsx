export default function StatCard({ label, value, icon: Icon, tone = 'primary' }) {
  const tones = {
    primary: 'bg-primary-50 text-primary-600',
    green: 'bg-green-50 text-green-600',
    orange: 'bg-orange-50 text-orange-600',
    red: 'bg-red-50 text-red-600',
    gray: 'bg-gray-100 text-gray-600',
  }
  return (
    <div className="card flex items-center justify-between p-4">
      <div>
        <p className="text-xs font-medium text-gray-500">{label}</p>
        <p className="mt-1 text-2xl font-semibold text-gray-900">{value}</p>
      </div>
      <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${tones[tone]}`}>
        <Icon size={20} />
      </div>
    </div>
  )
}

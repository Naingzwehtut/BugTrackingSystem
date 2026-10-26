import { Link } from 'react-router-dom'

const TONES = {
  primary: 'bg-primary-50 text-primary-600',
  green: 'bg-green-50 text-green-600',
  orange: 'bg-orange-50 text-orange-600',
  red: 'bg-red-50 text-red-600',
  gray: 'bg-gray-100 text-gray-600',
}

// A headline number. With `to`, the whole card links to the matching bug list.
export default function StatCard({ label, value, icon: Icon, tone = 'primary', to }) {
  const content = (
    <>
      <div>
        <p className="text-xs font-medium text-gray-500">{label}</p>
        <p className="mt-1 text-2xl font-semibold tabular-nums text-gray-900">{value}</p>
      </div>
      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${TONES[tone] ?? TONES.primary}`}>
        <Icon size={20} aria-hidden="true" />
      </div>
    </>
  )

  const base = 'card flex items-center justify-between gap-3 p-4'
  if (!to) return <div className={base}>{content}</div>
  return (
    <Link
      to={to}
      aria-label={`${label}: ${value}. View bugs`}
      className={`${base} transition hover:-translate-y-0.5 hover:border-primary-200 hover:shadow-md`}
    >
      {content}
    </Link>
  )
}

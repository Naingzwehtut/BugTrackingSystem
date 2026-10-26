// Generic pill. Status/priority/severity badges are thin wrappers (see
// components/bugs/BugBadges.jsx) so the styling lives in one place.
export default function Badge({ className = '', dotClass, children }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${className}`}
    >
      {dotClass && <span className={`h-1.5 w-1.5 rounded-full ${dotClass}`} aria-hidden="true" />}
      {children}
    </span>
  )
}

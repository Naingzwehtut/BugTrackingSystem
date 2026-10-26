// Pulsing placeholder block shown while content loads (better perceived
// performance than a lone spinner because the layout doesn't jump).
export default function Skeleton({ className = '' }) {
  return <div aria-hidden="true" className={`animate-pulse rounded-md bg-gray-200 ${className}`} />
}

import Badge from '@/components/ui/Badge'
import { BADGE_STYLES, FALLBACK_BADGE_STYLE } from '@/config/constants'

/**
 * One badge for every bug attribute. `label` adds a visible prefix
 * ("Priority: High") where the kind isn't obvious from context - a bare
 * "Critical" could be either a priority or a severity.
 */
export function BugBadge({ kind, value, label }) {
  const { badge, dot } = BADGE_STYLES[kind]?.[value] ?? FALLBACK_BADGE_STYLE
  return (
    <Badge className={badge} dotClass={kind === 'status' ? dot : undefined}>
      {label && <span className="font-normal opacity-70">{label}:</span>}
      {value}
    </Badge>
  )
}

export const StatusBadge = ({ status, label }) => <BugBadge kind="status" value={status} label={label} />
export const PriorityBadge = ({ priority, label }) => <BugBadge kind="priority" value={priority} label={label} />
export const SeverityBadge = ({ severity, label }) => <BugBadge kind="severity" value={severity} label={label} />

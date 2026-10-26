// Turns a raw audit-trail row into a sentence a person can read.
export function describeHistoryEntry(entry) {
  const from = entry.old_value_label ?? entry.old_value
  const to = entry.new_value_label ?? entry.new_value

  switch (entry.action) {
    case 'created':
      return 'Bug reported'
    case 'status_changed':
      return `Status changed from ${from} to ${to}`
    case 'priority_changed':
      return `Priority changed from ${from} to ${to}`
    case 'severity_changed':
      return `Severity changed from ${from} to ${to}`
    case 'assignment_changed':
      return from ? `Reassigned from ${from} to ${to}` : `Assigned to ${to}`
    default:
      return entry.description || entry.message || entry.action || 'Bug updated'
  }
}

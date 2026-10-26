// Normalise API records into the flat shape the UI reads. Each mapper accepts
// both the flat fields the backend now returns and the older nested shapes,
// so the UI keeps working against either version of the API.

export function normalizeBug(raw) {
  if (!raw) return raw
  return {
    ...raw,
    reporter_name: raw.reporter_name ?? raw.reporter?.name ?? null,
    assigned_developer_name: raw.assigned_developer_name ?? raw.assigned_developer?.name ?? null,
  }
}

export function normalizeComment(raw) {
  return {
    ...raw,
    user_name: raw.user_name ?? raw.users?.name ?? raw.user?.name ?? 'Unknown user',
    user_role: raw.user_role ?? raw.users?.role ?? raw.user?.role ?? null,
  }
}

export function normalizeHistoryEntry(raw) {
  return {
    ...raw,
    user_name: raw.user_name ?? raw.users?.name ?? null,
  }
}

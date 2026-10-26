import {
  DESCRIPTION_MAX,
  DESCRIPTION_MIN,
  NAME_MAX,
  PASSWORD_MIN,
  PROJECT_NAME_MAX,
  REASON_MAX,
  REASON_MIN,
  TITLE_MAX,
  TITLE_MIN,
} from '@/config/constants'

// Client-side mirrors of the backend rules so people get instant feedback
// instead of waiting for a round-trip. The backend still validates everything.
// Each validator returns an error message, or '' when the value is fine.

function lengthBetween(label, value, min, max) {
  const length = value.trim().length
  if (length < min) return min === 1 ? `Enter ${label.toLowerCase()}.` : `${label} must be at least ${min} characters.`
  if (length > max) return `${label} must be at most ${max} characters.`
  return ''
}

export function validateEmail(email) {
  return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.trim()) ? '' : 'Enter a valid email address.'
}

export function validatePassword(password) {
  const valid = password.length >= PASSWORD_MIN && /[A-Za-z]/.test(password) && /\d/.test(password)
  return valid ? '' : `Use at least ${PASSWORD_MIN} characters, including a letter and a number.`
}

export const validateName = (name) => lengthBetween('Your name', name, 1, NAME_MAX)
export const validateTitle = (title) => lengthBetween('Title', title, TITLE_MIN, TITLE_MAX)
export const validateDescription = (text) => lengthBetween('Description', text, DESCRIPTION_MIN, DESCRIPTION_MAX)

export const validateProjectName = (name) => lengthBetween('Project name', name, 2, PROJECT_NAME_MAX)
export const validateReason = (reason) => lengthBetween('Reason', reason, REASON_MIN, REASON_MAX)

// Invite codes look like BUG-7KQ2X9; the "BUG-" prefix is optional when typing.
export function validateInviteCode(code) {
  return /^(BUG-)?[A-Z0-9]{6}$/i.test(code.trim()) ? '' : 'Enter the invite code from your admin, e.g. BUG-7KQ2X9.'
}

// Keep only the entries that actually have an error message.
export const compactErrors = (errors) => Object.fromEntries(Object.entries(errors).filter(([, message]) => message))

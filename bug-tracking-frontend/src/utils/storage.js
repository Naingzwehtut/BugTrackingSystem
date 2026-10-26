// The only place that touches localStorage for auth, so the key name isn't
// duplicated across files and private-mode/disabled storage can't crash the app.
const TOKEN_KEY = 'token'
const LEGACY_KEYS = ['user'] // older versions also cached the user object

function safely(action, fallback = null) {
  try {
    return action()
  } catch {
    return fallback
  }
}

export const tokenStorage = {
  get: () => safely(() => localStorage.getItem(TOKEN_KEY)),
  set: (token) => safely(() => localStorage.setItem(TOKEN_KEY, token)),
  clear: () =>
    safely(() => {
      localStorage.removeItem(TOKEN_KEY)
      LEGACY_KEYS.forEach((key) => localStorage.removeItem(key))
    }),
}

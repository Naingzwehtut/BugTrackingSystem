import { useEffect } from 'react'

const APP_NAME = 'Bug Tracking System'

// Sets the browser tab title, e.g. "Bugs · Bug Tracking System".
export function usePageTitle(title) {
  useEffect(() => {
    document.title = title ? `${title} · ${APP_NAME}` : APP_NAME
  }, [title])
}

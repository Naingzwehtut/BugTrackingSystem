import { getBugs } from '@/services/bugService'
import { useFetch } from './useFetch'

// All bugs visible to the current user (the API already scopes by role).
export function useBugs() {
  return useFetch((signal) => getBugs({}, { signal }), [])
}

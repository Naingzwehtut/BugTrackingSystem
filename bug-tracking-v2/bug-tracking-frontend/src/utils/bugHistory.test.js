import { describe, expect, it } from 'vitest'
import { describeHistoryEntry } from './bugHistory'

describe('describeHistoryEntry', () => {
  it('describes each action type', () => {
    expect(describeHistoryEntry({ action: 'created' })).toBe('Bug reported')
    expect(describeHistoryEntry({ action: 'status_changed', old_value: 'Open', new_value: 'In Progress' })).toBe(
      'Status changed from Open to In Progress',
    )
    expect(describeHistoryEntry({ action: 'priority_changed', old_value: 'Low', new_value: 'High' })).toBe(
      'Priority changed from Low to High',
    )
  })

  it('uses resolved names for assignments', () => {
    const first = { action: 'assignment_changed', old_value: null, new_value: 'uuid', new_value_label: 'Dana' }
    expect(describeHistoryEntry(first)).toBe('Assigned to Dana')
    const again = { ...first, old_value: 'uuid0', old_value_label: 'Lee' }
    expect(describeHistoryEntry(again)).toBe('Reassigned from Lee to Dana')
  })

  it('falls back gracefully for unknown actions', () => {
    expect(describeHistoryEntry({ action: 'something_new' })).toBe('something_new')
  })
})

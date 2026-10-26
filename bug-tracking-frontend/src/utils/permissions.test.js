import { describe, expect, it } from 'vitest'
import { availableStatusActions, canEditBug } from './permissions'

const dev = { id: 'd1', role: 'developer' }
const tester = { id: 't1', role: 'tester' }
const admin = { id: 'a1', role: 'admin' }

describe('availableStatusActions', () => {
  it('lets developers work a bug forward', () => {
    expect(availableStatusActions(dev, 'Open')).toEqual(['In Progress'])
    expect(availableStatusActions(dev, 'In Progress')).toEqual(['Resolved'])
    expect(availableStatusActions(dev, 'Reopened')).toEqual(['In Progress'])
    expect(availableStatusActions(dev, 'Resolved')).toEqual([])
  })

  it('lets testers verify resolved bugs only', () => {
    expect(availableStatusActions(tester, 'Resolved')).toEqual(['Closed', 'Reopened'])
    expect(availableStatusActions(tester, 'Open')).toEqual([])
  })

  it('offers admins only legal workflow moves', () => {
    expect(availableStatusActions(admin, 'Open')).toEqual(['In Progress'])
    expect(availableStatusActions(admin, 'Resolved')).toEqual(['Closed', 'Reopened'])
    expect(availableStatusActions(admin, 'Closed')).toEqual([])
  })

  it('returns nothing without a user', () => {
    expect(availableStatusActions(null, 'Open')).toEqual([])
  })
})

describe('canEditBug', () => {
  it('allows admins, and developers on their own bugs', () => {
    expect(canEditBug(admin, { assigned_to: 'x' })).toBe(true)
    expect(canEditBug(dev, { assigned_to: 'd1' })).toBe(true)
    expect(canEditBug(dev, { assigned_to: 'other' })).toBe(false)
    expect(canEditBug(tester, { assigned_to: 't1' })).toBe(false)
  })
})

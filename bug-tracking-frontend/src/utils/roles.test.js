import { describe, expect, it } from 'vitest'
import { getRoleHome, resolvePostLoginPath } from './roles'

describe('roles', () => {
  it('maps roles to their home page', () => {
    expect(getRoleHome('admin')).toBe('/admin/dashboard')
    expect(getRoleHome('nobody')).toBe('/login')
  })

  it('honours the requested page unless it belongs to another role', () => {
    const tester = { role: 'tester' }
    expect(resolvePostLoginPath(tester, '/bugs/123')).toBe('/bugs/123')
    expect(resolvePostLoginPath(tester, '/admin/users')).toBe('/tester/dashboard')
    expect(resolvePostLoginPath(tester, undefined)).toBe('/tester/dashboard')
    expect(resolvePostLoginPath(tester, '/login')).toBe('/tester/dashboard')
  })
})

describe('owners and projects', () => {
  it('sends owners to their requests page and requires a project for everyone else', async () => {
    const { needsProject } = await import('./roles')
    expect(getRoleHome('owner')).toBe('/owner/requests')
    expect(needsProject({ role: 'owner' }, null)).toBe(false)
    expect(needsProject({ role: 'tester' }, null)).toBe(true)
    expect(needsProject({ role: 'admin' }, { id: 'p1' })).toBe(false)
    expect(resolvePostLoginPath({ role: 'admin' }, '/owner/requests')).toBe('/admin/dashboard')
  })
})

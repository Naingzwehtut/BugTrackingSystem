import { describe, expect, it } from 'vitest'
import { bugListUrl, buildListParams, countActiveFilters, DEFAULT_FILTERS, filterAndSortBugs, parseListParams } from './bugFilters'

const bugs = [
  { id: 1, title: 'Login fails', status: 'Open', priority: 'High', severity: 'Major', assigned_to: 'd1', created_at: '2026-01-01' },
  { id: 2, title: 'Logout slow', status: 'Closed', priority: 'Low', severity: 'Minor', assigned_to: null, created_at: '2026-01-02' },
  { id: 3, title: 'Crash on save', status: 'Open', priority: 'High', severity: 'Blocker', assigned_to: 'd2', created_at: '2026-01-03' },
]
const run = (overrides) => filterAndSortBugs(bugs, { ...DEFAULT_FILTERS, ...overrides }).map((b) => b.id)

describe('filterAndSortBugs', () => {
  it('sorts newest first by default and oldest on request', () => {
    expect(run({})).toEqual([3, 2, 1])
    expect(run({ sort: 'oldest' })).toEqual([1, 2, 3])
  })

  it('searches titles case-insensitively', () => {
    expect(run({ search: ' LOG ' })).toEqual([2, 1])
  })

  it('combines status, priority, severity and developer filters', () => {
    expect(run({ status: 'Open', priority: 'High' })).toEqual([3, 1])
    expect(run({ severity: 'Blocker' })).toEqual([3])
    expect(run({ developer: 'd1' })).toEqual([1])
  })
})

describe('countActiveFilters', () => {
  it('ignores sort and empty values', () => {
    expect(countActiveFilters(DEFAULT_FILTERS)).toBe(0)
    expect(countActiveFilters({ ...DEFAULT_FILTERS, status: 'Open', sort: 'oldest' })).toBe(1)
  })
})

describe('more sort orders and search', () => {
  const triage = [
    { id: 'aaa111', title: 'A', priority: 'Low', severity: 'Blocker', created_at: '2026-01-03', updated_at: '2026-01-03' },
    { id: 'bbb222', title: 'B', priority: 'Critical', severity: 'Minor', created_at: '2026-01-01', updated_at: '2026-01-09' },
    { id: 'ccc333', title: 'C', priority: 'High', severity: 'Major', created_at: '2026-01-02', updated_at: '2026-01-02' },
  ]
  const order = (overrides) => filterAndSortBugs(triage, { ...DEFAULT_FILTERS, ...overrides }).map((b) => b.title)

  it('sorts by priority, severity and last update', () => {
    expect(order({ sort: 'priority' })).toEqual(['B', 'C', 'A'])
    expect(order({ sort: 'severity' })).toEqual(['A', 'C', 'B'])
    expect(order({ sort: 'updated' })).toEqual(['B', 'A', 'C'])
  })

  it('finds a bug by its short reference, with or without #', () => {
    expect(order({ search: '#bbb2' })).toEqual(['B'])
    expect(order({ search: 'ccc' })).toEqual(['C'])
  })
})

describe('URL params', () => {
  it('round-trips filters and page, omitting defaults', () => {
    const filters = { ...DEFAULT_FILTERS, status: 'Open', sort: 'priority' }
    const params = buildListParams(filters, 3)
    expect(params.toString()).toBe('status=Open&sort=priority&page=3')
    expect(parseListParams(params)).toEqual({ filters, page: 3 })
  })

  it('ignores invalid values from hand-edited links', () => {
    const { filters, page } = parseListParams(new URLSearchParams('status=Banana&sort=x&page=-2&priority=High'))
    expect(filters).toEqual({ ...DEFAULT_FILTERS, priority: 'High' })
    expect(page).toBe(1)
  })

  it('builds dashboard links to a filtered list', () => {
    expect(bugListUrl()).toBe('/bugs')
    expect(bugListUrl({ status: 'In Progress' })).toBe('/bugs?status=In+Progress')
  })
})

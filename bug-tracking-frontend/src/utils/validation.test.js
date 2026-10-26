import { describe, expect, it } from 'vitest'
import { compactErrors, validateDescription, validateEmail, validateName, validatePassword, validateTitle } from './validation'

describe('validation', () => {
  it('checks email format', () => {
    expect(validateEmail('a@b.co')).toBe('')
    expect(validateEmail('nope')).not.toBe('')
  })

  it('mirrors the backend password rule', () => {
    expect(validatePassword('Passw0rd1')).toBe('')
    expect(validatePassword('short1')).not.toBe('')
    expect(validatePassword('lettersonly')).not.toBe('')
    expect(validatePassword('12345678')).not.toBe('')
  })

  it('checks bug title and description length', () => {
    expect(validateTitle(' ab ')).not.toBe('')
    expect(validateTitle('abc')).toBe('')
    expect(validateDescription('too short')).not.toBe('')
    expect(validateDescription('long enough text')).toBe('')
  })

  it('compactErrors keeps only real messages', () => {
    expect(compactErrors({ a: '', b: 'bad' })).toEqual({ b: 'bad' })
  })
})

describe('length limits match the backend', () => {
  it('rejects values over the maximum', () => {
    expect(validateTitle('x'.repeat(200))).toBe('')
    expect(validateTitle('x'.repeat(201))).toMatch(/at most 200/)
    expect(validateDescription('x'.repeat(5001))).toMatch(/at most 5000/)
  })

  it('requires a name', () => {
    expect(validateName('  ')).toBe('Enter your name.')
    expect(validateName('Hein')).toBe('')
  })
})

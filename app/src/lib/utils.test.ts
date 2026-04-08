import { describe, expect, it } from 'vitest'
import { cn } from './utils'

describe('cn', () => {
  it('merges and deduplicates tailwind classes', () => {
    expect(cn('px-2 text-sm', 'px-4')).toBe('text-sm px-4')
  })

  it('ignores falsy values', () => {
    expect(cn('font-bold', undefined, false && 'hidden')).toBe('font-bold')
  })
})

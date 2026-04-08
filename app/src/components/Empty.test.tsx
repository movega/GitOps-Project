import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import Empty from './Empty'

describe('Empty', () => {
  it('renders fallback content', () => {
    render(<Empty />)
    expect(screen.getByText('Empty')).toBeInTheDocument()
  })
})

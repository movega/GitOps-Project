import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from './App'

describe('App', () => {
  it('renders Hola Mundo heading', () => {
    render(<App />)
    expect(
      screen.getByRole('heading', {
        name: 'Hola Mundo',
      }),
    ).toBeInTheDocument()
  })
})

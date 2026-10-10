// @vitest-environment happy-dom
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import App from './App'
import { STORAGE_KEY } from './lib/storage'
import type { StoredState } from './types'

function renderApp() {
  return render(<App />)
}

function savedState(): StoredState {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) throw new Error('Expected saved kitchen data')
  return JSON.parse(raw) as StoredState
}

function productRow(name: string) {
  const heading = screen.getByRole('heading', { name, level: 3 })
  const row = heading.closest('li')
  if (!row) throw new Error(`No row for ${name}`)
  return row
}

describe('Use It First', () => {
  beforeEach(() => {
    localStorage.clear()
    window.location.hash = ''
  })

  afterEach(() => {
    cleanup()
  })

  it('opens each section from the sidebar', async () => {
    const user = userEvent.setup()
    renderApp()

    expect(screen.getByRole('heading', { name: 'Use these first' })).toBeTruthy()
    expect(screen.getByRole('heading', { name: 'Baby spinach', level: 3 })).toBeTruthy()

    await user.click(screen.getByRole('link', { name: 'My Products' }))
    expect(await screen.findByRole('heading', { name: 'My Products' })).toBeTruthy()
    expect(document.title).toBe('My Products · Use It First')

    await user.click(screen.getByRole('link', { name: 'Recipes' }))
    expect(await screen.findByRole('heading', { name: 'Recipes' })).toBeTruthy()

    await user.click(screen.getByRole('link', { name: 'Weekly Impact' }))
    expect(await screen.findByRole('heading', { name: 'Weekly Impact' })).toBeTruthy()
    expect(screen.getByText('2 products used before expiration')).toBeTruthy()

    await user.click(screen.getByRole('link', { name: 'Overview' }))
    expect(await screen.findByRole('heading', { name: 'Use these first' })).toBeTruthy()
  })

  it('rejects an empty product, then keeps a valid one after refresh', async () => {
    const user = userEvent.setup()
    const view = renderApp()

    await user.click(screen.getByRole('link', { name: 'My Products' }))
    await screen.findByRole('heading', { name: 'My Products' })
    await user.click(screen.getByRole('button', { name: 'Add a product' }))
    await user.click(screen.getByRole('button', { name: 'Add product' }))

    expect(screen.getByText('Enter a product name.')).toBeTruthy()
    expect(screen.getByText('Choose a category.')).toBeTruthy()
    expect(screen.getByText('Choose an expiration date.')).toBeTruthy()

    await user.type(screen.getByRole('textbox', { name: /Name \(required\)/ }), 'Rice cakes')
    await user.selectOptions(screen.getByRole('combobox', { name: /Category \(required\)/ }), 'Pantry')
    fireEvent.change(screen.getByLabelText(/Expiration date/), { target: { value: '2026-12-20' } })
    await user.click(screen.getByRole('button', { name: 'Add product' }))

    expect(await screen.findByRole('heading', { name: 'Rice cakes', level: 3 })).toBeTruthy()

    view.unmount()
    renderApp()
    await user.click(screen.getByRole('link', { name: 'My Products' }))
    expect(await screen.findByRole('heading', { name: 'Rice cakes', level: 3 })).toBeTruthy()
    expect(savedState().products.some((product) => product.name === 'Rice cakes')).toBe(true)
  })

  it('edits a product name', async () => {
    const user = userEvent.setup()
    renderApp()

    await user.click(screen.getByRole('link', { name: 'My Products' }))
    await screen.findByRole('heading', { name: 'Whole milk', level: 3 })
    await user.click(within(productRow('Whole milk')).getByRole('button', { name: 'Edit' }))

    const name = screen.getByRole('textbox', { name: /Name \(required\)/ })
    await user.clear(name)
    await user.type(name, 'Oat milk')
    await user.click(screen.getByRole('button', { name: 'Save changes' }))

    expect(await screen.findByRole('heading', { name: 'Oat milk', level: 3 })).toBeTruthy()
    expect(screen.queryByRole('heading', { name: 'Whole milk', level: 3 })).toBeNull()
  })

  it('counts a product used on its expiration date exactly once', async () => {
    const user = userEvent.setup()
    const view = renderApp()

    expect(screen.getByText('2 products used before expiration')).toBeTruthy()
    await user.click(within(productRow('Whole milk')).getByRole('button', { name: 'Mark used' }))
    await user.click(screen.getByRole('button', { name: 'Mark as used' }))

    expect(await screen.findByText('3 products used before expiration')).toBeTruthy()
    expect(screen.queryByRole('heading', { name: 'Whole milk', level: 3 })).toBeNull()
    expect(savedState().usageHistory.filter((record) => record.productName === 'Whole milk')).toHaveLength(1)

    view.unmount()
    renderApp()
    expect(screen.getByText('3 products used before expiration')).toBeTruthy()
    expect(screen.queryByRole('heading', { name: 'Whole milk', level: 3 })).toBeNull()
    expect(savedState().usageHistory.filter((record) => record.productName === 'Whole milk')).toHaveLength(1)
  })

  it('removes a product only after confirmation and does not record it as used', async () => {
    const user = userEvent.setup()
    renderApp()
    const before = savedState().usageHistory.length

    await user.click(screen.getByRole('link', { name: 'My Products' }))
    await screen.findByRole('heading', { name: 'Carrots', level: 3 })
    await user.click(within(productRow('Carrots')).getByRole('button', { name: 'Remove' }))
    expect(screen.getByRole('heading', { name: 'Remove Carrots?' })).toBeTruthy()
    await user.click(screen.getByRole('button', { name: 'Remove product' }))

    expect(screen.queryByRole('heading', { name: 'Carrots', level: 3 })).toBeNull()
    expect(savedState().usageHistory).toHaveLength(before)
    expect(savedState().products.some((product) => product.name === 'Carrots')).toBe(false)
  })

  it('filters by freshness and shows an empty search', async () => {
    const user = userEvent.setup()
    renderApp()

    await user.click(screen.getByRole('link', { name: 'My Products' }))
    await screen.findByRole('heading', { name: 'My Products' })
    await user.click(screen.getByRole('button', { name: 'Use today' }))

    expect(screen.getByRole('heading', { name: 'Whole milk', level: 3 })).toBeTruthy()
    expect(screen.queryByRole('heading', { name: 'Baby spinach', level: 3 })).toBeNull()

    await user.click(screen.getByRole('button', { name: 'Expired' }))
    expect(screen.getByRole('heading', { name: 'Baby spinach', level: 3 })).toBeTruthy()
    expect(screen.queryByRole('heading', { name: 'Whole milk', level: 3 })).toBeNull()

    await user.click(screen.getByRole('button', { name: 'All' }))
    await user.type(screen.getByRole('searchbox', { name: 'Search by name' }), 'no-such-food')
    expect(screen.getByRole('heading', { name: 'No matching names' })).toBeTruthy()
  })

  it('shows a missing recipe ingredient and ranks urgent food first', async () => {
    const user = userEvent.setup()
    renderApp()

    await user.click(screen.getByRole('link', { name: 'Recipes' }))
    const recipeButtons = await screen.findAllByRole('button', { name: /in your kitchen/ })
    expect(recipeButtons[0]?.textContent).toMatch(/Spinach omelette/)

    await user.click(screen.getByRole('button', { name: /Lemon herb chicken/ }))
    expect(screen.getByRole('heading', { name: 'Lemon herb chicken', level: 2 })).toBeTruthy()
    expect(screen.getByText('Not in your kitchen')).toBeTruthy()
  })

  it('clears the kitchen and can restore the demo', async () => {
    const user = userEvent.setup()
    renderApp()

    await user.click(screen.getByRole('button', { name: 'Clear saved data' }))
    await user.click(screen.getByRole('button', { name: 'Clear data' }))
    expect(await screen.findByRole('heading', { name: 'Add your first product' })).toBeTruthy()
    expect(savedState().products).toEqual([])
    expect(savedState().usageHistory).toEqual([])

    await user.click(screen.getByRole('button', { name: 'Restore demo kitchen' }))
    await user.click(screen.getByRole('button', { name: 'Restore demo' }))
    expect(await screen.findByRole('heading', { name: 'Baby spinach', level: 3 })).toBeTruthy()
    expect(screen.getByText('2 products used before expiration')).toBeTruthy()
  })
})

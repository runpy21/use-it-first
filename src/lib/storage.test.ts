import { describe, expect, it } from 'vitest'
import type { Product, StoredState } from '../types'
import { markProductUsed, updateProduct } from './inventory'
import { summarizeImpact } from './impact'
import { createMemoryStorage, loadState, parseStoredState, saveState, STORAGE_KEY } from './storage'

const today = '2026-10-10'

function milk(expirationDate = '2026-10-20'): Product {
  return {
    id: 'milk-1',
    name: 'Whole milk',
    category: 'Dairy',
    expirationDate,
    quantity: 1,
    unit: 'L',
    notes: '',
    createdAt: '2026-10-01T12:00:00.000Z',
  }
}

function stateWith(products: Product[]): StoredState {
  return { version: 1, products, usageHistory: [] }
}

describe('storage', () => {
  it('seeds a first visit and reloads that same data', () => {
    const storage = createMemoryStorage()
    const first = loadState(storage, today)
    expect(first.source).toBe('seed')
    expect(first.state.products.length).toBeGreaterThan(0)

    const second = loadState(storage, today)
    expect(second.source).toBe('stored')
    expect(second.state.products.map((product) => product.id)).toEqual(
      first.state.products.map((product) => product.id),
    )
  })

  it('keeps invalid saved text untouched and falls back to an empty kitchen', () => {
    const storage = createMemoryStorage({ [STORAGE_KEY]: '{not json' })
    const loaded = loadState(storage, today)

    expect(loaded.source).toBe('invalid')
    expect(loaded.state.products).toEqual([])
    expect(storage.getItem(STORAGE_KEY)).toBe('{not json')
  })

  it('drops a broken product and keeps a valid one', () => {
    const raw = JSON.stringify({
      version: 1,
      products: [milk(), { id: 'bad', name: 'Nope', category: 'Snacks' }],
      usageHistory: [{ id: 'nope' }, { ...usageSkeleton(), productName: 'Rice' }],
    })

    const parsed = parseStoredState(raw)
    expect(parsed?.products.map((product) => product.id)).toEqual(['milk-1'])
    expect(parsed?.usageHistory.map((record) => record.productName)).toEqual(['Rice'])
  })

  it('round-trips a marked product without changing the saved expiration later', () => {
    const storage = createMemoryStorage()
    const marked = markProductUsed(stateWith([milk('2026-10-18')]), 'milk-1', new Date(2026, 9, 10, 9))
    saveState(storage, marked.state)

    const loaded = loadState(storage, today)
    expect(loaded.source).toBe('stored')
    expect(loaded.state.products).toEqual([])
    expect(loaded.state.usageHistory[0]?.expirationDate).toBe('2026-10-18')

    const edited = updateProduct(loaded.state, 'milk-1', {
      name: 'Whole milk',
      category: 'Dairy',
      expirationDate: '2026-12-01',
      quantity: 1,
      unit: 'L',
      notes: '',
    })
    expect(edited.usageHistory[0]?.expirationDate).toBe('2026-10-18')
    expect(summarizeImpact(edited.usageHistory, today).thisWeek).toBe(1)
  })
})

function usageSkeleton() {
  return {
    id: 'usage-rice',
    productId: 'rice-1',
    expirationDate: '2026-10-12',
    usedAt: '2026-10-10T10:00:00.000Z',
    quantity: null,
    unit: null,
  }
}

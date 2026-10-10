import { describe, expect, it } from 'vitest'
import type { StoredState } from '../types'
import { summarizeImpact } from './impact'
import { deleteProduct, markProductUsed } from './inventory'

const milk = {
  id: 'milk-1',
  name: 'Whole milk',
  category: 'Dairy' as const,
  expirationDate: '2026-10-20',
  quantity: 1,
  unit: 'L',
  notes: '',
  createdAt: '2026-10-01T12:00:00.000Z',
}

function kitchen(): StoredState {
  return { version: 1, products: [milk], usageHistory: [] }
}

describe('marking a product used', () => {
  it('records the product once and keeps the expiration date from that moment', () => {
    const first = markProductUsed(kitchen(), 'milk-1', new Date(2026, 9, 10, 9, 0, 0))
    expect(first.status).toBe('recorded')
    expect(first.counted).toBe(true)
    expect(first.state.products).toEqual([])
    expect(first.state.usageHistory).toHaveLength(1)
    expect(first.state.usageHistory[0]).toMatchObject({
      productId: 'milk-1',
      productName: 'Whole milk',
      expirationDate: '2026-10-20',
      quantity: 1,
      unit: 'L',
    })

    const second = markProductUsed(first.state, 'milk-1', new Date(2026, 9, 11, 9, 0, 0))
    expect(second.status).toBe('duplicate')
    expect(second.state.usageHistory).toHaveLength(1)
    expect(summarizeImpact(second.state.usageHistory, '2026-10-10').thisWeek).toBe(1)
  })

  it('does not count a product used after its expiration date', () => {
    const result = markProductUsed(
      {
        version: 1,
        products: [{ ...milk, expirationDate: '2026-10-09' }],
        usageHistory: [],
      },
      'milk-1',
      new Date(2026, 9, 10, 9, 0, 0),
    )

    expect(result.status).toBe('recorded')
    expect(result.counted).toBe(false)
    expect(summarizeImpact(result.state.usageHistory, '2026-10-10').thisWeek).toBe(0)
  })

  it('leaves usage history alone when another product is deleted', () => {
    const marked = markProductUsed(kitchen(), 'milk-1', new Date(2026, 9, 10, 9))
    const withBread: StoredState = {
      ...marked.state,
      products: [{ ...milk, id: 'bread-1', name: 'Bread', category: 'Bakery' }],
    }

    const deleted = deleteProduct(withBread, 'bread-1')
    expect(deleted.products).toEqual([])
    expect(deleted.usageHistory).toEqual(marked.state.usageHistory)
  })
})

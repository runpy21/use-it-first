import { describe, expect, it } from 'vitest'
import type { Product } from '../types'
import { filterAndSortProducts } from './products'

const today = '2026-10-10'

function product(name: string, expirationDate: string, category: Product['category'] = 'Other'): Product {
  return {
    id: name,
    name,
    category,
    expirationDate,
    quantity: null,
    unit: null,
    notes: '',
    createdAt: '2026-10-01T12:00:00.000Z',
  }
}

const products = [
  product('Baby spinach', '2026-10-09', 'Vegetables'),
  product('Whole milk', '2026-10-10', 'Dairy'),
  product('Sourdough bread', '2026-10-13', 'Bakery'),
  product('Chicken thighs', '2026-10-14', 'Meat & Fish'),
]

describe('product filters', () => {
  it('filters by freshness, category, and name, then sorts by date', () => {
    expect(
      filterAndSortProducts(products, {
        today,
        query: '',
        status: 'today',
        category: 'all',
        direction: 'soonest',
      }).map((item) => item.name),
    ).toEqual(['Whole milk'])

    expect(
      filterAndSortProducts(products, {
        today,
        query: 'spinach',
        status: 'all',
        category: 'Dairy',
        direction: 'soonest',
      }),
    ).toEqual([])

    expect(
      filterAndSortProducts(products, {
        today,
        query: '',
        status: 'all',
        category: 'all',
        direction: 'latest',
      }).map((item) => item.name),
    ).toEqual(['Chicken thighs', 'Sourdough bread', 'Whole milk', 'Baby spinach'])
  })
})

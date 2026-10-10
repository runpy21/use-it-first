import { describe, expect, it } from 'vitest'
import { createDemoState } from '../data/demo'
import { daysRemaining } from './dates'
import { compareByUrgency, freshness } from './expiration'
import type { Product } from '../types'

const today = '2026-10-10'

describe('freshness boundaries', () => {
  it('classifies yesterday, today, three days ahead, and four days ahead', () => {
    expect(freshness('2026-10-09', today)).toBe('expired')
    expect(daysRemaining('2026-10-09', today)).toBe(-1)

    expect(freshness('2026-10-10', today)).toBe('today')
    expect(daysRemaining('2026-10-10', today)).toBe(0)

    expect(freshness('2026-10-11', today)).toBe('soon')
    expect(freshness('2026-10-13', today)).toBe('soon')
    expect(daysRemaining('2026-10-13', today)).toBe(3)

    expect(freshness('2026-10-14', today)).toBe('fresh')
    expect(daysRemaining('2026-10-14', today)).toBe(4)
  })

  it('sorts expired and today ahead of later dates', () => {
    const names = ['Later', 'Today', 'Expired', 'Soon']
    const dates = ['2026-10-20', '2026-10-10', '2026-10-08', '2026-10-12']
    const products: Product[] = names.map((name, index) => ({
      id: name,
      name,
      category: 'Other',
      expirationDate: dates[index],
      quantity: null,
      unit: null,
      notes: '',
      createdAt: '2026-10-01T12:00:00.000Z',
    }))

    expect(products.sort((a, b) => compareByUrgency(a, b, today)).map((item) => item.name)).toEqual([
      'Expired',
      'Today',
      'Soon',
      'Later',
    ])
  })

  it('seeds the demo kitchen on those same boundaries', () => {
    const demo = createDemoState(today)
    const byName = Object.fromEntries(demo.products.map((product) => [product.name, product]))

    expect(freshness(byName['Baby spinach'].expirationDate, today)).toBe('expired')
    expect(freshness(byName['Whole milk'].expirationDate, today)).toBe('today')
    expect(freshness(byName['Sourdough bread'].expirationDate, today)).toBe('soon')
    expect(daysRemaining(byName['Sourdough bread'].expirationDate, today)).toBe(3)
    expect(freshness(byName['Chicken thighs'].expirationDate, today)).toBe('fresh')
    expect(daysRemaining(byName['Chicken thighs'].expirationDate, today)).toBe(4)
  })
})

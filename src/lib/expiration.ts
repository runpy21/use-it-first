import type { Freshness, Product } from '../types'
import { daysRemaining } from './dates'

/**
 * Freshness is only a date status.
 * A past date means "use this first and check it yourself", not "this food is unsafe".
 *
 * - expired: before today
 * - today: the expiration date is today
 * - soon: the next 1, 2, or 3 calendar days
 * - fresh: 4 or more calendar days away
 */
export function freshness(expirationDate: string, today: string): Freshness | null {
  const days = daysRemaining(expirationDate, today)
  if (days === null) return null
  if (days < 0) return 'expired'
  if (days === 0) return 'today'
  if (days <= 3) return 'soon'
  return 'fresh'
}

export function compareByExpiration(a: Product, b: Product, today: string): number {
  const daysA = daysRemaining(a.expirationDate, today)
  const daysB = daysRemaining(b.expirationDate, today)
  if (daysA === null && daysB === null) return a.name.localeCompare(b.name)
  if (daysA === null) return 1
  if (daysB === null) return -1
  if (daysA !== daysB) return daysA - daysB
  return a.name.localeCompare(b.name)
}

const URGENCY_RANK: Record<Freshness, number> = {
  expired: 0,
  today: 1,
  soon: 2,
  fresh: 3,
}

export function compareByUrgency(a: Product, b: Product, today: string): number {
  const statusA = freshness(a.expirationDate, today) ?? 'fresh'
  const statusB = freshness(b.expirationDate, today) ?? 'fresh'
  if (URGENCY_RANK[statusA] !== URGENCY_RANK[statusB]) {
    return URGENCY_RANK[statusA] - URGENCY_RANK[statusB]
  }
  return compareByExpiration(a, b, today)
}

export type FreshnessCounts = Record<Freshness | 'total', number>

export function countByFreshness(products: Product[], today: string): FreshnessCounts {
  const counts: FreshnessCounts = {
    expired: 0,
    today: 0,
    soon: 0,
    fresh: 0,
    total: products.length,
  }

  for (const product of products) {
    const status = freshness(product.expirationDate, today)
    if (status) counts[status] += 1
  }

  return counts
}

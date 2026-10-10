import type { Category, Product, StatusFilter } from '../types'
import { compareByExpiration, freshness } from './expiration'

export function filterAndSortProducts(
  products: Product[],
  options: {
    today: string
    query: string
    status: StatusFilter
    category: Category | 'all'
    direction: 'soonest' | 'latest'
  },
): Product[] {
  const query = options.query.trim().toLowerCase()

  const filtered = products.filter((product) => {
    if (query && !product.name.toLowerCase().includes(query)) return false
    if (options.category !== 'all' && product.category !== options.category) return false
    if (options.status !== 'all') {
      if (freshness(product.expirationDate, options.today) !== options.status) return false
    }
    return true
  })

  return filtered.sort((a, b) => {
    const compared = compareByExpiration(a, b, options.today)
    if (compared === 0) return 0
    return options.direction === 'soonest' ? compared : -compared
  })
}

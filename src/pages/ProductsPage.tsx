import { useMemo, useState } from 'react'
import { Search } from 'lucide-react'
import { AddButton, PageIntro } from '../components/PageIntro'
import { Button } from '../components/Button'
import { EmptyState } from '../components/EmptyState'
import { ProductRow } from '../components/ProductRow'
import { useInventory } from '../hooks/useInventory'
import { controlClass } from '../lib/form'
import { filterAndSortProducts } from '../lib/products'
import { cx } from '../lib/cx'
import { CATEGORIES, type Category, type Product, type StatusFilter } from '../types'

const FILTERS: Array<{ id: StatusFilter; label: string }> = [
  { id: 'all', label: 'All' },
  { id: 'today', label: 'Use today' },
  { id: 'soon', label: 'Expiring soon' },
  { id: 'expired', label: 'Expired' },
]

export function ProductsPage({
  onAdd,
  onEdit,
  onDelete,
  onUse,
}: {
  onAdd: () => void
  onEdit: (product: Product) => void
  onDelete: (product: Product) => void
  onUse: (product: Product) => void
}) {
  const { today, products } = useInventory()
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState<StatusFilter>('all')
  const [category, setCategory] = useState<Category | 'all'>('all')
  const [direction, setDirection] = useState<'soonest' | 'latest'>('soonest')

  const visible = useMemo(
    () => filterAndSortProducts(products, { today, query, status, category, direction }),
    [products, today, query, status, category, direction],
  )

  const empty = emptyCopy(products.length, query, status, category)

  return (
    <div>
      <PageIntro
        title="My Products"
        action={<AddButton onClick={onAdd} />}
      >
        <p>Search, filter, and update what is already in your kitchen.</p>
        <p className="mt-2 text-sm text-ink-soft">
          A past date means use it first and check it yourself. This app does not decide whether food is safe.
        </p>
      </PageIntro>

      <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_14rem_auto] sm:items-end">
        <div>
          <label htmlFor="product-search" className="mb-1 block text-sm font-semibold">
            Search by name
          </label>
          <div className="relative">
            <Search aria-hidden="true" size={16} className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-ink-soft" />
            <input
              id="product-search"
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Spinach, milk, bread"
              className={cx(controlClass, 'pl-9')}
            />
          </div>
        </div>
        <div>
          <label htmlFor="category-filter" className="mb-1 block text-sm font-semibold">
            Category
          </label>
          <select
            id="category-filter"
            className={controlClass}
            value={category}
            onChange={(event) => setCategory(event.target.value as Category | 'all')}
          >
            <option value="all">All categories</option>
            {CATEGORIES.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>
        <Button
          variant="secondary"
          aria-pressed={direction === 'latest'}
          onClick={() => setDirection((current) => (current === 'soonest' ? 'latest' : 'soonest'))}
        >
          Sort: {direction === 'soonest' ? 'soonest first' : 'latest first'}
        </Button>
      </div>

      <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label="Freshness">
        {FILTERS.map((filter) => {
          const selected = status === filter.id
          return (
            <button
              key={filter.id}
              type="button"
              aria-pressed={selected}
              onClick={() => setStatus(filter.id)}
              className={cx(
                'rounded-full px-3 py-1.5 text-sm font-semibold',
                selected ? 'bg-forest text-ivory' : 'bg-sage text-forest hover:bg-sage-deep',
              )}
            >
              {filter.label}
            </button>
          )
        })}
      </div>

      {visible.length === 0 ? (
        <div className="mt-6">
          <EmptyState
            title={empty.title}
            body={empty.body}
            action={products.length === 0 ? <AddButton onClick={onAdd} /> : undefined}
          />
        </div>
      ) : (
        <ul className="mt-4">
          {visible.map((product) => (
            <ProductRow
              key={product.id}
              product={product}
              today={today}
              actions={
                <>
                  <Button variant="secondary" onClick={() => onUse(product)}>
                    Mark used
                  </Button>
                  <Button variant="ghost" onClick={() => onEdit(product)}>
                    Edit
                  </Button>
                  <Button variant="ghost" onClick={() => onDelete(product)}>
                    Remove
                  </Button>
                </>
              }
            />
          ))}
        </ul>
      )}
    </div>
  )
}

function emptyCopy(
  total: number,
  query: string,
  status: StatusFilter,
  category: Category | 'all',
): { title: string; body: string } {
  if (total === 0) {
    return {
      title: 'Your kitchen is empty',
      body: 'Add the first product you want to finish before its date.',
    }
  }
  if (query.trim() && (status !== 'all' || category !== 'all')) {
    return {
      title: 'Nothing matches these filters',
      body: 'Try a different name, category, or freshness filter.',
    }
  }
  if (query.trim()) {
    return {
      title: 'No matching names',
      body: `Nothing in your kitchen matches “${query.trim()}”.`,
    }
  }
  if (status === 'today') {
    return {
      title: 'Nothing expires today',
      body: 'No product has today’s date. Expiring soon covers the next three days.',
    }
  }
  if (status === 'soon') {
    return {
      title: 'Nothing expiring soon',
      body: 'No dates fall in the next three days.',
    }
  }
  if (status === 'expired') {
    return {
      title: 'No past dates',
      body: 'Nothing on your list is before today.',
    }
  }
  if (category !== 'all') {
    return {
      title: `No ${category.toLowerCase()}`,
      body: 'Nothing in this category is on your list right now.',
    }
  }
  return { title: 'Nothing to show', body: 'Try clearing the filters.' }
}

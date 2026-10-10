import type { ReactNode } from 'react'
import { CATEGORY_EMOJI } from '../data/categories'
import { daysRemaining } from '../lib/dates'
import { freshness } from '../lib/expiration'
import { daysLabel, formatCalendarDate, formatQuantity } from '../lib/format'
import type { Product } from '../types'
import { StatusBadge, StatusBar } from './StatusBadge'

export function ProductRow({
  product,
  today,
  actions,
}: {
  product: Product
  today: string
  actions?: ReactNode
}) {
  const status = freshness(product.expirationDate, today)
  const days = daysRemaining(product.expirationDate, today)
  const quantity = formatQuantity(product.quantity, product.unit)

  return (
    <li className="flex gap-4 border-b border-line py-4 last:border-b-0">
      <StatusBar status={status} />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2">
            <span className="text-xl" aria-hidden="true">
              {CATEGORY_EMOJI[product.category]}
            </span>
            <h3 className="truncate text-xl text-ink">{product.name}</h3>
          </div>
          {status ? <StatusBadge status={status} /> : null}
        </div>
        <p className="mt-1 text-sm text-ink-soft">
          {product.category}
          {quantity ? ` · ${quantity}` : ''}
        </p>
        <p className="mt-1 text-sm">
          <time dateTime={product.expirationDate}>{formatCalendarDate(product.expirationDate)}</time>
          {days !== null ? <span className="text-ink-soft"> · {daysLabel(days)}</span> : null}
        </p>
        {product.notes ? <p className="mt-1 text-sm text-ink-soft">{product.notes}</p> : null}
        {actions ? <div className="mt-3 flex flex-wrap gap-2">{actions}</div> : null}
      </div>
    </li>
  )
}

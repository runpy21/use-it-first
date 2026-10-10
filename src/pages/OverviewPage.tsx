import { Plus } from 'lucide-react'
import { Button, ButtonLink } from '../components/Button'
import { EmptyState } from '../components/EmptyState'
import { ImpactPanel } from '../components/ImpactPanel'
import { ProductRow } from '../components/ProductRow'
import { useInventory } from '../hooks/useInventory'
import { compareByUrgency, countByFreshness, freshness } from '../lib/expiration'
import { greeting } from '../lib/format'
import { recentActivity, summarizeImpact } from '../lib/impact'
import type { Product } from '../types'

function attentionSentence(total: number, attention: number): string {
  if (total === 0) return 'Your kitchen list is empty.'
  if (attention === 0) return 'Nothing needs attention today.'
  if (attention === 1) return '1 product needs attention today.'
  return `${attention} products need attention today.`
}

export function OverviewPage({
  onAdd,
  onUse,
}: {
  onAdd: () => void
  onUse: (product: Product) => void
}) {
  const { today, now, products, usageHistory } = useInventory()
  const counts = countByFreshness(products, today)
  const attention = counts.expired + counts.today
  const impact = summarizeImpact(usageHistory, today)
  const activity = recentActivity(usageHistory, today)
  const urgent = products
    .filter((product) => {
      const status = freshness(product.expirationDate, today)
      return status === 'expired' || status === 'today' || status === 'soon'
    })
    .sort((a, b) => compareByUrgency(a, b, today))

  return (
    <div className="space-y-8">
      <section className="rounded-3xl bg-forest px-6 py-8 text-ivory sm:px-10 sm:py-12">
        <p className="text-sm font-semibold text-sage">Less waste, more taste.</p>
        <h1 className="mt-3 max-w-xl text-4xl sm:text-5xl">{greeting(now)}</h1>
        <p className="mt-3 max-w-lg text-lg">{attentionSentence(products.length, attention)}</p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Button variant="inverse" onClick={onAdd}>
            <Plus aria-hidden="true" size={16} />
            Add a product
          </Button>
          <ButtonLink href="#/recipes" variant="inverse-ghost">
            Find a recipe
          </ButtonLink>
        </div>
      </section>

      <section aria-label="Kitchen summary" className="grid grid-cols-2 overflow-hidden rounded-2xl border border-line lg:grid-cols-4">
        <Stat label="In the kitchen" value={counts.total} detail="Products on your list" className="bg-sage" />
        <Stat
          label="Need attention today"
          value={attention}
          detail="Expired, or the date is today"
          className="bg-sage"
        />
        <Stat
          label="Expiring soon"
          value={counts.soon}
          detail="Dates in the next 3 days"
          className="bg-sage"
        />
        <Stat
          label="Used in time"
          value={impact.thisWeek}
          detail="This week, before the date"
          className="bg-lavender"
        />
      </section>

      <div className="grid items-start gap-8 lg:grid-cols-5">
        <section className="lg:col-span-3">
          <h2 className="text-3xl text-forest">Use these first</h2>
          <p className="mt-2 max-w-xl text-sm text-ink-soft">
            A past date means use it first and check it yourself. This app does not decide whether food is safe.
          </p>
          {products.length === 0 ? (
            <div className="mt-5">
              <EmptyState
                title="Add your first product"
                body="Start with something that expires soon. The demo kitchen is available from the menu if you want a filled-in example."
                action={
                  <Button onClick={onAdd}>
                    <Plus aria-hidden="true" size={16} />
                    Add a product
                  </Button>
                }
              />
            </div>
          ) : urgent.length === 0 ? (
            <p className="mt-5 text-ink">
              Nothing needs to be used first. The next dates are still more than three days away.{' '}
              <a className="font-semibold text-forest underline-offset-2 hover:underline" href="#/products">
                See all products
              </a>
            </p>
          ) : (
            <ul className="mt-2">
              {urgent.map((product) => (
                <ProductRow
                  key={product.id}
                  product={product}
                  today={today}
                  actions={
                    <Button variant="secondary" onClick={() => onUse(product)}>
                      Mark used
                    </Button>
                  }
                />
              ))}
            </ul>
          )}
        </section>

        <div className="lg:col-span-2">
          <ImpactPanel summary={impact} recent={activity} compact />
        </div>
      </div>

      {products.length > 0 ? (
        <p className="text-sm text-ink-soft">
          {counts.fresh === 1
            ? '1 product still has a date more than three days away.'
            : `${counts.fresh} products still have a date more than three days away.`}
        </p>
      ) : null}
    </div>
  )
}

function Stat({
  label,
  value,
  detail,
  className,
}: {
  label: string
  value: number
  detail: string
  className: string
}) {
  return (
    <div className={`border-line px-4 py-5 sm:px-5 ${className} border-b border-r`}>
      <p className="text-sm font-semibold text-forest">{label}</p>
      <p className="mt-2 font-display text-4xl text-ink">{value}</p>
      <p className="mt-1 text-sm text-ink">{detail}</p>
    </div>
  )
}

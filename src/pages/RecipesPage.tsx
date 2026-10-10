import { useEffect, useMemo, useState } from 'react'
import { ChevronLeft } from 'lucide-react'
import { RECIPES } from '../data/recipes'
import { PageIntro } from '../components/PageIntro'
import { StatusBadge } from '../components/StatusBadge'
import { useInventory } from '../hooks/useInventory'
import { plural } from '../lib/format'
import { rankRecipes, type RecipeMatch } from '../lib/recipes'
import { cx } from '../lib/cx'

export function RecipesPage() {
  const { today, products } = useInventory()
  const ranked = useMemo(() => rankRecipes(RECIPES, products, today), [products, today])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [showDetail, setShowDetail] = useState(false)
  const selected = ranked.find((match) => match.recipe.id === selectedId) ?? ranked[0]

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0 })
  }, [showDetail, selectedId])

  return (
    <div>
      <div className={cx(showDetail && 'max-lg:hidden')}>
        <PageIntro title="Recipes">
          <p>These are prepared recipes, matched to your kitchen. Nothing here is generated.</p>
        </PageIntro>
      </div>

      <div className="lg:grid lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-8">
        <ul className={cx('space-y-3', showDetail && 'hidden lg:block')}>
          {ranked.map((match) => {
            const active = selected?.recipe.id === match.recipe.id
            return (
              <li key={match.recipe.id}>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedId(match.recipe.id)
                    setShowDetail(true)
                  }}
                  aria-current={active ? 'true' : undefined}
                  className={cx(
                    'w-full rounded-2xl border px-4 py-4 text-left',
                    active ? 'border-forest bg-sage' : 'border-line bg-paper hover:border-forest/40',
                  )}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-3xl" aria-hidden="true">
                      {match.recipe.emoji}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block font-display text-xl text-ink">{match.recipe.name}</span>
                      <span className="mt-1 block text-sm text-ink-soft">
                        {match.recipe.minutes} min · {match.recipe.difficulty} ·{' '}
                        {match.availableCount} of {match.ingredients.length} in your kitchen
                      </span>
                      <span className="mt-3 block h-1.5 overflow-hidden rounded-full bg-ivory-deep">
                        <span
                          className="block h-full rounded-full bg-forest"
                          style={{ width: `${match.matchPercent}%` }}
                        />
                      </span>
                      <span className="mt-2 flex flex-wrap gap-2">
                        {match.usesAttention ? (
                          <span className="rounded-full bg-clay px-2 py-0.5 text-xs font-semibold text-ivory">
                            Uses food that needs attention
                          </span>
                        ) : null}
                        {match.usesSoon ? (
                          <span className="rounded-full bg-lavender-deep px-2 py-0.5 text-xs font-semibold text-ivory">
                            Uses food expiring soon
                          </span>
                        ) : null}
                      </span>
                    </span>
                    <span className="shrink-0 text-sm font-semibold text-forest">{match.matchPercent}%</span>
                  </div>
                </button>
              </li>
            )
          })}
        </ul>

        <div className={cx(showDetail ? 'block' : 'hidden lg:block')}>
          {selected ? (
            <RecipeDetail match={selected} onBack={() => setShowDetail(false)} />
          ) : (
            <p>No recipes to show.</p>
          )}
        </div>
      </div>
    </div>
  )
}

function RecipeDetail({ match, onBack }: { match: RecipeMatch; onBack: () => void }) {
  const { recipe } = match

  return (
    <article className="rounded-3xl bg-paper px-5 py-4 sm:px-7 sm:py-6">
      <div className="sticky top-0 z-20 -mx-5 mb-4 border-b border-line bg-paper px-5 py-3 lg:hidden">
        <button
          type="button"
          className="inline-flex min-h-11 w-full items-center gap-2 rounded-xl bg-sage px-3 text-sm font-semibold text-forest"
          onClick={onBack}
        >
          <ChevronLeft aria-hidden="true" size={18} />
          All recipes
        </button>
      </div>
      <p className="text-4xl" aria-hidden="true">
        {recipe.emoji}
      </p>
      <h2 className="mt-2 text-3xl text-forest">{recipe.name}</h2>
      <p className="mt-2 text-ink">{recipe.description}</p>
      <p className="mt-3 text-sm font-semibold text-ink-soft">
        {recipe.minutes} min · {recipe.difficulty} · {match.matchPercent}% matched ·{' '}
        {plural(match.missingCount, 'ingredient')} missing
      </p>
      <div
        className="mt-4 h-2 overflow-hidden rounded-full bg-ivory-deep"
        role="meter"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={match.matchPercent}
        aria-label={`${match.matchPercent} percent of ingredients are in your kitchen`}
      >
        <div className="h-full rounded-full bg-forest" style={{ width: `${match.matchPercent}%` }} />
      </div>

      <h3 className="mt-6 text-xl">Ingredients</h3>
      <ul className="mt-3 space-y-3">
        {match.ingredients.map((item) => (
          <li key={item.ingredient} className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="font-semibold">{item.ingredient}</p>
              <p className="text-sm text-ink-soft">
                {item.available ? `In your kitchen: ${item.productName}` : 'Not in your kitchen'}
              </p>
            </div>
            {item.freshness ? <StatusBadge status={item.freshness} /> : null}
          </li>
        ))}
      </ul>

      <h3 className="mt-6 text-xl">Steps</h3>
      <ol className="mt-3 list-decimal space-y-2 pl-5">
        {recipe.steps.map((step) => (
          <li key={step}>{step}</li>
        ))}
      </ol>
    </article>
  )
}

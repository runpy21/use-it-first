import { useEffect, useState } from 'react'
import {
  CalendarDays,
  CookingPot,
  LayoutDashboard,
  Leaf,
  Menu,
  Refrigerator,
  Sprout,
} from 'lucide-react'
import { ConfirmDialog } from './ConfirmDialog'
import { ProductFormDialog } from './ProductForm'
import { useInventory } from '../hooks/useInventory'
import { formatCalendarDate, formatLongDate } from '../lib/format'
import { cx } from '../lib/cx'
import { PAGES, type Page, type Product } from '../types'
import { OverviewPage } from '../pages/OverviewPage'
import { ProductsPage } from '../pages/ProductsPage'
import { RecipesPage } from '../pages/RecipesPage'
import { ImpactPage } from '../pages/ImpactPage'

const NAV: Array<{ page: Page; label: string; icon: typeof Leaf }> = [
  { page: 'overview', label: 'Overview', icon: LayoutDashboard },
  { page: 'products', label: 'My Products', icon: Refrigerator },
  { page: 'recipes', label: 'Recipes', icon: CookingPot },
  { page: 'impact', label: 'Weekly Impact', icon: Sprout },
]

function readPage(): Page {
  const value = window.location.hash.replace(/^#\/?/, '')
  return (PAGES as readonly string[]).includes(value) ? (value as Page) : 'overview'
}

type DialogState =
  | { type: 'add' }
  | { type: 'edit'; product: Product }
  | { type: 'delete'; product: Product }
  | { type: 'use'; product: Product }
  | { type: 'clear' }
  | { type: 'restore' }
  | null

export function AppShell() {
  const inventory = useInventory()
  const [page, setPage] = useState<Page>(readPage)
  const [menuOpen, setMenuOpen] = useState(false)
  const [dialog, setDialog] = useState<DialogState>(null)

  useEffect(() => {
    const onHash = () => {
      setPage(readPage())
      setMenuOpen(false)
    }
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  useEffect(() => {
    const titles: Record<Page, string> = {
      overview: 'Overview',
      products: 'My Products',
      recipes: 'Recipes',
      impact: 'Weekly Impact',
    }
    document.title = `${titles[page]} · Use It First`
  }, [page])

  const openAdd = () => setDialog({ type: 'add' })

  return (
    <div className="min-h-svh lg:grid lg:grid-cols-[17rem_minmax(0,1fr)]">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-paper focus:px-3 focus:py-2"
      >
        Skip to content
      </a>

      {menuOpen ? (
        <button
          type="button"
          className="fixed inset-0 z-30 bg-ink/40 lg:hidden"
          aria-label="Close menu"
          onClick={() => setMenuOpen(false)}
        />
      ) : null}

      <aside
        id="app-nav"
        className={cx(
          'nav-surface fixed inset-y-0 left-0 z-40 flex w-72 flex-col bg-forest text-ivory lg:static lg:w-auto lg:translate-x-0',
          menuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
        )}
      >
        <div className="flex items-center gap-3 px-5 py-6">
          <span className="flex size-11 items-center justify-center rounded-full bg-sage text-forest">
            <Leaf aria-hidden="true" size={22} />
          </span>
          <div>
            <p className="font-display text-xl leading-none">Use It First</p>
            <p className="mt-1 text-sm text-sage">Less waste, more taste.</p>
          </div>
        </div>

        <nav className="flex flex-1 flex-col gap-1 px-3" aria-label="Primary">
          {NAV.map((item) => {
            const Icon = item.icon
            const current = page === item.page
            return (
              <a
                key={item.page}
                href={`#/${item.page}`}
                aria-current={current ? 'page' : undefined}
                className={cx(
                  'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold',
                  current ? 'bg-sage text-forest' : 'text-ivory hover:bg-white/10',
                )}
              >
                <Icon aria-hidden="true" size={18} />
                {item.label}
              </a>
            )
          })}
        </nav>

        <div className="space-y-3 px-5 py-5 text-sm">
          <p className="text-sage">Saved in this browser only. It does not sync to other devices.</p>
          <div className="flex flex-col items-start gap-2">
            <button type="button" className="underline-offset-2 hover:underline" onClick={() => setDialog({ type: 'restore' })}>
              Restore demo kitchen
            </button>
            <button type="button" className="underline-offset-2 hover:underline" onClick={() => setDialog({ type: 'clear' })}>
              Clear saved data
            </button>
          </div>
        </div>
      </aside>

      <div className="min-w-0">
        <header className="flex items-center justify-between gap-4 border-b border-line px-4 py-3 sm:px-8">
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="rounded-lg p-2 hover:bg-sage lg:hidden"
              aria-expanded={menuOpen}
              aria-controls="app-nav"
              onClick={() => setMenuOpen(true)}
            >
              <Menu aria-hidden="true" size={20} />
              <span className="sr-only">Open menu</span>
            </button>
            <p className="text-sm font-semibold text-ink-soft">{NAV.find((item) => item.page === page)?.label}</p>
          </div>
          <p className="flex items-center gap-2 text-sm text-ink-soft">
            <CalendarDays aria-hidden="true" size={16} />
            <span>{formatLongDate(inventory.today)}</span>
          </p>
        </header>

        <main id="main" className="px-4 py-6 sm:px-8 sm:py-8">
          {inventory.loadIssue ? <LoadBanner issue={inventory.loadIssue} /> : null}
          <div className="mx-auto max-w-6xl">
            {page === 'overview' ? <OverviewPage onAdd={openAdd} onUse={(product) => setDialog({ type: 'use', product })} /> : null}
            {page === 'products' ? (
              <ProductsPage
                onAdd={openAdd}
                onEdit={(product) => setDialog({ type: 'edit', product })}
                onDelete={(product) => setDialog({ type: 'delete', product })}
                onUse={(product) => setDialog({ type: 'use', product })}
              />
            ) : null}
            {page === 'recipes' ? <RecipesPage /> : null}
            {page === 'impact' ? <ImpactPage /> : null}
          </div>
        </main>
      </div>

      {inventory.toast ? (
        <div className="pointer-events-none fixed inset-x-0 bottom-4 z-50 flex justify-center px-4" aria-live="polite">
          <p className="rounded-full bg-ink px-4 py-2 text-sm text-ivory shadow-soft">{inventory.toast.message}</p>
        </div>
      ) : null}

      {dialog?.type === 'add' ? (
        <ProductFormDialog product={null} onCancel={() => setDialog(null)} onSubmit={(draft) => {
          inventory.addProduct(draft)
          setDialog(null)
        }} />
      ) : null}
      {dialog?.type === 'edit' ? (
        <ProductFormDialog
          key={dialog.product.id}
          product={dialog.product}
          onCancel={() => setDialog(null)}
          onSubmit={(draft) => {
            inventory.updateProduct(dialog.product.id, draft)
            setDialog(null)
          }}
        />
      ) : null}
      {dialog?.type === 'delete' ? (
        <ConfirmDialog
          title={`Remove ${dialog.product.name}?`}
          body="This takes it off your list. It will not be recorded as used, so Weekly Impact will not change."
          confirmLabel="Remove product"
          tone="danger"
          onCancel={() => setDialog(null)}
          onConfirm={() => {
            inventory.deleteProduct(dialog.product.id)
            setDialog(null)
          }}
        />
      ) : null}
      {dialog?.type === 'use' ? (
        <ConfirmDialog
          title={`Mark ${dialog.product.name} as used?`}
          body={`It leaves your kitchen and is recorded once. If today is on or before ${formatCalendarDate(dialog.product.expirationDate)}, it counts as used before expiration.`}
          confirmLabel="Mark as used"
          onCancel={() => setDialog(null)}
          onConfirm={() => {
            inventory.markUsed(dialog.product.id)
            setDialog(null)
          }}
        />
      ) : null}
      {dialog?.type === 'clear' ? (
        <ConfirmDialog
          title="Clear all saved data?"
          body="This removes your products and your usage history from this browser. You can restore the demo kitchen afterward."
          confirmLabel="Clear data"
          tone="danger"
          onCancel={() => setDialog(null)}
          onConfirm={() => {
            inventory.clearAll()
            setDialog(null)
          }}
        />
      ) : null}
      {dialog?.type === 'restore' ? (
        <ConfirmDialog
          title="Restore the demo kitchen?"
          body="This replaces your current products and usage history with the sample kitchen."
          confirmLabel="Restore demo"
          onCancel={() => setDialog(null)}
          onConfirm={() => {
            inventory.restoreDemo()
            setDialog(null)
          }}
        />
      ) : null}
    </div>
  )
}

function LoadBanner({ issue }: { issue: 'invalid' | 'unavailable' }) {
  const message =
    issue === 'invalid'
      ? 'Saved data in this browser could not be read, so you are seeing an empty kitchen. The old value was left untouched until you add, clear, or restore data.'
      : 'This browser is not keeping saved data. Changes will disappear when you refresh.'

  return (
    <div className="mx-auto mb-6 max-w-6xl rounded-xl bg-lavender px-4 py-3 text-sm text-ink" role="status">
      {message}
    </div>
  )
}

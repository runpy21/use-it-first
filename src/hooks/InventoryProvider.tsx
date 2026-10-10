import { useEffect, useRef, useState, type ReactNode } from 'react'
import { createDemoState } from '../data/demo'
import { todayString } from '../lib/dates'
import {
  addProduct as addProductToState,
  deleteProduct as deleteProductFromState,
  markProductUsed,
  updateProduct as updateProductInState,
} from '../lib/inventory'
import {
  createMemoryStorage,
  emptyState,
  loadState,
  saveState,
  type KeyValueStorage,
} from '../lib/storage'
import type { ProductDraft, StoredState } from '../types'
import { InventoryContext, type ToastMessage } from './inventory-context'

function openStorage(): { storage: KeyValueStorage; persistent: boolean } {
  try {
    const probe = '__use_it_first_probe__'
    localStorage.setItem(probe, '1')
    localStorage.removeItem(probe)
    return { storage: localStorage, persistent: true }
  } catch {
    return { storage: createMemoryStorage(), persistent: false }
  }
}

export function InventoryProvider({ children }: { children: ReactNode }) {
  const [boot] = useState(() => {
    const opened = openStorage()
    return { ...opened, loaded: loadState(opened.storage, todayString()) }
  })
  const [state, setState] = useState<StoredState>(boot.loaded.state)
  const [now, setNow] = useState(() => new Date())
  const [loadIssue, setLoadIssue] = useState<'invalid' | 'unavailable' | null>(
    boot.persistent ? (boot.loaded.source === 'invalid' ? 'invalid' : null) : 'unavailable',
  )
  const [toast, setToast] = useState<ToastMessage | null>(null)
  const toastId = useRef(0)

  useEffect(() => {
    const refresh = () => setNow(new Date())
    window.addEventListener('focus', refresh)
    document.addEventListener('visibilitychange', refresh)
    return () => {
      window.removeEventListener('focus', refresh)
      document.removeEventListener('visibilitychange', refresh)
    }
  }, [])

  useEffect(() => {
    if (!toast) return
    const timeout = window.setTimeout(() => setToast(null), 4500)
    return () => window.clearTimeout(timeout)
  }, [toast])

  const today = todayString(now)

  const notify = (message: string) => {
    toastId.current += 1
    setToast({ id: toastId.current, message })
  }

  const commit = (next: StoredState) => {
    setState(next)
    try {
      saveState(boot.storage, next)
      setLoadIssue(boot.persistent ? null : 'unavailable')
    } catch {
      setLoadIssue('unavailable')
    }
  }

  const addProduct = (draft: ProductDraft) => {
    commit(addProductToState(state, draft, new Date()))
    notify(`Added ${draft.name}.`)
  }

  const updateProduct = (id: string, draft: ProductDraft) => {
    commit(updateProductInState(state, id, draft))
    notify(`Updated ${draft.name}.`)
  }

  const deleteProduct = (id: string) => {
    const name = state.products.find((product) => product.id === id)?.name ?? 'Product'
    commit(deleteProductFromState(state, id))
    notify(`Removed ${name}.`)
  }

  const markUsed = (id: string) => {
    const result = markProductUsed(state, id, new Date())
    commit(result.state)
    if (result.status === 'recorded' && result.counted) {
      notify(`Marked ${result.productName} as used. It counts toward this week.`)
    } else if (result.status === 'recorded') {
      notify(
        `Marked ${result.productName} as used. Today is after the expiration date, so it does not count as used in time.`,
      )
    } else if (result.status === 'duplicate') {
      notify(`${result.productName} was already recorded, so it was not counted again.`)
    } else {
      notify('That product is no longer in your kitchen.')
    }
  }

  const clearAll = () => {
    commit(emptyState())
    notify('Cleared saved data in this browser.')
  }

  const restoreDemo = () => {
    commit(createDemoState(todayString()))
    notify('Restored the demo kitchen.')
  }

  return (
    <InventoryContext.Provider
      value={{
        today,
        now,
        products: state.products,
        usageHistory: state.usageHistory,
        loadIssue,
        toast,
        addProduct,
        updateProduct,
        deleteProduct,
        markUsed,
        clearAll,
        restoreDemo,
      }}
    >
      {children}
    </InventoryContext.Provider>
  )
}

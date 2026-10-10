import { createContext } from 'react'
import type { Product, ProductDraft, UsageRecord } from '../types'

export type ToastMessage = {
  id: number
  message: string
}

export type InventoryContextValue = {
  today: string
  now: Date
  products: Product[]
  usageHistory: UsageRecord[]
  loadIssue: 'invalid' | 'unavailable' | null
  toast: ToastMessage | null
  addProduct: (draft: ProductDraft) => void
  updateProduct: (id: string, draft: ProductDraft) => void
  deleteProduct: (id: string) => void
  markUsed: (id: string) => void
  clearAll: () => void
  restoreDemo: () => void
}

export const InventoryContext = createContext<InventoryContextValue | null>(null)

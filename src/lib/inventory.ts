import type { Product, ProductDraft, StoredState, UsageRecord } from '../types'
import { calendarDateFromInstant } from './dates'
import { createId } from './ids'

export type MarkResult = {
  state: StoredState
  status: 'recorded' | 'missing' | 'duplicate'
  productName: string | null
  /** True only when this new record's usage day is on or before its expiration day. */
  counted: boolean
}

export function addProduct(state: StoredState, draft: ProductDraft, now: Date): StoredState {
  const product: Product = {
    id: createId(),
    ...draft,
    createdAt: now.toISOString(),
  }
  return { ...state, products: [product, ...state.products] }
}

export function updateProduct(
  state: StoredState,
  productId: string,
  draft: ProductDraft,
): StoredState {
  if (!state.products.some((product) => product.id === productId)) return state

  return {
    ...state,
    products: state.products.map((product) =>
      product.id === productId ? { ...product, ...draft } : product,
    ),
  }
}

export function deleteProduct(state: StoredState, productId: string): StoredState {
  return {
    ...state,
    products: state.products.filter((product) => product.id !== productId),
  }
}

/**
 * Recording usage removes the product from the kitchen and snapshots the
 * expiration date. The same product id can contribute only one usage record.
 */
export function markProductUsed(state: StoredState, productId: string, now: Date): MarkResult {
  const existing = state.usageHistory.find((record) => record.productId === productId)
  if (existing) {
    return {
      state: deleteProduct(state, productId),
      status: 'duplicate',
      productName: existing.productName,
      counted: false,
    }
  }

  const product = state.products.find((item) => item.id === productId)
  if (!product) {
    return { state, status: 'missing', productName: null, counted: false }
  }

  const record: UsageRecord = {
    id: createId(),
    productId: product.id,
    productName: product.name,
    expirationDate: product.expirationDate,
    usedAt: now.toISOString(),
    quantity: product.quantity,
    unit: product.unit,
  }

  const usedOn = calendarDateFromInstant(record.usedAt)

  return {
    state: {
      ...state,
      products: state.products.filter((item) => item.id !== product.id),
      usageHistory: [record, ...state.usageHistory],
    },
    status: 'recorded',
    productName: product.name,
    counted: usedOn !== null && usedOn <= product.expirationDate,
  }
}

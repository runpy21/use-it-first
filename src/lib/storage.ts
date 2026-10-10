import type { Category, Product, StoredState, UsageRecord } from '../types'
import { createDemoState } from '../data/demo'
import { isCalendarDate } from './dates'
import { isCategory } from './validation'

export const STORAGE_KEY = 'use-it-first.v1'

export interface KeyValueStorage {
  getItem(key: string): string | null
  setItem(key: string, value: string): void
  removeItem(key: string): void
}

export function createMemoryStorage(initial: Record<string, string> = {}): KeyValueStorage {
  const data = { ...initial }
  return {
    getItem(key) {
      return Object.prototype.hasOwnProperty.call(data, key) ? data[key] : null
    },
    setItem(key, value) {
      data[key] = value
    },
    removeItem(key) {
      delete data[key]
    },
  }
}

export function emptyState(): StoredState {
  return { version: 1, products: [], usageHistory: [] }
}

export type LoadResult = {
  state: StoredState
  source: 'stored' | 'seed' | 'invalid'
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function parseQuantity(value: unknown): number | null | undefined {
  if (value === null || value === undefined) return null
  if (typeof value !== 'number' || !Number.isFinite(value) || value <= 0) return undefined
  return value
}

function parseUnit(value: unknown): string | null | undefined {
  if (value === null || value === undefined) return null
  if (typeof value !== 'string') return undefined
  const trimmed = value.trim()
  return trimmed ? trimmed : null
}

function parseProduct(value: unknown): Product | null {
  if (!isRecord(value)) return null
  if (typeof value.id !== 'string' || value.id.trim() === '') return null
  if (typeof value.name !== 'string' || value.name.trim() === '') return null
  if (typeof value.category !== 'string' || !isCategory(value.category)) return null
  if (typeof value.expirationDate !== 'string' || !isCalendarDate(value.expirationDate)) return null

  const quantity = parseQuantity(value.quantity)
  const unit = parseUnit(value.unit)
  if (quantity === undefined || unit === undefined) return null
  if (value.notes !== undefined && typeof value.notes !== 'string') return null

  const createdAt =
    typeof value.createdAt === 'string' && value.createdAt.trim()
      ? value.createdAt
      : new Date(0).toISOString()

  const category: Category = value.category

  return {
    id: value.id,
    name: value.name.trim(),
    category,
    expirationDate: value.expirationDate,
    quantity,
    unit,
    notes: typeof value.notes === 'string' ? value.notes.trim() : '',
    createdAt,
  }
}

function parseUsage(value: unknown): UsageRecord | null {
  if (!isRecord(value)) return null
  if (typeof value.id !== 'string' || value.id.trim() === '') return null
  if (typeof value.productId !== 'string' || value.productId.trim() === '') return null
  if (typeof value.productName !== 'string' || value.productName.trim() === '') return null
  if (typeof value.expirationDate !== 'string' || !isCalendarDate(value.expirationDate)) return null
  if (typeof value.usedAt !== 'string' || Number.isNaN(new Date(value.usedAt).getTime())) return null

  const quantity = parseQuantity(value.quantity)
  const unit = parseUnit(value.unit)
  if (quantity === undefined || unit === undefined) return null

  return {
    id: value.id,
    productId: value.productId,
    productName: value.productName.trim(),
    expirationDate: value.expirationDate,
    usedAt: value.usedAt,
    quantity,
    unit,
  }
}

export function parseStoredState(raw: string): StoredState | null {
  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch {
    return null
  }

  if (!isRecord(parsed)) return null
  if (!Array.isArray(parsed.products) || !Array.isArray(parsed.usageHistory)) return null

  return {
    version: 1,
    products: parsed.products.flatMap((item) => {
      const product = parseProduct(item)
      return product ? [product] : []
    }),
    usageHistory: parsed.usageHistory.flatMap((item) => {
      const record = parseUsage(item)
      return record ? [record] : []
    }),
  }
}

/**
 * Missing data is seeded. Invalid JSON is not overwritten, so a bad save can
 * still be inspected in the browser until the user makes a change.
 */
export function loadState(storage: KeyValueStorage, today: string): LoadResult {
  const raw = storage.getItem(STORAGE_KEY)
  if (raw === null) {
    const state = createDemoState(today)
    storage.setItem(STORAGE_KEY, JSON.stringify(state))
    return { state, source: 'seed' }
  }

  const state = parseStoredState(raw)
  if (!state) {
    return { state: emptyState(), source: 'invalid' }
  }

  return { state, source: 'stored' }
}

export function saveState(storage: KeyValueStorage, state: StoredState): void {
  storage.setItem(STORAGE_KEY, JSON.stringify({ ...state, version: 1 }))
}

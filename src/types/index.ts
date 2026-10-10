export const CATEGORIES = [
  'Vegetables',
  'Fruits',
  'Dairy',
  'Meat & Fish',
  'Bakery',
  'Pantry',
  'Other',
] as const

export type Category = (typeof CATEGORIES)[number]

export const UNITS = [
  'pieces',
  'g',
  'kg',
  'ml',
  'L',
  'bag',
  'loaf',
  'can',
  'bunch',
  'pack',
] as const

export type Unit = (typeof UNITS)[number]

/** Calendar day in the user's local timezone, stored as YYYY-MM-DD. */
export type CalendarDate = string

export type Freshness = 'expired' | 'today' | 'soon' | 'fresh'

export type Product = {
  id: string
  name: string
  category: Category
  expirationDate: CalendarDate
  quantity: number | null
  unit: string | null
  notes: string
  createdAt: string
}

export type ProductDraft = {
  name: string
  category: Category
  expirationDate: CalendarDate
  quantity: number | null
  unit: string | null
  notes: string
}

export type UsageRecord = {
  id: string
  productId: string
  productName: string
  expirationDate: CalendarDate
  usedAt: string
  quantity: number | null
  unit: string | null
}

export type StoredState = {
  version: 1
  products: Product[]
  usageHistory: UsageRecord[]
}

export type Difficulty = 'Easy' | 'Medium'

export type RecipeIngredient = {
  name: string
  /** Lowercase fragments matched against a product name, such as "yogurt". */
  matchTerms: string[]
}

export type Recipe = {
  id: string
  name: string
  description: string
  emoji: string
  minutes: number
  difficulty: Difficulty
  ingredients: RecipeIngredient[]
  steps: string[]
}

export type FieldName = 'name' | 'category' | 'expirationDate' | 'quantity' | 'notes'

export type FieldErrors = Partial<Record<FieldName, string>>

export const PAGES = ['overview', 'products', 'recipes', 'impact'] as const

export type Page = (typeof PAGES)[number]

export type StatusFilter = 'all' | 'today' | 'soon' | 'expired'

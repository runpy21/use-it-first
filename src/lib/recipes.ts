import type { Freshness, Product, Recipe, RecipeIngredient } from '../types'
import { freshness } from './expiration'

const URGENCY_WEIGHT: Record<Freshness, number> = {
  expired: 3,
  today: 2,
  soon: 1,
  fresh: 0,
}

export type IngredientMatch = {
  ingredient: string
  available: boolean
  productId?: string
  productName?: string
  freshness?: Freshness
}

export type RecipeMatch = {
  recipe: Recipe
  ingredients: IngredientMatch[]
  availableCount: number
  missingCount: number
  matchPercent: number
  urgency: number
  usesAttention: boolean
  usesSoon: boolean
}

function productMatches(productName: string, ingredient: RecipeIngredient): boolean {
  const name = productName.toLowerCase()
  return ingredient.matchTerms.some((term) => name.includes(term.toLowerCase()))
}

export function matchRecipe(recipe: Recipe, products: Product[], today: string): RecipeMatch {
  const remaining = [...products]
  const ingredients: IngredientMatch[] = recipe.ingredients.map((ingredient) => {
    const index = remaining.findIndex((product) => productMatches(product.name, ingredient))
    if (index === -1) {
      return { ingredient: ingredient.name, available: false }
    }

    const [product] = remaining.splice(index, 1)
    const status = freshness(product.expirationDate, today) ?? undefined
    return {
      ingredient: ingredient.name,
      available: true,
      productId: product.id,
      productName: product.name,
      freshness: status,
    }
  })

  const availableCount = ingredients.filter((item) => item.available).length
  const missingCount = ingredients.length - availableCount
  const matchPercent =
    ingredients.length === 0 ? 0 : Math.round((availableCount / ingredients.length) * 100)
  const urgency = ingredients.reduce((total, item) => {
    if (!item.freshness) return total
    return total + URGENCY_WEIGHT[item.freshness]
  }, 0)

  return {
    recipe,
    ingredients,
    availableCount,
    missingCount,
    matchPercent,
    urgency,
    usesAttention: ingredients.some(
      (item) => item.freshness === 'expired' || item.freshness === 'today',
    ),
    usesSoon: ingredients.some((item) => item.freshness === 'soon'),
  }
}

/** Urgent ingredients first, then fewer missing ingredients, then a higher match. */
export function rankRecipes(recipes: Recipe[], products: Product[], today: string): RecipeMatch[] {
  return recipes
    .map((recipe) => matchRecipe(recipe, products, today))
    .sort((a, b) => {
      if (b.urgency !== a.urgency) return b.urgency - a.urgency
      if (a.missingCount !== b.missingCount) return a.missingCount - b.missingCount
      if (b.matchPercent !== a.matchPercent) return b.matchPercent - a.matchPercent
      return a.recipe.name.localeCompare(b.recipe.name)
    })
}

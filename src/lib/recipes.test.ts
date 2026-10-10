import { describe, expect, it } from 'vitest'
import { RECIPES } from '../data/recipes'
import { createDemoState } from '../data/demo'
import type { Product, Recipe } from '../types'
import { matchRecipe, rankRecipes } from './recipes'

const today = '2026-10-10'

function product(id: string, name: string, expirationDate: string): Product {
  return {
    id,
    name,
    category: 'Other',
    expirationDate,
    quantity: 1,
    unit: null,
    notes: '',
    createdAt: '2026-10-01T12:00:00.000Z',
  }
}

const lemonChicken = RECIPES.find((recipe) => recipe.id === 'lemon-chicken') as Recipe

describe('recipe matching', () => {
  it('lists available ingredients, missing ingredients, and a match percentage', () => {
    const match = matchRecipe(
      lemonChicken,
      [
        product('chicken', 'Chicken thighs', '2026-10-20'),
        product('carrots', 'Carrots', '2026-10-20'),
      ],
      today,
    )

    expect(match.availableCount).toBe(2)
    expect(match.missingCount).toBe(1)
    expect(match.matchPercent).toBe(67)
    expect(match.ingredients.map((item) => item.ingredient)).toEqual([
      'Chicken',
      'Carrots',
      'Lemon',
    ])
    expect(match.ingredients.find((item) => item.ingredient === 'Lemon')?.available).toBe(false)
  })

  it('does not use one product for two ingredients', () => {
    const recipe: Recipe = {
      id: 'two-milks',
      name: 'Two milks',
      description: '',
      emoji: '🥛',
      minutes: 1,
      difficulty: 'Easy',
      ingredients: [
        { name: 'Milk', matchTerms: ['milk'] },
        { name: 'More milk', matchTerms: ['milk'] },
      ],
      steps: [],
    }

    const match = matchRecipe(recipe, [product('only', 'Whole milk', '2026-10-20')], today)
    expect(match.availableCount).toBe(1)
    expect(match.missingCount).toBe(1)
  })

  it('puts the demo recipe that uses urgent food first', () => {
    const ranked = rankRecipes(RECIPES, createDemoState(today).products, today)
    expect(ranked[0]?.recipe.id).toBe('spinach-omelette')
    expect(ranked[0]?.missingCount).toBe(0)
    expect(ranked[0]?.usesAttention).toBe(true)

    const lemon = ranked.find((match) => match.recipe.id === 'lemon-chicken')
    expect(lemon?.missingCount).toBe(1)
    expect(lemon?.ingredients.find((item) => item.ingredient === 'Lemon')?.available).toBe(false)
  })
})

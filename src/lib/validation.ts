import type { Category, FieldErrors, ProductDraft } from '../types'
import { CATEGORIES } from '../types'
import { isCalendarDate } from './dates'

export type ProductFormInput = {
  name: string
  category: string
  expirationDate: string
  quantity: string
  unit: string
  notes: string
}

const NAME_LIMIT = 80
const NOTES_LIMIT = 280
const QUANTITY_PATTERN = /^(?:\d+|\d*\.\d+)$/

export function validateProduct(
  input: ProductFormInput,
): { ok: true; value: ProductDraft } | { ok: false; errors: FieldErrors } {
  const errors: FieldErrors = {}
  const name = input.name.trim()
  const notes = input.notes.trim()
  const quantityText = input.quantity.trim()

  if (!name) {
    errors.name = 'Enter a product name.'
  } else if (name.length > NAME_LIMIT) {
    errors.name = `Use ${NAME_LIMIT} characters or fewer.`
  }

  if (!isCategory(input.category)) {
    errors.category = 'Choose a category.'
  }

  if (!input.expirationDate.trim()) {
    errors.expirationDate = 'Choose an expiration date.'
  } else if (!isCalendarDate(input.expirationDate)) {
    errors.expirationDate = 'That date is not valid.'
  }

  let quantity: number | null = null
  if (quantityText) {
    if (!QUANTITY_PATTERN.test(quantityText)) {
      errors.quantity = 'Use a number like 2 or 1.5.'
    } else {
      quantity = Number(quantityText)
      if (quantity <= 0) {
        errors.quantity = 'Quantity must be greater than zero.'
      } else if (quantity > 100_000) {
        errors.quantity = 'Use a quantity under 100000.'
      }
    }
  }

  if (notes.length > NOTES_LIMIT) {
    errors.notes = `Use ${NOTES_LIMIT} characters or fewer.`
  }

  if (Object.keys(errors).length > 0 || !isCategory(input.category)) {
    return { ok: false, errors }
  }

  return {
    ok: true,
    value: {
      name,
      category: input.category,
      expirationDate: input.expirationDate,
      quantity,
      unit: input.unit.trim() ? input.unit.trim() : null,
      notes,
    },
  }
}

export function isCategory(value: string): value is Category {
  return (CATEGORIES as readonly string[]).includes(value)
}

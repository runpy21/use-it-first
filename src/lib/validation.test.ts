import { describe, expect, it } from 'vitest'
import { validateProduct } from './validation'

const valid = {
  name: '  Whole milk  ',
  category: 'Dairy',
  expirationDate: '2026-10-20',
  quantity: '1.5',
  unit: 'L',
  notes: ' Keep cold ',
}

describe('product validation', () => {
  it('accepts a trimmed product and an empty quantity', () => {
    const result = validateProduct(valid)
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.value.name).toBe('Whole milk')
      expect(result.value.quantity).toBe(1.5)
      expect(result.value.notes).toBe('Keep cold')
    }

    const noQuantity = validateProduct({ ...valid, quantity: '  ', unit: '' })
    expect(noQuantity.ok).toBe(true)
    if (noQuantity.ok) {
      expect(noQuantity.value.quantity).toBeNull()
      expect(noQuantity.value.unit).toBeNull()
    }
  })

  it('rejects a blank name, an invalid date, and a bad quantity', () => {
    const result = validateProduct({
      ...valid,
      name: '   ',
      expirationDate: '2026-02-31',
      quantity: '-2',
      category: 'Snacks',
    })

    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.errors.name).toMatch(/name/)
      expect(result.errors.expirationDate).toMatch(/not valid/)
      expect(result.errors.quantity).toBeTruthy()
      expect(result.errors.category).toMatch(/category/)
    }
  })

  it('asks for a date when the field is empty', () => {
    const result = validateProduct({ ...valid, expirationDate: '' })
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.errors.expirationDate).toMatch(/Choose/)
  })
})

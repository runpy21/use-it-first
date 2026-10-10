import { useState, type FormEvent } from 'react'
import { CATEGORIES, UNITS, type FieldErrors, type Product, type ProductDraft } from '../types'
import { describedBy, controlClass } from '../lib/form'
import { validateProduct } from '../lib/validation'
import { Button } from './Button'
import { Dialog } from './Dialog'
import { Field } from './Field'

export function ProductFormDialog({
  product,
  onCancel,
  onSubmit,
}: {
  product: Product | null
  onCancel: () => void
  onSubmit: (draft: ProductDraft) => void
}) {
  const [name, setName] = useState(product?.name ?? '')
  const [category, setCategory] = useState(product?.category ?? '')
  const [expirationDate, setExpirationDate] = useState(product?.expirationDate ?? '')
  const [quantity, setQuantity] = useState(product?.quantity === null || !product ? '' : String(product.quantity))
  const [unit, setUnit] = useState(product?.unit ?? '')
  const [notes, setNotes] = useState(product?.notes ?? '')
  const [errors, setErrors] = useState<FieldErrors>({})

  const extraUnit = unit && !(UNITS as readonly string[]).includes(unit) ? [unit] : []
  const editing = product !== null

  const submit = (event: FormEvent) => {
    event.preventDefault()
    const result = validateProduct({ name, category, expirationDate, quantity, unit, notes })
    if (!result.ok) {
      setErrors(result.errors)
      return
    }
    onSubmit(result.value)
  }

  return (
    <Dialog title={editing ? 'Edit product' : 'Add a product'} onClose={onCancel}>
      <form className="grid gap-4" onSubmit={submit} noValidate>
        <Field label="Name" htmlFor="product-name" required error={errors.name}>
          <input
            id="product-name"
            className={controlClass}
            value={name}
            onChange={(event) => setName(event.target.value)}
            autoComplete="off"
            aria-invalid={Boolean(errors.name)}
            aria-describedby={describedBy('product-name', false, Boolean(errors.name))}
          />
        </Field>

        <Field label="Category" htmlFor="product-category" required error={errors.category}>
          <select
            id="product-category"
            className={controlClass}
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            aria-invalid={Boolean(errors.category)}
            aria-describedby={describedBy('product-category', false, Boolean(errors.category))}
          >
            <option value="">Choose a category</option>
            {CATEGORIES.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </Field>

        <Field
          label="Expiration date"
          htmlFor="product-expiration"
          required
          hint="The date on the package. This is a calendar day, not a safety judgment."
          error={errors.expirationDate}
        >
          <input
            id="product-expiration"
            type="date"
            className={controlClass}
            value={expirationDate}
            onChange={(event) => setExpirationDate(event.target.value)}
            aria-invalid={Boolean(errors.expirationDate)}
            aria-describedby={describedBy('product-expiration', true, Boolean(errors.expirationDate))}
          />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Quantity" htmlFor="product-quantity" error={errors.quantity}>
            <input
              id="product-quantity"
              inputMode="decimal"
              className={controlClass}
              value={quantity}
              onChange={(event) => setQuantity(event.target.value)}
              placeholder="Optional"
              aria-invalid={Boolean(errors.quantity)}
              aria-describedby={describedBy('product-quantity', false, Boolean(errors.quantity))}
            />
          </Field>
          <Field label="Unit" htmlFor="product-unit">
            <select
              id="product-unit"
              className={controlClass}
              value={unit}
              onChange={(event) => setUnit(event.target.value)}
            >
              <option value="">No unit</option>
              {extraUnit.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
              {UNITS.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </Field>
        </div>

        <Field label="Notes" htmlFor="product-notes" error={errors.notes}>
          <textarea
            id="product-notes"
            className={controlClass}
            rows={3}
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            placeholder="Optional"
            aria-invalid={Boolean(errors.notes)}
            aria-describedby={describedBy('product-notes', false, Boolean(errors.notes))}
          />
        </Field>

        <div className="flex flex-wrap justify-end gap-2 pt-1">
          <Button variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">{editing ? 'Save changes' : 'Add product'}</Button>
        </div>
      </form>
    </Dialog>
  )
}

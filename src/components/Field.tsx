import type { ReactNode } from 'react'
import { cx } from '../lib/cx'

export function Field({
  label,
  htmlFor,
  required = false,
  hint,
  error,
  children,
}: {
  label: string
  htmlFor: string
  required?: boolean
  hint?: string
  error?: string
  children: ReactNode
}) {
  const errorId = `${htmlFor}-error`
  const hintId = `${htmlFor}-hint`

  return (
    <div>
      <label htmlFor={htmlFor} className="mb-1 block text-sm font-semibold">
        {label}
        {required ? <span className="font-normal text-ink-soft"> (required)</span> : null}
      </label>
      {hint ? (
        <p id={hintId} className="mb-1 text-sm text-ink-soft">
          {hint}
        </p>
      ) : null}
      <div className={cx(error && '[&_input]:border-clay [&_select]:border-clay [&_textarea]:border-clay')}>
        {children}
      </div>
      {error ? (
        <p id={errorId} role="alert" className="mt-1 text-sm font-medium text-clay">
          {error}
        </p>
      ) : null}
    </div>
  )
}

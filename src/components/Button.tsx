import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { cx } from '../lib/cx'

const variants = {
  primary: 'bg-forest text-ivory hover:bg-forest-dark',
  secondary: 'bg-sage text-forest hover:bg-sage-deep',
  ghost: 'bg-transparent text-ink hover:bg-sage',
  danger: 'bg-clay text-ivory hover:bg-clay-dark',
  inverse: 'bg-ivory text-forest hover:bg-paper',
  'inverse-ghost': 'border border-ivory/40 bg-transparent text-ivory hover:bg-white/10',
} as const

export type ButtonVariant = keyof typeof variants

const base =
  'inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50'

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant
}

export function Button({ variant = 'primary', className, type = 'button', ...props }: ButtonProps) {
  return <button type={type} className={cx(base, variants[variant], className)} {...props} />
}

export function ButtonLink({
  href,
  variant = 'primary',
  className,
  children,
}: {
  href: string
  variant?: ButtonVariant
  className?: string
  children: ReactNode
}) {
  return (
    <a href={href} className={cx(base, variants[variant], className)}>
      {children}
    </a>
  )
}

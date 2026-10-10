import type { ReactNode } from 'react'
import { Plus } from 'lucide-react'
import { Button } from './Button'

export function PageIntro({
  title,
  children,
  action,
}: {
  title: string
  children: ReactNode
  action?: ReactNode
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div className="max-w-2xl">
        <h1 className="text-4xl text-forest">{title}</h1>
        <div className="mt-2 max-w-xl text-ink">{children}</div>
      </div>
      {action ? <div className="flex flex-wrap gap-2">{action}</div> : null}
    </div>
  )
}

export function AddButton({ onClick }: { onClick: () => void }) {
  return (
    <Button onClick={onClick}>
      <Plus aria-hidden="true" size={16} />
      Add a product
    </Button>
  )
}

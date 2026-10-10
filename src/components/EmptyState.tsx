import type { ReactNode } from 'react'

export function EmptyState({
  title,
  body,
  action,
}: {
  title: string
  body: string
  action?: ReactNode
}) {
  return (
    <div className="rounded-2xl border border-dashed border-forest/25 bg-sage/70 px-6 py-12 text-center">
      <h2 className="text-2xl text-forest">{title}</h2>
      <p className="mx-auto mt-2 max-w-md text-ink">{body}</p>
      {action ? <div className="mt-5 flex justify-center">{action}</div> : null}
    </div>
  )
}

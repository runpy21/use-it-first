import type { Freshness } from '../types'
import { cx } from '../lib/cx'

const LABEL: Record<Freshness, string> = {
  expired: 'Expired',
  today: 'Use today',
  soon: 'Expiring soon',
  fresh: 'Fresh',
}

const STYLE: Record<Freshness, string> = {
  expired: 'bg-clay text-ivory',
  today: 'bg-forest text-ivory',
  soon: 'bg-lavender-deep text-ivory',
  fresh: 'bg-sage-deep text-forest-dark',
}

const BAR: Record<Freshness, string> = {
  expired: 'bg-clay',
  today: 'bg-forest',
  soon: 'bg-lavender-deep',
  fresh: 'bg-sage-deep',
}

export function StatusBadge({ status }: { status: Freshness }) {
  return (
    <span
      className={cx(
        'inline-flex shrink-0 items-center rounded-full px-2.5 py-1 text-xs font-semibold tracking-wide',
        STYLE[status],
      )}
    >
      {LABEL[status]}
    </span>
  )
}

export function StatusBar({ status }: { status: Freshness | null }) {
  return (
    <span
      className={cx('mt-1 w-1.5 shrink-0 self-stretch rounded-full', status ? BAR[status] : 'bg-line')}
      aria-hidden="true"
    />
  )
}

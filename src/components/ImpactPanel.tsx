import type { ActivityItem, ImpactSummary } from '../lib/impact'
import { activityStatus, comparisonLabel, encouragement, IMPACT_DISCLAIMER } from '../lib/impact'
import { formatCalendarDate, formatQuantity, formatTime, plural } from '../lib/format'
import { ButtonLink } from './Button'

export function ImpactPanel({
  summary,
  recent,
  compact = false,
}: {
  summary: ImpactSummary
  recent: ActivityItem[]
  compact?: boolean
}) {
  const max = Math.max(1, ...summary.byDay.map((day) => day.count))
  const weekLabel = summary.byDay
    .map((day) => `${day.label} ${day.count}`)
    .join(', ')

  return (
    <section className="rounded-2xl bg-lavender px-5 py-6 sm:px-6">
      <p className="text-sm font-semibold tracking-wide text-lavender-deep">Your impact this week</p>
      <p className="mt-3 font-display text-5xl text-ink">{summary.thisWeek}</p>
      <p className="mt-1 text-ink">
        {plural(summary.thisWeek, 'product')} used before expiration
      </p>
      <p className="mt-1 text-sm text-ink">{comparisonLabel(summary.thisWeek, summary.previousWeek)}</p>

      <div
        className="mt-6 flex items-end gap-2"
        role="img"
        aria-label={`Products used in time, Monday to Sunday: ${weekLabel}`}
      >
        {summary.byDay.map((day) => (
          <div key={day.date} className="flex flex-1 flex-col items-center gap-2">
            <span className="text-xs font-semibold text-ink">{day.count}</span>
            <div className="flex h-20 w-full items-end rounded-md bg-white/45">
              <div
                className="w-full rounded-md bg-lavender-deep"
                style={{
                  height: day.count === 0 ? '0px' : `${Math.max(12, (day.count / max) * 80)}px`,
                }}
              />
            </div>
            <span className="text-xs font-semibold text-lavender-deep">{day.label}</span>
          </div>
        ))}
      </div>

      <p className="mt-5 text-lg text-ink">{encouragement(summary.thisWeek)}</p>
      <p className="mt-3 text-sm text-ink">{IMPACT_DISCLAIMER}</p>

      {recent.length > 0 ? (
        <ul className="mt-5 space-y-3 border-t border-lavender-deep/20 pt-4">
          {recent.slice(0, compact ? 3 : recent.length).map((item) => (
            <li key={item.id}>
              <p className="font-semibold">{item.productName}</p>
              <p className="text-sm text-ink">
                Used <time dateTime={item.usedAt}>{formatCalendarDate(item.usedOn)}</time>
                {formatTime(item.usedAt) ? ` at ${formatTime(item.usedAt)}` : ''}
                {formatQuantity(item.quantity, item.unit)
                  ? ` · ${formatQuantity(item.quantity, item.unit)}`
                  : ''}
              </p>
              <p className="text-sm text-ink-soft">
                Expiration date was {formatCalendarDate(item.expirationDate)}. {activityStatus(item)}.
              </p>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-5 text-sm text-ink">When you mark a product as used, it will show up here.</p>
      )}

      {compact ? (
        <div className="mt-5">
          <ButtonLink href="#/impact" variant="secondary">
            Open weekly impact
          </ButtonLink>
        </div>
      ) : null}
    </section>
  )
}

import type { UsageRecord } from '../types'
import {
  addCalendarDays,
  calendarDateFromInstant,
  isWithinRange,
  parseCalendarDate,
  previousWeekRange,
  weekRange,
  type DateRange,
} from './dates'

export const IMPACT_DISCLAIMER =
  'This counts products you marked as used on or before their expiration date. It is not a measure of kilograms of food saved or money saved.'

export type WeekRelation = 'this-week' | 'previous-week' | 'other'

export type DayCount = {
  date: string
  label: string
  count: number
}

export type ImpactSummary = {
  thisWeek: number
  previousWeek: number
  byDay: DayCount[]
}

export type ActivityItem = {
  id: string
  productId: string
  productName: string
  expirationDate: string
  usedAt: string
  usedOn: string
  quantity: number | null
  unit: string | null
  counted: boolean
  week: WeekRelation
}

export function isUsedBeforeExpiration(record: UsageRecord): boolean {
  const usedOn = calendarDateFromInstant(record.usedAt)
  if (!usedOn) return false
  return usedOn <= record.expirationDate
}

/**
 * Keep the earliest record for each product id.
 * Later records cannot add a second count, and cannot rewrite history.
 */
export function dedupeUsage(history: UsageRecord[]): UsageRecord[] {
  const earliest = new Map<string, UsageRecord>()

  for (const record of history) {
    const current = earliest.get(record.productId)
    if (!current || record.usedAt < current.usedAt) {
      earliest.set(record.productId, record)
    }
  }

  return [...earliest.values()]
}

export function weekRelation(usedOn: string, today: string): WeekRelation {
  if (isWithinRange(usedOn, weekRange(today))) return 'this-week'
  if (isWithinRange(usedOn, previousWeekRange(today))) return 'previous-week'
  return 'other'
}

function countInRange(records: UsageRecord[], range: DateRange): number {
  return records.filter((record) => {
    const usedOn = calendarDateFromInstant(record.usedAt)
    return usedOn !== null && isWithinRange(usedOn, range) && isUsedBeforeExpiration(record)
  }).length
}

export function summarizeImpact(history: UsageRecord[], today: string): ImpactSummary {
  const records = dedupeUsage(history)
  const current = weekRange(today)
  const previous = previousWeekRange(today)
  const thisWeekRecords = records.filter((record) => {
    const usedOn = calendarDateFromInstant(record.usedAt)
    return (
      usedOn !== null && isWithinRange(usedOn, current) && isUsedBeforeExpiration(record)
    )
  })

  const byDay = Array.from({ length: 7 }, (_, index) => {
    const date = addCalendarDays(current.start, index)
    const count = thisWeekRecords.filter(
      (record) => calendarDateFromInstant(record.usedAt) === date,
    ).length
    const parsed = parseCalendarDate(date)
    const label = parsed
      ? new Intl.DateTimeFormat('en', { weekday: 'short' }).format(parsed)
      : ''
    return { date, label, count }
  })

  return {
    thisWeek: thisWeekRecords.length,
    previousWeek: countInRange(records, previous),
    byDay,
  }
}

export function recentActivity(history: UsageRecord[], today: string): ActivityItem[] {
  return history
    .map((record) => {
      const usedOn = calendarDateFromInstant(record.usedAt)
      return {
        id: record.id,
        productId: record.productId,
        productName: record.productName,
        expirationDate: record.expirationDate,
        usedAt: record.usedAt,
        usedOn: usedOn ?? '',
        quantity: record.quantity,
        unit: record.unit,
        counted: isUsedBeforeExpiration(record),
        week: usedOn ? weekRelation(usedOn, today) : 'other',
      }
    })
    .sort((a, b) => (a.usedAt < b.usedAt ? 1 : a.usedAt > b.usedAt ? -1 : 0))
}

export function encouragement(count: number): string {
  if (count <= 0) {
    return 'Nothing recorded as used in time yet this week. When you cook something, mark it used.'
  }
  if (count === 1) {
    return 'One product used before its expiration date. That is a real start.'
  }
  if (count < 4) {
    return `${count} products used before their expiration dates. Small habits are showing up.`
  }
  return `${count} products used before their expiration dates this week. Keep going at your own pace.`
}

export function comparisonLabel(current: number, previous: number): string {
  const delta = current - previous
  if (delta === 0) return 'Same number as last week.'
  if (delta === 1) return '1 more than last week.'
  if (delta === -1) return '1 fewer than last week.'
  if (delta > 0) return `${delta} more than last week.`
  return `${Math.abs(delta)} fewer than last week.`
}

export function activityStatus(item: ActivityItem): string {
  if (!item.counted) return 'Not counted — used after the expiration date'
  if (item.week === 'this-week') return 'Counts this week'
  if (item.week === 'previous-week') return 'Counted last week'
  return 'Used in time, outside this week'
}

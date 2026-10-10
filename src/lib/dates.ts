import type { CalendarDate } from '../types'

/**
 * Expiration dates are calendar days, not moments in time.
 *
 * `new Date('2026-10-10')` is parsed as UTC midnight. In time zones behind UTC
 * that instant falls on the previous evening, so a date-only string compared
 * with `toISOString()` can be off by a day. These helpers read and write
 * year/month/day in local time instead.
 */

const CALENDAR_DATE = /^(\d{4})-(\d{2})-(\d{2})$/

export function todayString(now: Date = new Date()): CalendarDate {
  return toCalendarDate(now)
}

export function toCalendarDate(date: Date): CalendarDate {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/** Returns a local midnight Date, or null when the string is not a real calendar day. */
export function parseCalendarDate(value: string): Date | null {
  const match = CALENDAR_DATE.exec(value)
  if (!match) return null

  const year = Number(match[1])
  const month = Number(match[2])
  const day = Number(match[3])
  const date = new Date(year, month - 1, day)

  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null
  }

  return date
}

export function isCalendarDate(value: string): value is CalendarDate {
  return parseCalendarDate(value) !== null
}

export function addCalendarDays(value: CalendarDate, days: number): CalendarDate {
  const date = parseCalendarDate(value)
  if (!date) {
    throw new Error(`Invalid calendar date: ${value}`)
  }
  date.setDate(date.getDate() + days)
  return toCalendarDate(date)
}

export function daysBetween(from: CalendarDate, to: CalendarDate): number | null {
  const start = parseCalendarDate(from)
  const end = parseCalendarDate(to)
  if (!start || !end) return null

  // Round, because a local calendar day can be 23 or 25 hours across daylight saving.
  return Math.round((end.getTime() - start.getTime()) / 86_400_000)
}

export function daysRemaining(expirationDate: string, today: CalendarDate): number | null {
  return daysBetween(today, expirationDate)
}

export type DateRange = {
  start: CalendarDate
  end: CalendarDate
}

/** Monday through Sunday, in the local calendar. */
export function weekRange(today: CalendarDate): DateRange {
  const date = parseCalendarDate(today)
  if (!date) {
    throw new Error(`Invalid calendar date: ${today}`)
  }

  const weekday = date.getDay()
  const daysFromMonday = weekday === 0 ? 6 : weekday - 1
  const start = addCalendarDays(today, -daysFromMonday)
  return { start, end: addCalendarDays(start, 6) }
}

export function previousWeekRange(today: CalendarDate): DateRange {
  const current = weekRange(today)
  return {
    start: addCalendarDays(current.start, -7),
    end: addCalendarDays(current.start, -1),
  }
}

export function isWithinRange(value: CalendarDate, range: DateRange): boolean {
  return value >= range.start && value <= range.end
}

/** Local calendar day of an instant. This does not use the UTC date prefix. */
export function calendarDateFromInstant(iso: string): CalendarDate | null {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return null
  return toCalendarDate(date)
}

export function calendarDateToNoonIso(value: CalendarDate): string {
  const date = parseCalendarDate(value)
  if (!date) {
    throw new Error(`Invalid calendar date: ${value}`)
  }
  date.setHours(12, 0, 0, 0)
  return date.toISOString()
}

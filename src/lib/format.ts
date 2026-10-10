import type { CalendarDate } from '../types'
import { parseCalendarDate } from './dates'

export function formatCalendarDate(value: string): string {
  const date = parseCalendarDate(value)
  if (!date) return value
  return new Intl.DateTimeFormat('en', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date)
}

export function formatLongDate(value: CalendarDate): string {
  const date = parseCalendarDate(value)
  if (!date) return value
  return new Intl.DateTimeFormat('en', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date)
}

export function formatTime(iso: string): string {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return ''
  return new Intl.DateTimeFormat('en', { hour: 'numeric', minute: '2-digit' }).format(date)
}

export function formatQuantity(quantity: number | null, unit: string | null): string | null {
  if (quantity === null && !unit) return null
  if (quantity === null) return unit
  const amount = Number.isInteger(quantity) ? String(quantity) : String(quantity)
  if (!unit) return amount
  return `${amount} ${unit}`
}

export function daysLabel(days: number): string {
  if (days < 0) {
    const count = Math.abs(days)
    return count === 1 ? '1 day past date' : `${count} days past date`
  }
  if (days === 0) return 'Expires today'
  if (days === 1) return '1 day left'
  return `${days} days left`
}

export function greeting(now: Date): string {
  const hour = now.getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}

export function plural(count: number, word: string): string {
  return `${count} ${word}${count === 1 ? '' : 's'}`
}

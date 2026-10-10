import { describe, expect, it } from 'vitest'
import {
  addCalendarDays,
  calendarDateFromInstant,
  daysRemaining,
  isCalendarDate,
  parseCalendarDate,
  previousWeekRange,
  toCalendarDate,
  weekRange,
} from './dates'

describe('calendar dates', () => {
  it('rejects values that are not real calendar days', () => {
    expect(parseCalendarDate('')).toBeNull()
    expect(parseCalendarDate('2026-02-31')).toBeNull()
    expect(parseCalendarDate('2026-02-29')).toBeNull()
    expect(parseCalendarDate('2026-00-10')).toBeNull()
    expect(parseCalendarDate('2026-10-10T00:00:00.000Z')).toBeNull()
    expect(isCalendarDate('2024-02-29')).toBe(true)
  })

  it('adds days across month ends without using UTC date strings', () => {
    expect(addCalendarDays('2026-10-31', 1)).toBe('2026-11-01')
    expect(addCalendarDays('2026-03-01', -1)).toBe('2026-02-28')
  })

  it('keeps a local calendar day even when the UTC date is different', () => {
    const early = new Date(2026, 9, 10, 0, 30, 0)
    expect(toCalendarDate(early)).toBe('2026-10-10')
    expect(calendarDateFromInstant(early.toISOString())).toBe('2026-10-10')

    if (early.getTimezoneOffset() < 0) {
      expect(early.toISOString().slice(0, 10)).not.toBe('2026-10-10')
    }

    const late = new Date(2026, 9, 10, 23, 30, 0)
    expect(toCalendarDate(late)).toBe('2026-10-10')
    if (late.getTimezoneOffset() > 0) {
      expect(late.toISOString().slice(0, 10)).not.toBe('2026-10-10')
    }
  })

  it('counts calendar days across a daylight-saving change', () => {
    expect(daysRemaining('2026-10-26', '2026-10-24')).toBe(2)
  })
})

describe('Monday-to-Sunday weeks', () => {
  it('keeps Saturday and Sunday in the week that started on Monday', () => {
    expect(weekRange('2026-10-10')).toEqual({ start: '2026-10-05', end: '2026-10-11' })
    expect(weekRange('2026-10-11')).toEqual({ start: '2026-10-05', end: '2026-10-11' })
    expect(previousWeekRange('2026-10-10')).toEqual({
      start: '2026-09-28',
      end: '2026-10-04',
    })
  })

  it('starts a new week on Monday and treats the previous Sunday as last week', () => {
    expect(weekRange('2026-10-12')).toEqual({ start: '2026-10-12', end: '2026-10-18' })
    expect(previousWeekRange('2026-10-12')).toEqual({
      start: '2026-10-05',
      end: '2026-10-11',
    })
  })
})

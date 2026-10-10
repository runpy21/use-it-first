import { describe, expect, it } from 'vitest'
import { createDemoState } from '../data/demo'
import type { UsageRecord } from '../types'
import { calendarDateToNoonIso } from './dates'
import {
  activityStatus,
  comparisonLabel,
  encouragement,
  isUsedBeforeExpiration,
  recentActivity,
  summarizeImpact,
} from './impact'

function record(
  productId: string,
  usedOn: string,
  expirationDate: string,
  id = productId,
): UsageRecord {
  return {
    id,
    productId,
    productName: productId,
    expirationDate,
    usedAt: calendarDateToNoonIso(usedOn),
    quantity: 1,
    unit: 'pieces',
  }
}

describe('weekly impact', () => {
  const monday = '2026-10-12'

  it('counts a use on the expiration date and rejects a use after it', () => {
    expect(isUsedBeforeExpiration(record('milk', '2026-10-12', '2026-10-12'))).toBe(true)
    expect(isUsedBeforeExpiration(record('salsa', '2026-10-12', '2026-10-11'))).toBe(false)
  })

  it('splits this week from the previous Monday-Sunday week', () => {
    const summary = summarizeImpact(
      [
        record('monday', '2026-10-12', '2026-10-12'),
        record('sunday', '2026-10-11', '2026-10-11'),
        record('after', '2026-10-12', '2026-10-11'),
      ],
      monday,
    )

    expect(summary.thisWeek).toBe(1)
    expect(summary.previousWeek).toBe(1)
    expect(summary.byDay[0]).toMatchObject({ date: '2026-10-12', count: 1 })
    expect(summary.byDay[6].count).toBe(0)
  })

  it('counts each product id once, using the earliest record', () => {
    const countedTwice = summarizeImpact(
      [
        record('milk', '2026-10-12', '2026-10-20', 'first'),
        record('milk', '2026-10-13', '2026-10-20', 'second'),
      ],
      monday,
    )
    expect(countedTwice.thisWeek).toBe(1)

    const earliestMisses = summarizeImpact(
      [
        record('bread', '2026-10-12', '2026-10-11', 'late-date'),
        record('bread', '2026-10-13', '2026-10-20', 'later-but-in-time'),
      ],
      monday,
    )
    expect(earliestMisses.thisWeek).toBe(0)
  })

  it('describes progress without turning the count into weight or money', () => {
    expect(encouragement(0)).toMatch(/Nothing recorded/)
    expect(encouragement(1)).toMatch(/One product/)
    expect(comparisonLabel(2, 1)).toBe('1 more than last week.')
    expect(comparisonLabel(1, 1)).toBe('Same number as last week.')
    expect(comparisonLabel(0, 2)).toBe('2 fewer than last week.')
  })

  it('labels activity honestly for this week, last week, and late uses', () => {
    const [late, current, previous] = recentActivity(
      [
        record('salsa', '2026-10-12', '2026-10-11', 'late'),
        record('milk', '2026-10-12', '2026-10-12', 'current'),
        record('salad', '2026-10-11', '2026-10-11', 'previous'),
      ],
      monday,
    )

    expect(activityStatus(current)).toBe('Counts this week')
    expect(activityStatus(previous)).toBe('Counted last week')
    expect(activityStatus(late)).toBe('Not counted — used after the expiration date')
  })

  it('gives the demo kitchen two in-time uses this week and one last week', () => {
    for (const day of ['2026-10-10', '2026-10-11', '2026-10-12']) {
      const summary = summarizeImpact(createDemoState(day).usageHistory, day)
      expect(summary.thisWeek).toBe(2)
      expect(summary.previousWeek).toBe(1)
    }
  })
})

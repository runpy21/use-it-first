import type { Category, Product, StoredState, UsageRecord } from '../types'
import { addCalendarDays, calendarDateToNoonIso, previousWeekRange, weekRange } from '../lib/dates'

function product(
  today: string,
  id: string,
  name: string,
  category: Category,
  dayOffset: number,
  quantity: number | null,
  unit: string | null,
  notes: string,
): Product {
  return {
    id,
    name,
    category,
    expirationDate: addCalendarDays(today, dayOffset),
    quantity,
    unit,
    notes,
    createdAt: calendarDateToNoonIso(addCalendarDays(today, -2)),
  }
}

function used(
  id: string,
  productId: string,
  name: string,
  usedOn: string,
  expirationDate: string,
  quantity: number | null,
  unit: string | null,
): UsageRecord {
  return {
    id,
    productId,
    productName: name,
    expirationDate,
    usedAt: calendarDateToNoonIso(usedOn),
    quantity,
    unit,
  }
}

/**
 * A small kitchen with dates around today, plus a few usage records so Weekly
 * Impact is visible on the first visit. Usage product ids are not in the inventory,
 * so they cannot be counted a second time.
 */
export function createDemoState(today: string): StoredState {
  const current = weekRange(today)
  const previous = previousWeekRange(today)
  const wednesdayThisWeek = addCalendarDays(current.start, 2)
  const breadUsed = wednesdayThisWeek > today ? today : wednesdayThisWeek
  const saladUsed = addCalendarDays(previous.start, 2)

  return {
    version: 1,
    products: [
      product(today, 'demo-spinach', 'Baby spinach', 'Vegetables', -1, 200, 'g', 'Opened yesterday.'),
      product(today, 'demo-milk', 'Whole milk', 'Dairy', 0, 1, 'L', ''),
      product(today, 'demo-bananas', 'Bananas', 'Fruits', 1, 5, 'pieces', 'A few spots already.'),
      product(today, 'demo-yogurt', 'Greek yogurt', 'Dairy', 2, 400, 'g', ''),
      product(today, 'demo-basil', 'Fresh basil', 'Other', 2, null, null, 'From the windowsill.'),
      product(today, 'demo-bread', 'Sourdough bread', 'Bakery', 3, 1, 'loaf', ''),
      product(today, 'demo-chicken', 'Chicken thighs', 'Meat & Fish', 4, 500, 'g', ''),
      product(today, 'demo-tomatoes', 'Cherry tomatoes', 'Vegetables', 6, 8, 'pieces', ''),
      product(today, 'demo-carrots', 'Carrots', 'Vegetables', 9, 4, 'pieces', ''),
      product(today, 'demo-eggs', 'Eggs', 'Dairy', 14, 6, 'pieces', ''),
      product(today, 'demo-chickpeas', 'Canned chickpeas', 'Pantry', 90, 1, 'can', ''),
    ],
    usageHistory: [
      used(
        'demo-usage-salsa',
        'demo-used-salsa',
        'Open salsa',
        today,
        addCalendarDays(today, -1),
        1,
        'pack',
      ),
      used(
        'demo-usage-bread',
        'demo-used-bread',
        'Bread heels',
        breadUsed,
        breadUsed,
        2,
        'pieces',
      ),
      used(
        'demo-usage-yogurt',
        'demo-used-yogurt',
        'Yogurt pot',
        current.start,
        addCalendarDays(current.start, 1),
        1,
        'pack',
      ),
      used(
        'demo-usage-salad',
        'demo-used-salad',
        'Mixed salad',
        saladUsed,
        addCalendarDays(saladUsed, 2),
        1,
        'pack',
      ),
    ],
  }
}

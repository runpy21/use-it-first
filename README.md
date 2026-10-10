# Use It First

Use It First is a small kitchen app for people who want to eat what they already bought. It keeps a list of products, shows which dates need attention, matches those products to prepared recipes, and counts how many items you marked as used before they expired.

The tagline is **Less waste, more taste.**

## Features

- Overview with a welcome, four summary counts, a “Use these first” list, and a weekly impact panel.
- Product inventory: add, edit, remove (with confirmation), and mark as used.
- Search by name, filter by freshness and category, and sort by expiration date.
- Freshness is calculated from local calendar days: expired, use today, expiring soon (the next three days), and fresh.
- Ten prepared recipes matched against your kitchen, with available ingredients, missing ingredients, and a match percentage.
- Weekly Impact for the current Monday–Sunday week, compared with the previous week.
- Data saved in this browser with `localStorage`, including a demo kitchen on the first visit.

## Technology stack

- React 19 and TypeScript
- Vite
- Tailwind CSS v4, through the official `@tailwindcss/vite` plugin
- lucide-react for icons
- Vitest for the date, storage, and impact tests

## Installation

```bash
npm install
```

## Local development

```bash
npm run dev
```

Then open the address Vite prints, usually `http://localhost:5173`.

Other checks:

```bash
npm test
npm run lint
```

## Production build

```bash
npm run build
```

The compiled site is written to `dist/`. Preview it with:

```bash
npm run preview
```

## How the weekly impact metric is calculated

A week starts on Monday and ends on Sunday, using your local calendar.

When you mark a product as used, the app stores a usage record with:

- the product id
- the product name
- the expiration date at that moment
- the date and time you marked it
- the quantity and unit, when you entered them

The product then leaves your kitchen list. The same product id can be recorded only once.

A record counts as **used before expiration** when the local calendar day you marked it is on or before the expiration date saved on that record. The weekly number is how many of those records fall inside the current Monday–Sunday week. Last week’s count uses the previous Monday–Sunday week.

The activity list also shows items that were marked after their date. Those items are not included in the weekly number.

This is a count of recorded products. It is not a measurement of kilograms of food saved or money saved. A past date is not treated as proof that food is unsafe.

## Current limitations

- Data lives in `localStorage` for this browser on this device. It does not sync across devices or browsers, and clearing site data removes it.
- Recipes are a fixed local list. The app matches them to your inventory. It does not create new recipes.
- Dates tell you what to use first. They are not a food-safety decision.
- There are no accounts, notifications, or photos.

## Future improvement ideas

- Optional sync or export, so a kitchen list can move between devices.
- A shopping note for ingredients a recipe is missing.
- Your own recipes, stored next to the prepared ones.
- Reminders on the day a product expires.

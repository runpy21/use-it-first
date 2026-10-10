# Use It First

Use It First is a small kitchen app for people who want to eat what they already bought. It keeps a list of products, shows which dates need attention, matches those products to prepared recipes, and counts how many items you marked as used before they expired.

The tagline is **Less waste, more taste.**

The interface is in English. Data stays in this browser. Nothing is sent to a server.

## Features

- Overview with a welcome, four summary counts, a “Use these first” list, and a weekly impact panel.
- Product inventory: add, edit, remove (with confirmation), and mark as used.
- Search by name, filter by freshness and category, and sort by expiration date.
- Freshness is calculated from local calendar days: expired, use today, expiring soon (the next three days), and fresh.
- Ten prepared recipes matched against your kitchen, with available ingredients, missing ingredients, and a match percentage.
- Weekly Impact for the current Monday–Sunday week, compared with the previous week.
- Data saved in this browser with `localStorage`, including a demo kitchen on the first visit.

On a phone, the sidebar collapses into a menu. Opening a recipe shows an **All recipes** button that returns to the list.

## Technology stack

- React 19 and TypeScript
- Vite 8
- Tailwind CSS v4, through the official `@tailwindcss/vite` plugin (theme tokens live in `src/index.css`, not a `tailwind.config.js` file)
- lucide-react for icons
- Vitest for date, storage, and impact tests
- React Testing Library and happy-dom for the main screen flows

## Requirements

- Node.js `^20.19.0` or `>=22.12.0` (the range Vite 8 requires)
- npm (this repo includes `package-lock.json`)

Check your versions:

```bash
node -v
npm -v
```

No API key, `.env` file, or database is required.

## Setup

From the project folder:

```bash
npm install
```

That installs the app and the test tools. You only need to run it again after `package.json` changes.

## Local development

```bash
npm run dev
```

Vite prints a local address, usually `http://localhost:5173`. Open that in a browser.

The first visit with an empty save writes a demo kitchen under the storage key `use-it-first.v1`. The sidebar also has **Restore demo kitchen** and **Clear saved data**. Clearing removes products and usage history from this browser. Restoring replaces both with the sample kitchen.

Refresh the page to confirm a change was saved. A different browser, or the same browser on another device, has its own empty copy.

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Starts the Vite dev server with hot reload |
| `npm test` | Runs the Vitest suite once |
| `npm run lint` | Runs Oxlint |
| `npm run build` | Type-checks with `tsc -b`, then writes the production site to `dist/` |
| `npm run preview` | Serves the `dist/` folder locally. Run `npm run build` first |

## Production build

```bash
npm run build
npm run preview
```

`npm run build` fails if TypeScript fails, because the script is `tsc -b && vite build`. The preview server prints its own local address. The built files are static and can be hosted on any static file host. There is still no account or sync: each visitor’s kitchen is stored in that browser.

## Project layout

```text
src/
  components/   Shared interface pieces, including the sidebar and dialogs
  pages/        Overview, My Products, Recipes, and Weekly Impact
  data/         Demo kitchen and the prepared recipes
  hooks/        Inventory state and localStorage
  lib/          Dates, expiration, storage, impact, and recipe matching
  types/        Product, usage, and recipe types
  App.tsx
  main.tsx
  index.css     Tailwind import and color tokens
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

Expiration dates are stored as `YYYY-MM-DD` calendar days and compared in local time. The app does not parse a date-only string as a UTC midnight instant, which would shift the day in some time zones.

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

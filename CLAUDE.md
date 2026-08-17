# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A personal income/expense tracker: Daily transaction log, Calendar view, Weekly/Monthly rollup, Total (monthly summary with Excel export), and Reminders (recurring bill due dates) tabs. React + TypeScript + Vite + Tailwind CSS v4. No backend — all data lives in the browser's `localStorage`, scoped to the current URL (so local dev and the deployed site have separate data).

## Commands

```bash
npm run dev       # start Vite dev server (serves at /Expense-Tracker/ base path, see vite.config.ts)
npm run build      # tsc -b typecheck + production build to dist/
npm run preview    # preview the production build locally
npm run lint       # oxlint
npx tsc --noEmit   # typecheck only, no build output
```

There is no test suite/framework configured in this repo.

Deployment is automatic via `.github/workflows/deploy.yml`: every push to `main` builds and publishes `dist/` to GitHub Pages. If the repo is renamed, `base` in `vite.config.ts` must be updated to match (`base: '/<repo-name>/'`), since both the dev server path and the PWA `start_url`/`scope` depend on it.

## Architecture

**State**: Single reducer in [src/store/TransactionsContext.tsx](src/store/TransactionsContext.tsx) holds all app state (`AppState` from [src/types/index.ts](src/types/index.ts)) — transactions, categories, accounts + opening balances, budget, reminders. Exposed via `useTransactions()`. Every dispatch synchronously persists the whole state to `localStorage` through [src/lib/storage.ts](src/lib/storage.ts) (`loadState`/`saveState`) in a `useEffect`. `loadState` merges saved JSON onto `createDefaultState()` (from [src/data/defaults.ts](src/data/defaults.ts)) so fields added in later versions backfill instead of wiping existing data — preserve this merge behavior when adding new `AppState` fields.

**Top-level flow**: [src/App.tsx](src/App.tsx) owns which tab is active and which record (if any) is being edited, and renders `TransactionForm`/`ReminderForm` as modals on top of the active tab. Tabs live in `src/tabs/`, are purely presentational/derive-from-context, and don't own persisted state themselves.

**Date handling — read before touching any date code**: `Transaction.date` is a full ISO datetime string; `BillReminder.dueDate` is a bare `yyyy-mm-dd` string. A bare `yyyy-mm-dd` parsed with `new Date(str)` is interpreted as **UTC midnight**, which shifts by a day in non-UTC-positive timezones. All local-time formatting/parsing must go through [src/lib/dateUtils.ts](src/lib/dateUtils.ts): use `dayKey`/`toDateInputValue` to format a `Date` → local `yyyy-mm-dd`, and `parseDateInputValue` to parse a `yyyy-mm-dd` string → local `Date`. Never call `new Date()` directly on a `dueDate`-shaped string.

**Derived data**: [src/lib/aggregate.ts](src/lib/aggregate.ts) computes all rollups (sums by type, grouping by day, week/month summaries, category breakdowns, account balances, top transactions) from the raw `transactions` array — nothing is pre-aggregated in state. [src/lib/recurrence.ts](src/lib/recurrence.ts) expands a recurring transaction into N occurrences sharing one `seriesId` at creation time (not computed lazily), so deleting "the whole series" means filtering by `seriesId`. [src/lib/reminders.ts](src/lib/reminders.ts) computes reminder status (`overdue`/`dueSoon`/`upcoming`) from days-until-due and advances a reminder's `dueDate` by its frequency when marked paid.

**Component layout**: `src/components/form/` holds transaction-entry building blocks (amount stepper, category/account pickers, date/time field, recurrence panel) shared by `TransactionForm`; `src/components/reminders/` and `src/components/transactions/` hold tab-specific row/list components; `src/components/settings/` holds the category/account management and JSON backup/restore modals reached from the Total tab's "Manage" screen.

**Data portability**: [src/lib/jsonBackup.ts](src/lib/jsonBackup.ts) handles full-state JSON export/import (round-trips `AppState` exactly). [src/lib/excelExport.ts](src/lib/excelExport.ts) uses `xlsx` (SheetJS) to write `.xlsx` exports only — it never parses untrusted spreadsheet files, so the package's known parsing-related advisories don't apply to this usage; don't add spreadsheet import/parsing without re-evaluating that.

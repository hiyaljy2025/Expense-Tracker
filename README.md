# Expense Tracker

A personal income/expense tracker: a Daily transaction log, a Calendar view, a Weekly/Monthly rollup, and a Total (monthly summary) tab with Excel export. Built with React, TypeScript, Vite, and Tailwind CSS. All data is stored locally in the browser (`localStorage`) — there is no backend.

## Features

- **Daily / Calendar / Weekly-Monthly / Total** tabs, matching the reference app layout
- Tap a calendar day to jump straight to that day's transactions; today is highlighted
- **Editable categories and accounts** — add, rename, or delete from the Total tab's "Manage" screen, or inline while adding a transaction
- **Recurring transactions** ("Rep/Inst." toggle) — weekly or monthly, for a set number of occurrences
- **Account balances** — each account tracks an opening balance plus its running income/expense ledger
- **Budget Setting** with a progress bar against the current month's spending
- **Spending by Category** chart on the Total tab
- **Excel export** (`.xlsx`) and **JSON backup/restore** for full data portability
- Installable as a **PWA** (works offline, add-to-home-screen) once deployed
- Delete confirmations everywhere, including a choice to delete a single occurrence or a whole recurring series

## Local development

```bash
npm install
npm run dev
```

Open the printed local URL in your browser.

```bash
npm run build     # production build to dist/
npm run preview   # preview the production build locally
```

## Deploying to GitHub Pages

This repo includes `.github/workflows/deploy.yml`, which builds and deploys the app to GitHub Pages automatically on every push to `main`.

One-time setup:

1. Create a new **public** repository on GitHub (suggested name: `expense-tracker`). If you use a different name, update `base` in [`vite.config.ts`](vite.config.ts) to match: `base: '/<your-repo-name>/'`.
2. From this project directory:
   ```bash
   git remote add origin https://github.com/<your-username>/<your-repo-name>.git
   git branch -M main
   git push -u origin main
   ```
3. On GitHub, go to the repo's **Settings → Pages**, and under **Source** select **GitHub Actions**.
4. After the workflow run finishes (check the **Actions** tab), the app will be live at:
   `https://<your-username>.github.io/<your-repo-name>/`

## Data & Excel export

All transactions live in the browser's `localStorage`, scoped to whatever URL you're using (so local dev and the deployed site have separate data). Use the **Export data to Excel** button on the Total tab to download all transactions as an `.xlsx` file — this is also the recommended way to back up or move data between browsers/devices, since there is no cloud sync.

> Note: the `xlsx` (SheetJS) package used for export has known advisories related to *parsing* untrusted spreadsheet files. This app only *writes* export files from its own data and never parses uploaded files, so the advisories don't apply to this usage.

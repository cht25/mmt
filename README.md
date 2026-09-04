# Mahi And Muhi Traders — ডিজিটাল তালি খাতা (PWA)

A digital **Tali Khata** (credit ledger) for **Mahi And Muhi Traders** — track who owes you and who you owe, record every credit sale, collection, purchase and payment, and even install it on your phone as an app (**PWA** — no APK, no Play Store needed).

## Two pages

| URL | What it is |
| --- | --- |
| **`/`** | Landing page — brand, key features, install instructions, payment methods |
| **`/app.html`** | The app itself — installable PWA (also where the landing page links to) |

Users use it **in the browser** (computer or phone) or **install it as a PWA** from the landing page. There is **no APK download and no mock login**.

## Features

- 🏠 **Landing page** — features, 3-step how-to, Android/iPhone install guides, payment methods, CTA
- 📲 **PWA** — `manifest.webmanifest` + service worker (`public/sw.js`): installable, works offline, app icon included
- 📊 **Dashboard** — receivable/payable/net balance, today & month stats, 7-day chart, top dues, recent activity
- 👥 **Customers & parties** — add/update/delete customers and suppliers, call + WhatsApp, search
- 📒 **Per-party Tali Khata** — running balance, totals, CSV export, print-ready A4 statement
- 💸 **Transactions** — credit sale, collection, purchase, payment — one tap; **edit or delete any entry** from the list or the customer's khata (admin)
- 📈 **Reports** — period/monthly/customer summaries, due lists, CSV
- 🛠 **Admin panel** (in Settings) — add/edit/delete **payment gateways** (bKash, Nagad, Rocket, bank…), toggle active/inactive, colors; plus shop profile, theme, backup, demo data. Gateways you configure show up on the landing page.
- 🌐 Bilingual বাংলা/English, Bengali numerals, dark mode, color themes
- 💾 localStorage persistence + JSON backup/restore

## Run locally

```bash
npm install
npm run dev          # dev server: http://localhost:5173/  (landing)  and  /app.html
```

## Build & test

```bash
npm run build        # production build (both pages) in dist/
npm run smoke        # headless tests: landing page + app flows (add customer, entry, ledger, admin gateway, demo data, language)
```

## No `.env` — by design

This project does **not** use any `.env` file or environment variables. Firebase will be added through code config, not env secrets — see `src/lib/firebase.example.ts` for the ready template (rename it to `firebase.ts`, paste your Firebase web config, then wire the store). `/.gitignore` blocks `.env` files so none can be committed by accident.

## Structure

```
index.html               → landing page entry
app.html                 → app (PWA) entry
public/
  manifest.webmanifest   → PWA manifest (install, icons, standalone)
  sw.js                  → service worker (offline cache, network-first)
  icon-192/512.png ...   → app/favicon icons
src/
  App.tsx                → app shell, navigation
  components/            → Dashboard, Customers, CustomerLedger, Transactions,
                           Reports, SettingsPage (+ admin panel), Modals, ui
  landing/Landing.tsx    → landing page component
  lib/                   → store, calc, i18n, format, csv, pwa, firebase.example
smoke/                   → headless jsdom tests
```

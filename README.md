# Mahi And Muhi Traders — ডিজিটাল তালি খাতা

A digital **Tali Khata** (credit ledger) app for **Mahi And Muhi Traders** — track who owes you, who you owe, and record every credit sale, collection, purchase, and payment in one place. Bilingual (বাংলা / English), mobile-first, and ready to run locally.

## Features

- 📊 **Dashboard** — total receivable, total payable, net balance, today's and this month's sales & collections, 7-day chart, top dues, recent activity
- 👥 **Customers & Parties** — add/update/delete customers and suppliers, search by name or phone, call + WhatsApp links
- 📒 **Per-party Tali Khata** — full ledger statement with running balance, totals, CSV export, and print-ready statement (A4) with signature block
- 💸 **Transactions** — credit sale, payment received, credit purchase, payment made — one-tap entry from anywhere
- 📈 **Reports** — period summary, monthly summary, customer summary, due list (receivables & payables), CSV export
- 🌐 **Bilingual UI** — বাংলা (default) and English, optional Bengali numerals
- 🎨 **Appearance** — dark mode, 8 color themes
- 💾 **Data** — auto-saves in your browser (localStorage), JSON backup/restore, demo data to explore

## Run locally

```bash
npm install
npm run dev      # http://localhost:5173
```

## Build & smoke test

```bash
npm run build    # production build in dist/
npm run smoke    # headless render + interaction test (jsdom)
```

## Notes

- All data lives only in your browser (localStorage). Use **Settings → Backup** to export a JSON file for safekeeping or moving to another device.
- Fill in your real shop details under **Settings** (name, owner, phone, address) — they appear on printed statements.

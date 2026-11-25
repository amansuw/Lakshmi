# Lakshmi

Nepal gold price dashboard: official FENEGOSIDA rates, live international spot, open-move estimates when Kathmandu prints after overnight moves, multi-horizon forecasts, and market sentiment.

## Features

- **Nepal official rates** from [FENEGOSIDA](https://www.fenegosida.org/) (`api.fenegosida.org`)
- **Live XAU/USD** from [gold-api.com](https://gold-api.com/) (no key, ~30s updates)
- **USD/NPR** from open.er-api.com
- **Daily history** from [XAUS](https://xaus.com/api/) + FENEGOSIDA month history
- **Open-move estimate**: overnight international % → implied next Nepal print (~85% pass-through)
- **Forecasts**: next day, week, month, quarter, 6 months, year (momentum + mean reversion + vol + sentiment)
- **Sentiment** from [XOOMAR](https://xoomar.com/markets/api/sentiment) (gold)
- **Hourly poll**: browser refreshes every hour; `POST /api/poll` appends to `data/snapshots.json`

## Quick start

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Hourly server poll (optional)

With the app running:

```bash
npm run poll
```

Or cron every hour:

```bash
curl -X POST http://localhost:3000/api/poll
```

## API routes

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/market` | GET | Full live snapshot + forecasts |
| `/api/poll` | GET | Recent saved poll history |
| `/api/poll` | POST | Fetch market and append a snapshot |

## Live data sources (hourly-friendly)

| Source | Auth | Notes |
|--------|------|-------|
| `https://api.gold-api.com/price/XAU` | None | Unlimited real-time; cache ≥30s |
| `https://api.fenegosida.org/api/website/v1/Dashboard/today` | None | Official Nepal daily print |
| `https://xaus.com/api/v1/history?symbol=xau&days=365` | None | Daily OHLC-ish history |
| `https://open.er-api.com/v6/latest/USD` | None | USD→NPR |
| `https://xoomar.com/api/markets/sentiment?window=24h` | None | 10 req/min · pick `gold` |

Optional later: [gold-api.com](https://gold-api.com/) history/OHLC with a free API key (10 req/hour).

## Disclaimer

Forecasts are heuristic research signals, not financial advice. Gold trading and jewellery pricing involve duty, premiums, and dealer spreads beyond spot.

# Finora — Indian Stock Market Predictor

A full-stack, AI-powered stock market analysis platform built for **NSE & BSE** Indian markets. Finora delivers live quotes, technical analysis, portfolio tracking, pattern scanning, and trading tools — all in a modern dark-themed dashboard.

---

## Features

### 📊 Market Overview
- **Dashboard** — top AI picks, live market indices (NIFTY 50, SENSEX, BANK NIFTY), scrolling ticker with ● LIVE / ● MOCK badge
- **Sector Heatmap** — color-coded grid of all major NSE sectors by % change
- **Markets** — sortable table of all stocks with live quotes and mini-charts

### 🧠 Stock Picking & Analysis
- **Daily Picks** — AI-ranked stocks with Buy/Sell/Hold signals and score gauges
- **Swing Trade Scanner** — detects 10 patterns: Golden Cross, Death Cross, RSI Reversal, Volume Breakout, 52W High/Low, Bullish/Bearish Engulfing, Hammer, Shooting Star
- **Compare** — side-by-side technical comparison of up to 3 stocks
- **AI Predict** — TensorFlow.js LSTM model generates 30-day price forecasts in-browser

### 💼 Portfolio Management
- **Portfolio Tracker** — add holdings, track live P&L per position, total XIRR (annualised return), sector allocation pie chart
- **Watchlist** — save and monitor stocks with live prices
- **Price Alerts** — set above/below price triggers, auto-polls every 30 seconds, in-app notification centre

### 🛠️ Trading Tools
- **Stop Loss & Position Sizer** — calculates quantity, target, max loss, and R:R ratio from your capital and risk %
- **SIP Calculator** — maturity value and wealth gained projections
- **STCG / LTCG Tax Calculator** — auto-detects holding period, applies correct tax rate (15% / 10%), includes STT
- **Intraday Pivot Points & CPR** — R1/R2/R3, S1/S2/S3, CPR Top/Bottom from previous day OHLC

### 📅 IPO Calendar
- Upcoming IPOs with price band, lot size, GMP (grey market premium), min investment
- Recently listed IPOs with listing gains and subscription data

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router, Turbopack) |
| Language | TypeScript |
| Styling | TailwindCSS v4 |
| Components | shadcn/ui + Radix UI |
| Charts | Recharts |
| Icons | Lucide React |
| ML / AI | TensorFlow.js (LSTM, in-browser) |
| Data | Yahoo Finance (live, 15-min delayed) → mock fallback |

---

## Data Source

Live prices are fetched from **Yahoo Finance** — no API key required.

- NSE stocks: `SYMBOL.NS` (e.g. `RELIANCE.NS`)
- Indices: `^NSEI` (NIFTY 50), `^BSESN` (SENSEX), `^NSEBANK` (BANK NIFTY)
- Prices are **15 minutes delayed** per Yahoo Finance policy
- If Yahoo is unreachable, the app **automatically falls back** to realistic mock data

The ticker bar shows a **● LIVE** (green) or **● MOCK** (amber) badge so you always know the data source.

---

## Getting Started

### Prerequisites
- Node.js 18+
- npm / yarn / pnpm

### Installation

```bash
git clone https://github.com/shakeelnoohm/Finora-Stock-Market-Predictor.git
cd Finora-Stock-Market-Predictor
npm install
```

### Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for Production

```bash
npm run build
npm start
```

---

## Project Structure

```
src/
├── app/
│   ├── page.tsx              # Dashboard
│   ├── picks/                # Daily AI picks
│   ├── scanner/              # Swing trade scanner
│   ├── compare/              # Stock comparison
│   ├── predict/              # AI price prediction
│   ├── portfolio/            # Portfolio tracker
│   ├── watchlist/            # Watchlist
│   ├── alerts/               # Price alerts + notifications
│   ├── heatmap/              # Sector heatmap
│   ├── markets/              # Markets overview
│   ├── tools/                # Trading calculators
│   ├── ipo/                  # IPO calendar
│   ├── settings/             # App settings
│   └── api/
│       └── stock/
│           ├── quote/        # GET /api/stock/quote?symbol=
│           ├── history/      # GET /api/stock/history?symbol=&range=
│           ├── indicators/   # GET /api/stock/indicators?symbol=
│           ├── screen/       # GET /api/stock/screen
│           ├── scan/         # GET /api/stock/scan
│           └── search/       # GET /api/stock/search?q=
├── components/
│   ├── layout/               # Sidebar, Header, MarketTicker
│   └── stock/                # SignalBadge, ScoreGauge, IndicatorPanel, StockChart
└── lib/
    ├── yahoo.ts              # Yahoo Finance data fetcher
    ├── indicators.ts         # RSI, MACD, SMA, EMA, BB, ATR calculations
    ├── scanner.ts            # Pattern recognition logic
    ├── portfolio.ts          # Holdings, XIRR, sector breakdown
    ├── alerts.ts             # Price alert logic + notifications
    ├── mockData.ts           # Fallback mock OHLCV generator
    ├── constants.ts          # NSE stock list, indices, colours
    ├── utils.ts              # INR formatting, cn helper
    └── types.ts              # Shared TypeScript interfaces
---

## License

MIT


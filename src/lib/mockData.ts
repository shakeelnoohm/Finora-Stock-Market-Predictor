import { StockDataPoint, StockQuote } from "./types";
import { subDays, format } from "date-fns";

const SEED_PRICES: Record<string, number> = {
  RELIANCE: 2945.0,
  TCS: 3820.0,
  HDFCBANK: 1680.0,
  INFY: 1590.0,
  ICICIBANK: 1240.0,
  HINDUNILVR: 2380.0,
  SBIN: 815.0,
  BHARTIARTL: 1720.0,
  ITC: 465.0,
  KOTAKBANK: 1895.0,
  LT: 3650.0,
  WIPRO: 480.0,
  HCLTECH: 1720.0,
  AXISBANK: 1125.0,
  BAJFINANCE: 7200.0,
  TATAMOTORS: 980.0,
  SUNPHARMA: 1680.0,
  ONGC: 272.0,
  TITAN: 3550.0,
  ADANIENT: 2450.0,
  NIFTY50: 24200.0,
  SENSEX: 79800.0,
  BANKNIFTY: 52400.0,
  NIFTYMIDCAP: 56800.0,
  DEFAULT: 500.0,
};

function seededRandom(seed: number): number {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

export function generateHistoricalData(symbol: string, days: number): StockDataPoint[] {
  const basePrice = SEED_PRICES[symbol] ?? SEED_PRICES.DEFAULT;
  const data: StockDataPoint[] = [];
  let price = basePrice * 0.75;

  for (let i = days; i >= 0; i--) {
    const seed = symbol.charCodeAt(0) * 100 + i;
    const rand = seededRandom(seed) - 0.5;
    const change = price * (rand * 0.04);
    const open = price;
    price = Math.max(price + change, 1);
    const high = Math.max(open, price) * (1 + seededRandom(seed + 1) * 0.01);
    const low = Math.min(open, price) * (1 - seededRandom(seed + 2) * 0.01);
    const volume = Math.floor(seededRandom(seed + 3) * 50_00_000 + 1_00_000);
    const date = format(subDays(new Date(), i), "yyyy-MM-dd");
    data.push({ date, open, high, low, close: price, volume });
  }
  return data;
}

export function generateQuote(symbol: string, name: string): StockQuote {
  const data = generateHistoricalData(symbol, 2);
  const today = data[data.length - 1];
  const yesterday = data[data.length - 2];
  const change = today.close - yesterday.close;
  const changePercent = (change / yesterday.close) * 100;
  return {
    symbol,
    name,
    price: today.close,
    change,
    changePercent,
    open: today.open,
    high: today.high,
    low: today.low,
    volume: today.volume,
    marketCap: today.close * (Math.floor(seededRandom(symbol.charCodeAt(0)) * 5_00_00_00_000) + 50_00_00_000),
    pe: 20 + Math.random() * 20,
    eps: today.close / (20 + Math.random() * 20),
    week52High: today.close * (1 + Math.random() * 0.3),
    week52Low: today.close * (1 - Math.random() * 0.3),
    avgVolume: today.volume * (0.8 + Math.random() * 0.4),
  };
}

import { StockQuote, StockDataPoint } from "./types";
import { POPULAR_STOCKS } from "./constants";

// NSE stocks use .NS suffix, BSE use .BO
// Indices: ^NSEI = NIFTY50, ^BSESN = SENSEX, ^NSEBANK = BANKNIFTY
const INDEX_MAP: Record<string, string> = {
  NIFTY50: "^NSEI",
  SENSEX: "^BSESN",
  BANKNIFTY: "^NSEBANK",
  NIFTYMIDCAP: "^CNXMIDCAP",
};

export function toYahooSymbol(symbol: string): string {
  if (INDEX_MAP[symbol]) return INDEX_MAP[symbol];
  return `${symbol}.NS`;
}

const HEADERS = {
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
  "Accept": "*/*",
  "Accept-Language": "en-US,en;q=0.9",
  "Referer": "https://finance.yahoo.com/",
  "Origin": "https://finance.yahoo.com",
};

async function yahooFetch(path: string): Promise<Response | null> {
  // Try query2 first (more reliable from server-side), then query1
  for (const host of ["query2.finance.yahoo.com", "query1.finance.yahoo.com"]) {
    try {
      const res = await fetch(`https://${host}${path}`, {
        headers: HEADERS,
        next: { revalidate: 60 },
        signal: AbortSignal.timeout(8000),
      });
      if (res.ok) return res;
    } catch {
      continue;
    }
  }
  return null;
}

export async function fetchYahooQuote(symbol: string): Promise<StockQuote | null> {
  const ySym = toYahooSymbol(symbol);
  const path = `/v8/finance/chart/${encodeURIComponent(ySym)}?interval=1d&range=2d&includePrePost=false`;

  try {
    const res = await yahooFetch(path);
    if (!res) return null;
    const json = await res.json();
    const result = json?.chart?.result?.[0];
    if (!result) return null;

    const meta = result.meta;
    const price: number = meta.regularMarketPrice ?? meta.previousClose;
    if (!price) return null;
    const prev: number = meta.chartPreviousClose ?? meta.previousClose ?? price;
    const change = price - prev;
    const changePercent = prev > 0 ? (change / prev) * 100 : 0;
    const known = POPULAR_STOCKS.find((s) => s.symbol === symbol);

    return {
      symbol,
      name: known?.name ?? meta.shortName ?? symbol,
      price,
      change,
      changePercent,
      open: meta.regularMarketOpen ?? price,
      high: meta.regularMarketDayHigh ?? price,
      low: meta.regularMarketDayLow ?? price,
      volume: meta.regularMarketVolume ?? 0,
      marketCap: meta.marketCap ?? 0,
      pe: 0,
      eps: 0,
      week52High: meta.fiftyTwoWeekHigh ?? price,
      week52Low: meta.fiftyTwoWeekLow ?? price,
      avgVolume: meta.averageDailyVolume3Month ?? 0,
    };
  } catch {
    return null;
  }
}

const RANGE_PARAMS: Record<string, { interval: string; range: string }> = {
  "1D": { interval: "5m",  range: "1d" },
  "1W": { interval: "15m", range: "5d" },
  "1M": { interval: "1d",  range: "1mo" },
  "3M": { interval: "1d",  range: "3mo" },
  "6M": { interval: "1d",  range: "6mo" },
  "1Y": { interval: "1d",  range: "1y" },
  "5Y": { interval: "1wk", range: "5y" },
};

export async function fetchYahooHistory(symbol: string, range: string): Promise<StockDataPoint[] | null> {
  const ySym = toYahooSymbol(symbol);
  const params = RANGE_PARAMS[range] ?? RANGE_PARAMS["1M"];
  const path = `/v8/finance/chart/${encodeURIComponent(ySym)}?interval=${params.interval}&range=${params.range}&includePrePost=false`;

  try {
    const res = await yahooFetch(path);
    if (!res) return null;
    const json = await res.json();
    const result = json?.chart?.result?.[0];
    if (!result) return null;

    const timestamps: number[] = result.timestamp ?? [];
    const ohlcv = result.indicators?.quote?.[0];
    if (!ohlcv || !timestamps.length) return null;

    const data: StockDataPoint[] = [];
    for (let i = 0; i < timestamps.length; i++) {
      const close = ohlcv.close?.[i];
      if (close == null) continue;
      const date = new Date(timestamps[i] * 1000).toISOString().split("T")[0];
      data.push({
        date,
        open:   ohlcv.open?.[i]   ?? close,
        high:   ohlcv.high?.[i]   ?? close,
        low:    ohlcv.low?.[i]    ?? close,
        close,
        volume: ohlcv.volume?.[i] ?? 0,
      });
    }
    return data.length > 0 ? data : null;
  } catch {
    return null;
  }
}

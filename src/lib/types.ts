export interface StockQuote {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  open: number;
  high: number;
  low: number;
  volume: number;
  marketCap?: number;
  pe?: number;
  eps?: number;
  week52High?: number;
  week52Low?: number;
  avgVolume?: number;
}

export interface StockDataPoint {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface PredictionResult {
  symbol: string;
  currentPrice: number;
  predictions: PredictionPoint[];
  confidence: number;
  trend: "bullish" | "bearish" | "neutral";
  summary: string;
  modelAccuracy: number;
}

export interface PredictionPoint {
  date: string;
  predicted: number;
  lower: number;
  upper: number;
}

export interface WatchlistItem {
  symbol: string;
  name: string;
  addedAt: string;
}

export interface NewsItem {
  title: string;
  url: string;
  source: string;
  publishedAt: string;
  summary: string;
  sentiment: "positive" | "negative" | "neutral";
}

export type TimeRange = "1D" | "1W" | "1M" | "3M" | "6M" | "1Y" | "5Y";

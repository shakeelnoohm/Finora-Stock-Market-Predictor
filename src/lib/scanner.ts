import { StockDataPoint } from "./types";
import { computeIndicators } from "./indicators";

export type ScanPattern =
  | "golden_cross"
  | "death_cross"
  | "rsi_oversold_reversal"
  | "volume_breakout"
  | "52w_high_breakout"
  | "52w_low_bounce"
  | "bullish_engulfing"
  | "bearish_engulfing"
  | "hammer"
  | "shooting_star";

export interface ScanResult {
  symbol: string;
  name: string;
  price: number;
  changePercent: number;
  patterns: ScanPattern[];
  patternLabels: string[];
  strength: number;
}

const PATTERN_LABELS: Record<ScanPattern, string> = {
  golden_cross: "Golden Cross",
  death_cross: "Death Cross",
  rsi_oversold_reversal: "RSI Reversal",
  volume_breakout: "Volume Breakout",
  "52w_high_breakout": "52W High Breakout",
  "52w_low_bounce": "52W Low Bounce",
  bullish_engulfing: "Bullish Engulfing",
  bearish_engulfing: "Bearish Engulfing",
  hammer: "Hammer",
  shooting_star: "Shooting Star",
};

export function scanPatterns(data: StockDataPoint[], symbol: string, name: string): ScanResult {
  const ind = computeIndicators(data);
  const patterns: ScanPattern[] = [];
  const last = data[data.length - 1];
  const prev = data[data.length - 2];
  const price = last.close;
  const changePercent = prev ? ((price - prev.close) / prev.close) * 100 : 0;

  const closes = data.map((d) => d.close);
  const high52 = Math.max(...closes);
  const low52 = Math.min(...closes);

  // Golden/Death Cross
  if (ind.sma20 > ind.sma50) patterns.push("golden_cross");
  else patterns.push("death_cross");

  // RSI Oversold Reversal
  const prevRSI = computeIndicators(data.slice(0, -1)).rsi;
  if (prevRSI < 32 && ind.rsi > prevRSI) patterns.push("rsi_oversold_reversal");

  // Volume Breakout
  if (ind.volumeRatio > 2.0 && changePercent > 1) patterns.push("volume_breakout");

  // 52W Breakout/Bounce
  if (price >= high52 * 0.98) patterns.push("52w_high_breakout");
  if (price <= low52 * 1.03 && changePercent > 0) patterns.push("52w_low_bounce");

  // Candlestick Patterns
  if (prev && last) {
    const bodySize = Math.abs(last.close - last.open);
    const totalRange = last.high - last.low;
    const lowerWick = Math.min(last.open, last.close) - last.low;
    const upperWick = last.high - Math.max(last.open, last.close);

    // Bullish Engulfing
    if (
      prev.close < prev.open &&
      last.close > last.open &&
      last.open < prev.close &&
      last.close > prev.open
    ) patterns.push("bullish_engulfing");

    // Bearish Engulfing
    if (
      prev.close > prev.open &&
      last.close < last.open &&
      last.open > prev.close &&
      last.close < prev.open
    ) patterns.push("bearish_engulfing");

    // Hammer (bullish)
    if (
      lowerWick > bodySize * 2 &&
      upperWick < bodySize * 0.5 &&
      totalRange > 0
    ) patterns.push("hammer");

    // Shooting Star (bearish)
    if (
      upperWick > bodySize * 2 &&
      lowerWick < bodySize * 0.5 &&
      totalRange > 0
    ) patterns.push("shooting_star");
  }

  const bullishPatterns: ScanPattern[] = ["golden_cross", "rsi_oversold_reversal", "volume_breakout", "52w_high_breakout", "52w_low_bounce", "bullish_engulfing", "hammer"];
  const strength = patterns.filter((p) => bullishPatterns.includes(p)).length;

  return {
    symbol, name, price, changePercent,
    patterns,
    patternLabels: patterns.map((p) => PATTERN_LABELS[p]),
    strength,
  };
}

export function calcPivotPoints(high: number, low: number, close: number) {
  const pp = (high + low + close) / 3;
  const r1 = 2 * pp - low;
  const r2 = pp + (high - low);
  const r3 = high + 2 * (pp - low);
  const s1 = 2 * pp - high;
  const s2 = pp - (high - low);
  const s3 = low - 2 * (high - pp);
  const cprTop = (high + low) / 2;
  const cprBottom = pp;
  return { pp, r1, r2, r3, s1, s2, s3, cprTop, cprBottom };
}

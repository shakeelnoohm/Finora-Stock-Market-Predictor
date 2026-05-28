import { StockDataPoint } from "./types";

export interface TechnicalIndicators {
  rsi: number;
  macd: number;
  macdSignal: number;
  macdHistogram: number;
  sma20: number;
  sma50: number;
  ema12: number;
  ema26: number;
  bollingerUpper: number;
  bollingerMiddle: number;
  bollingerLower: number;
  bollingerWidth: number;
  atr: number;
  momentum: number;
  volumeRatio: number;
  priceVsSma20: number;
  priceVsSma50: number;
}

export interface StockScore {
  symbol: string;
  name: string;
  price: number;
  changePercent: number;
  score: number;
  signal: "Strong Buy" | "Buy" | "Hold" | "Sell" | "Strong Sell";
  reasons: string[];
  risks: string[];
  indicators: TechnicalIndicators;
  riskLevel: "Low" | "Medium" | "High";
  momentum: "Bullish" | "Neutral" | "Bearish";
  confidence: number;
}

function sma(data: number[], period: number): number {
  if (data.length < period) return data[data.length - 1] ?? 0;
  const slice = data.slice(-period);
  return slice.reduce((a, b) => a + b, 0) / period;
}

function ema(data: number[], period: number): number[] {
  const k = 2 / (period + 1);
  const result: number[] = [];
  let prev = data[0];
  for (const val of data) {
    const e = val * k + prev * (1 - k);
    result.push(e);
    prev = e;
  }
  return result;
}

function calcRSI(closes: number[], period = 14): number {
  if (closes.length < period + 1) return 50;
  const changes = closes.slice(1).map((v, i) => v - closes[i]);
  const recent = changes.slice(-period);
  const gains = recent.filter((c) => c > 0).reduce((a, b) => a + b, 0) / period;
  const losses = Math.abs(recent.filter((c) => c < 0).reduce((a, b) => a + b, 0)) / period;
  if (losses === 0) return 100;
  const rs = gains / losses;
  return 100 - 100 / (1 + rs);
}

function calcATR(data: StockDataPoint[], period = 14): number {
  if (data.length < 2) return 0;
  const trs = data.slice(1).map((d, i) => {
    const prev = data[i].close;
    return Math.max(d.high - d.low, Math.abs(d.high - prev), Math.abs(d.low - prev));
  });
  return sma(trs, period);
}

function calcBollinger(closes: number[], period = 20) {
  const middle = sma(closes, period);
  const slice = closes.slice(-period);
  const variance = slice.reduce((sum, v) => sum + Math.pow(v - middle, 2), 0) / period;
  const std = Math.sqrt(variance);
  return {
    upper: middle + 2 * std,
    middle,
    lower: middle - 2 * std,
    width: (4 * std) / middle,
  };
}

export function computeIndicators(data: StockDataPoint[]): TechnicalIndicators {
  const closes = data.map((d) => d.close);
  const volumes = data.map((d) => d.volume);

  const ema12 = ema(closes, 12);
  const ema26 = ema(closes, 26);
  const macdLine = ema12.map((v, i) => v - ema26[i]);
  const signalLine = ema(macdLine, 9);
  const lastMACD = macdLine[macdLine.length - 1];
  const lastSignal = signalLine[signalLine.length - 1];

  const boll = calcBollinger(closes);
  const avgVol = sma(volumes, 20);
  const lastVol = volumes[volumes.length - 1];
  const price = closes[closes.length - 1];
  const s20 = sma(closes, 20);
  const s50 = sma(closes, 50);

  const momentum10 = closes.length >= 10
    ? ((price - closes[closes.length - 10]) / closes[closes.length - 10]) * 100
    : 0;

  return {
    rsi: calcRSI(closes),
    macd: lastMACD,
    macdSignal: lastSignal,
    macdHistogram: lastMACD - lastSignal,
    sma20: s20,
    sma50: s50,
    ema12: ema12[ema12.length - 1],
    ema26: ema26[ema26.length - 1],
    bollingerUpper: boll.upper,
    bollingerMiddle: boll.middle,
    bollingerLower: boll.lower,
    bollingerWidth: boll.width,
    atr: calcATR(data),
    momentum: momentum10,
    volumeRatio: avgVol > 0 ? lastVol / avgVol : 1,
    priceVsSma20: ((price - s20) / s20) * 100,
    priceVsSma50: ((price - s50) / s50) * 100,
  };
}

export function scoreStock(
  symbol: string,
  name: string,
  data: StockDataPoint[],
  changePercent: number
): StockScore {
  const ind = computeIndicators(data);
  const price = data[data.length - 1].close;
  const reasons: string[] = [];
  const risks: string[] = [];
  let score = 50;

  // RSI signals
  if (ind.rsi < 30) { score += 20; reasons.push(`RSI ${ind.rsi.toFixed(1)} — Oversold (potential reversal)`); }
  else if (ind.rsi < 45) { score += 10; reasons.push(`RSI ${ind.rsi.toFixed(1)} — Below neutral, potential upside`); }
  else if (ind.rsi > 70) { score -= 20; risks.push(`RSI ${ind.rsi.toFixed(1)} — Overbought (pullback risk)`); }
  else if (ind.rsi > 60) { score -= 5; risks.push(`RSI ${ind.rsi.toFixed(1)} — Approaching overbought`); }
  else { reasons.push(`RSI ${ind.rsi.toFixed(1)} — Neutral zone`); }

  // MACD signals
  if (ind.macdHistogram > 0 && ind.macd > ind.macdSignal) {
    score += 15; reasons.push("MACD bullish crossover — upward momentum");
  } else if (ind.macdHistogram < 0 && ind.macd < ind.macdSignal) {
    score -= 15; risks.push("MACD bearish crossover — downward momentum");
  }

  // Bollinger Band signals
  if (price < ind.bollingerLower) { score += 15; reasons.push("Price below lower Bollinger Band — mean reversion likely"); }
  else if (price > ind.bollingerUpper) { score -= 15; risks.push("Price above upper Bollinger Band — overextended"); }
  else if (price < ind.bollingerMiddle) { score += 5; reasons.push("Price below Bollinger midline — room to grow"); }

  // Moving average signals
  if (ind.priceVsSma20 < -3) { score += 10; reasons.push(`Price ${Math.abs(ind.priceVsSma20).toFixed(1)}% below 20-day MA — potential bounce`); }
  else if (ind.priceVsSma20 > 5) { score -= 8; risks.push(`Price ${ind.priceVsSma20.toFixed(1)}% above 20-day MA — stretched`); }

  if (ind.sma20 > ind.sma50) { score += 8; reasons.push("20-day MA above 50-day MA — bullish trend"); }
  else { score -= 8; risks.push("20-day MA below 50-day MA — bearish trend"); }

  // Volume signals
  if (ind.volumeRatio > 1.5) { score += 10; reasons.push(`Volume ${ind.volumeRatio.toFixed(1)}x above average — strong interest`); }
  else if (ind.volumeRatio < 0.5) { score -= 5; risks.push("Below-average volume — weak conviction"); }

  // Momentum signals
  if (ind.momentum > 5) { score += 10; reasons.push(`+${ind.momentum.toFixed(1)}% 10-day momentum — bullish`); }
  else if (ind.momentum < -5) { score -= 10; risks.push(`${ind.momentum.toFixed(1)}% 10-day momentum — bearish`); }

  // Today's change
  if (changePercent < -2) { score += 8; reasons.push(`Down ${Math.abs(changePercent).toFixed(1)}% today — possible buy-the-dip opportunity`); }
  else if (changePercent > 3) { score -= 5; risks.push(`Up ${changePercent.toFixed(1)}% today — chasing momentum risk`); }

  score = Math.max(0, Math.min(100, score));

  const signal: StockScore["signal"] =
    score >= 78 ? "Strong Buy" :
    score >= 60 ? "Buy" :
    score >= 40 ? "Hold" :
    score >= 25 ? "Sell" : "Strong Sell";

  const riskLevel: StockScore["riskLevel"] =
    ind.atr / price > 0.025 ? "High" :
    ind.atr / price > 0.015 ? "Medium" : "Low";

  const momentum: StockScore["momentum"] =
    ind.momentum > 3 ? "Bullish" : ind.momentum < -3 ? "Bearish" : "Neutral";

  const confidence = Math.min(95, 50 + Math.abs(score - 50) * 0.9);

  return {
    symbol, name, price, changePercent,
    score, signal, reasons, risks,
    indicators: ind,
    riskLevel, momentum, confidence,
  };
}

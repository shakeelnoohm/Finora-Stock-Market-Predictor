export interface Holding {
  id: string;
  symbol: string;
  name: string;
  qty: number;
  avgBuyPrice: number;
  buyDate: string;
  sector: string;
}

export interface HoldingWithLive extends Holding {
  livePrice: number;
  currentValue: number;
  investedValue: number;
  pnl: number;
  pnlPercent: number;
  dayChange: number;
  dayChangePercent: number;
}

export const SECTOR_MAP: Record<string, string> = {
  RELIANCE: "Energy",
  ONGC: "Energy",
  TCS: "IT",
  INFY: "IT",
  WIPRO: "IT",
  HCLTECH: "IT",
  HDFCBANK: "Banking",
  ICICIBANK: "Banking",
  SBIN: "Banking",
  KOTAKBANK: "Banking",
  AXISBANK: "Banking",
  BHARTIARTL: "Telecom",
  ITC: "FMCG",
  HINDUNILVR: "FMCG",
  LT: "Infrastructure",
  BAJFINANCE: "NBFC",
  TATAMOTORS: "Auto",
  SUNPHARMA: "Pharma",
  TITAN: "Consumer",
  ADANIENT: "Conglomerate",
};

export function calcXIRR(holdings: HoldingWithLive[]): number {
  if (!holdings.length) return 0;
  const totalInvested = holdings.reduce((s, h) => s + h.investedValue, 0);
  const totalCurrent = holdings.reduce((s, h) => s + h.currentValue, 0);
  if (totalInvested === 0) return 0;
  const avgDays = holdings.reduce((s, h) => {
    const days = (Date.now() - new Date(h.buyDate).getTime()) / 86400000;
    return s + days * (h.investedValue / totalInvested);
  }, 0);
  if (avgDays <= 0) return 0;
  const years = avgDays / 365;
  return (Math.pow(totalCurrent / totalInvested, 1 / years) - 1) * 100;
}

export function getSectorBreakdown(holdings: HoldingWithLive[]) {
  const map: Record<string, number> = {};
  const total = holdings.reduce((s, h) => s + h.currentValue, 0);
  for (const h of holdings) {
    const sec = h.sector;
    map[sec] = (map[sec] ?? 0) + h.currentValue;
  }
  return Object.entries(map).map(([name, value]) => ({
    name,
    value,
    percent: total > 0 ? (value / total) * 100 : 0,
  }));
}

export function loadPortfolio(): Holding[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem("portfolio") ?? "[]");
  } catch {
    return [];
  }
}

export function savePortfolio(holdings: Holding[]) {
  localStorage.setItem("portfolio", JSON.stringify(holdings));
}

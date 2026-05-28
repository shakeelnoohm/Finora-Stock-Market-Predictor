"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { RefreshCw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatPercent, cn } from "@/lib/utils";
import { StockScore } from "@/lib/indicators";

const SECTOR_GROUPS: Record<string, string[]> = {
  "IT":            ["TCS", "INFY", "WIPRO", "HCLTECH"],
  "Banking":       ["HDFCBANK", "ICICIBANK", "SBIN", "KOTAKBANK", "AXISBANK"],
  "FMCG":          ["HINDUNILVR", "ITC"],
  "Energy":        ["RELIANCE", "ONGC"],
  "Infrastructure":["LT"],
  "NBFC":          ["BAJFINANCE"],
  "Telecom":       ["BHARTIARTL"],
  "Auto":          ["TATAMOTORS"],
  "Pharma":        ["SUNPHARMA"],
  "Consumer":      ["TITAN"],
  "Conglomerate":  ["ADANIENT"],
};

function heatColor(pct: number): string {
  if (pct >= 3)  return "bg-emerald-600 text-white";
  if (pct >= 1.5) return "bg-emerald-500 text-white";
  if (pct >= 0.5) return "bg-emerald-400 text-white";
  if (pct >= 0)  return "bg-emerald-200 text-emerald-900 dark:bg-emerald-900 dark:text-emerald-200";
  if (pct >= -0.5) return "bg-red-200 text-red-900 dark:bg-red-900 dark:text-red-200";
  if (pct >= -1.5) return "bg-red-400 text-white";
  if (pct >= -3) return "bg-red-500 text-white";
  return "bg-red-600 text-white";
}

export default function HeatmapPage() {
  const [scores, setScores] = useState<Record<string, StockScore>>({});
  const [loading, setLoading] = useState(true);

  async function fetchAll() {
    setLoading(true);
    try {
      const res = await fetch("/api/stock/screen");
      const data: StockScore[] = await res.json();
      const map: Record<string, StockScore> = {};
      data.forEach((s) => { map[s.symbol] = s; });
      setScores(map);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchAll(); }, []);

  const sectorAvg = Object.entries(SECTOR_GROUPS).map(([sector, syms]) => {
    const loaded = syms.map((s) => scores[s]).filter(Boolean);
    const avg = loaded.length
      ? loaded.reduce((sum, s) => sum + s.changePercent, 0) / loaded.length
      : 0;
    return { sector, avg };
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Sector Heatmap</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            NSE sector performance at a glance
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2 text-[10px] font-medium">
            {[["≥3%", "bg-emerald-600"], ["1.5%", "bg-emerald-400"], ["0%", "bg-emerald-200"], ["-1.5%", "bg-red-300"], ["≤-3%", "bg-red-600"]].map(([lbl, cls]) => (
              <span key={lbl} className="flex items-center gap-1">
                <span className={cn("w-3 h-3 rounded", cls)} />
                <span className="text-gray-500">{lbl}</span>
              </span>
            ))}
          </div>
          <Button variant="outline" onClick={fetchAll} disabled={loading}>
            <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
          </Button>
        </div>
      </div>

      {/* Sector summary row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
        {sectorAvg.map(({ sector, avg }) => (
          <div key={sector} className={cn("rounded-xl p-3 text-center transition-all", heatColor(avg))}>
            <p className="text-xs font-bold">{sector}</p>
            <p className="text-sm font-mono font-bold mt-0.5">{formatPercent(avg)}</p>
          </div>
        ))}
      </div>

      {/* Stock-level heatmap by sector */}
      <div className="space-y-6">
        {Object.entries(SECTOR_GROUPS).map(([sector, syms]) => (
          <Card key={sector}>
            <CardHeader>
              <CardTitle>{sector}</CardTitle>
              <span className={cn("text-xs font-bold px-2 py-0.5 rounded-full", heatColor(sectorAvg.find((s) => s.sector === sector)?.avg ?? 0))}>
                {formatPercent(sectorAvg.find((s) => s.sector === sector)?.avg ?? 0)} avg
              </span>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {syms.map((sym) => {
                  const s = scores[sym];
                  if (loading || !s) return (
                    <div key={sym} className="h-20 bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse" />
                  );
                  return (
                    <Link key={sym} href={`/predict?symbol=${sym}`}>
                      <div className={cn("rounded-xl p-3 cursor-pointer hover:scale-105 transition-transform", heatColor(s.changePercent))}>
                        <p className="font-mono font-bold text-sm">{s.symbol}</p>
                        <p className="text-[10px] opacity-80 truncate">{s.name}</p>
                        <p className="text-base font-bold mt-1">{formatCurrency(s.price)}</p>
                        <p className="text-xs font-semibold">{formatPercent(s.changePercent)}</p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

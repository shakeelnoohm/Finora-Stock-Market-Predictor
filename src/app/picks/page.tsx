"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  RefreshCw, TrendingUp, TrendingDown, ShieldCheck, ShieldAlert,
  ShieldX, Zap, BrainCircuit, ChevronRight, Info,
} from "lucide-react";
import { StockScore } from "@/lib/indicators";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SignalBadge } from "@/components/stock/SignalBadge";
import { ScoreGauge } from "@/components/stock/ScoreGauge";
import { IndicatorPanel } from "@/components/stock/IndicatorPanel";
import { formatCurrency, formatPercent, cn } from "@/lib/utils";

const RISK_ICON = {
  Low: ShieldCheck,
  Medium: ShieldAlert,
  High: ShieldX,
};

const RISK_COLOR = {
  Low: "text-emerald-500",
  Medium: "text-amber-500",
  High: "text-red-500",
};

const MOM_COLOR = {
  Bullish: "text-emerald-500",
  Neutral: "text-amber-500",
  Bearish: "text-red-500",
};

export default function PicksPage() {
  const [stocks, setStocks] = useState<StockScore[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<StockScore | null>(null);
  const [filter, setFilter] = useState<"All" | "Buy" | "Hold" | "Sell">("All");
  const [sortBy, setSortBy] = useState<"score" | "rsi" | "momentum" | "change">("score");

  async function fetchScreener() {
    setLoading(true);
    try {
      const res = await fetch("/api/stock/screen");
      const data: StockScore[] = await res.json();
      setStocks(data);
      setSelected(data[0] ?? null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchScreener();
  }, []);

  const filtered = stocks
    .filter((s) => {
      if (filter === "All") return true;
      if (filter === "Buy") return s.signal === "Buy" || s.signal === "Strong Buy";
      if (filter === "Hold") return s.signal === "Hold";
      if (filter === "Sell") return s.signal === "Sell" || s.signal === "Strong Sell";
      return true;
    })
    .sort((a, b) => {
      if (sortBy === "score") return b.score - a.score;
      if (sortBy === "rsi") return a.indicators.rsi - b.indicators.rsi;
      if (sortBy === "momentum") return b.indicators.momentum - a.indicators.momentum;
      if (sortBy === "change") return b.changePercent - a.changePercent;
      return 0;
    });

  const topBuys = stocks.filter((s) => s.signal === "Strong Buy" || s.signal === "Buy").slice(0, 3);
  const topDate = new Date().toLocaleDateString("en-IN", { weekday: "long", month: "long", day: "numeric", timeZone: "Asia/Kolkata" });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Daily Stock Picks</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            AI-ranked NSE stocks to consider buying today — {topDate}
          </p>
        </div>
        <Button variant="outline" onClick={fetchScreener} disabled={loading}>
          <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
          Refresh Analysis
        </Button>
      </div>

      {/* Top 3 Picks Hero */}
      {!loading && topBuys.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Zap className="h-4 w-4 text-amber-500" />
            <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Top Picks for Today</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {topBuys.map((s, i) => (
              <button
                key={s.symbol}
                onClick={() => setSelected(s)}
                className={cn(
                  "text-left rounded-xl border p-4 transition-all hover:shadow-md",
                  i === 0
                    ? "border-emerald-400 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-950/30"
                    : "border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900",
                  selected?.symbol === s.symbol && "ring-2 ring-indigo-500"
                )}
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    {i === 0 && (
                      <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wide mb-1 block">
                        🏆 Best Pick
                      </span>
                    )}
                    <span className="font-mono font-bold text-lg text-gray-900 dark:text-white">{s.symbol}</span>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[130px]">{s.name}</p>
                  </div>
                  <ScoreGauge score={s.score} size="sm" />
                </div>
                <div className="flex items-center justify-between mt-3">
                  <div>
                    <p className="text-base font-bold text-gray-900 dark:text-white">{formatCurrency(s.price)}</p>
                    <p className={cn("text-xs font-medium", s.changePercent >= 0 ? "text-emerald-500" : "text-red-500")}>
                      {formatPercent(s.changePercent)}
                    </p>
                  </div>
                  <SignalBadge signal={s.signal} size="sm" />
                </div>
                <p className="mt-2 text-[11px] text-gray-500 dark:text-gray-400 line-clamp-2">
                  {s.reasons[0]}
                </p>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left: Full ranked list */}
        <div className="xl:col-span-2 space-y-4">
          {/* Filters & Sort */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex gap-1">
              {(["All", "Buy", "Hold", "Sell"] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-xs font-medium transition-colors",
                    filter === f
                      ? "bg-indigo-600 text-white"
                      : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
                  )}
                >
                  {f}
                  {f !== "All" && (
                    <span className="ml-1 opacity-70">
                      ({stocks.filter((s) => {
                        if (f === "Buy") return s.signal === "Buy" || s.signal === "Strong Buy";
                        if (f === "Hold") return s.signal === "Hold";
                        if (f === "Sell") return s.signal === "Sell" || s.signal === "Strong Sell";
                        return true;
                      }).length})
                    </span>
                  )}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
              <span>Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                className="bg-gray-100 dark:bg-gray-800 border-0 rounded-lg px-2 py-1.5 text-xs text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-indigo-500 cursor-pointer"
              >
                <option value="score">Score</option>
                <option value="rsi">RSI (Oversold first)</option>
                <option value="momentum">Momentum</option>
                <option value="change">Today's Change</option>
              </select>
            </div>
          </div>

          {/* Stock Table */}
          <Card>
            <CardContent className="pt-0 pb-0">
              {loading ? (
                <div className="space-y-0">
                  {[...Array(8)].map((_, i) => (
                    <div key={i} className="flex items-center gap-4 py-4 px-4 border-b border-gray-100 dark:border-gray-800">
                      <div className="h-10 w-10 bg-gray-200 dark:bg-gray-800 rounded-full animate-pulse" />
                      <div className="flex-1 space-y-2">
                        <div className="h-3 w-24 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
                        <div className="h-2 w-36 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" />
                      </div>
                      <div className="h-8 w-20 bg-gray-200 dark:bg-gray-800 rounded-lg animate-pulse" />
                    </div>
                  ))}
                </div>
              ) : filtered.length === 0 ? (
                <div className="py-12 text-center text-sm text-gray-500 dark:text-gray-400">
                  No stocks match this filter.
                </div>
              ) : (
                <div>
                  {filtered.map((s, i) => {
                    const RiskIcon = RISK_ICON[s.riskLevel];
                    const isSelected = selected?.symbol === s.symbol;
                    return (
                      <button
                        key={s.symbol}
                        onClick={() => setSelected(s)}
                        className={cn(
                          "w-full flex items-center gap-4 px-4 py-3.5 border-b border-gray-100 dark:border-gray-800 last:border-0 transition-colors text-left",
                          isSelected
                            ? "bg-indigo-50 dark:bg-indigo-950/40"
                            : "hover:bg-gray-50 dark:hover:bg-gray-800/50"
                        )}
                      >
                        {/* Rank */}
                        <span className="text-xs font-bold text-gray-400 dark:text-gray-600 w-4 shrink-0">
                          {i + 1}
                        </span>

                        {/* Score gauge */}
                        <ScoreGauge score={s.score} size="sm" showLabel={false} />

                        {/* Symbol & name */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-sm text-gray-900 dark:text-white">{s.symbol}</span>
                            <SignalBadge signal={s.signal} size="sm" />
                          </div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{s.name}</p>
                        </div>

                        {/* Price & change */}
                        <div className="text-right shrink-0 hidden sm:block">
                          <p className="text-sm font-mono font-semibold text-gray-900 dark:text-white">{formatCurrency(s.price)}</p>
                          <p className={cn("text-xs font-medium", s.changePercent >= 0 ? "text-emerald-500" : "text-red-500")}>
                            {s.changePercent >= 0 ? <TrendingUp className="h-3 w-3 inline mr-0.5" /> : <TrendingDown className="h-3 w-3 inline mr-0.5" />}
                            {formatPercent(s.changePercent)}
                          </p>
                        </div>

                        {/* RSI */}
                        <div className="text-right shrink-0 hidden md:block w-14">
                          <p className="text-[10px] text-gray-400">RSI</p>
                          <p className={cn(
                            "text-sm font-mono font-bold",
                            s.indicators.rsi < 30 ? "text-emerald-500" :
                            s.indicators.rsi > 70 ? "text-red-500" : "text-gray-700 dark:text-gray-300"
                          )}>
                            {s.indicators.rsi.toFixed(0)}
                          </p>
                        </div>

                        {/* Risk */}
                        <div className="shrink-0 hidden sm:flex items-center gap-1">
                          <RiskIcon className={cn("h-3.5 w-3.5", RISK_COLOR[s.riskLevel])} />
                          <span className={cn("text-[10px] font-medium", RISK_COLOR[s.riskLevel])}>{s.riskLevel}</span>
                        </div>

                        {/* Momentum */}
                        <div className={cn("shrink-0 hidden md:block text-[10px] font-semibold w-14 text-right", MOM_COLOR[s.momentum])}>
                          {s.momentum}
                        </div>

                        <ChevronRight className="h-4 w-4 text-gray-400 shrink-0" />
                      </button>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Disclaimer */}
          <div className="flex items-start gap-2 p-3 rounded-lg border border-amber-200 dark:border-amber-900 bg-amber-50 dark:bg-amber-950/30 text-[11px] text-amber-700 dark:text-amber-400">
            <Info className="h-3.5 w-3.5 shrink-0 mt-0.5" />
            Scores are based on technical indicators only (RSI, MACD, Bollinger Bands, Moving Averages, Volume). Not financial advice. Always do your own research before investing.
          </div>
        </div>

        {/* Right: Detail panel */}
        <div className="space-y-4">
          {selected ? (
            <>
              {/* Stock Detail Card */}
              <Card>
                <CardContent className="pt-5">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <p className="font-mono font-bold text-xl text-gray-900 dark:text-white">{selected.symbol}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{selected.name}</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{formatCurrency(selected.price)}</p>
                      <p className={cn("text-sm font-medium", selected.changePercent >= 0 ? "text-emerald-500" : "text-red-500")}>
                        {formatPercent(selected.changePercent)} today
                      </p>
                    </div>
                    <ScoreGauge score={selected.score} size="lg" />
                  </div>

                  <div className="flex items-center gap-2 flex-wrap mb-4">
                    <SignalBadge signal={selected.signal} size="md" />
                    <span className={cn("text-xs font-medium flex items-center gap-1", RISK_COLOR[selected.riskLevel])}>
                      {(() => { const I = RISK_ICON[selected.riskLevel]; return <I className="h-3.5 w-3.5" />; })()}
                      {selected.riskLevel} Risk
                    </span>
                    <span className={cn("text-xs font-medium", MOM_COLOR[selected.momentum])}>
                      {selected.momentum} Momentum
                    </span>
                  </div>

                  <div className="mb-3">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-gray-500">Confidence</span>
                      <span className="font-medium text-gray-900 dark:text-white">{selected.confidence.toFixed(0)}%</span>
                    </div>
                    <div className="h-1.5 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
                      <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${selected.confidence}%` }} />
                    </div>
                  </div>

                  {/* Reasons */}
                  {selected.reasons.length > 0 && (
                    <div className="space-y-1.5 mb-3">
                      <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wide">Bullish Signals</p>
                      {selected.reasons.map((r, i) => (
                        <div key={i} className="flex items-start gap-1.5 text-xs text-gray-600 dark:text-gray-300">
                          <span className="text-emerald-500 mt-0.5 shrink-0">↑</span>
                          {r}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Risks */}
                  {selected.risks.length > 0 && (
                    <div className="space-y-1.5">
                      <p className="text-xs font-semibold text-red-500 uppercase tracking-wide">Risk Factors</p>
                      {selected.risks.map((r, i) => (
                        <div key={i} className="flex items-start gap-1.5 text-xs text-gray-600 dark:text-gray-300">
                          <span className="text-red-400 mt-0.5 shrink-0">↓</span>
                          {r}
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="mt-4 flex gap-2">
                    <Link href={`/predict?symbol=${selected.symbol}`} className="flex-1">
                      <Button className="w-full" size="sm">
                        <BrainCircuit className="h-3.5 w-3.5" />
                        AI Forecast
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>

              {/* Technical Indicators */}
              <IndicatorPanel indicators={selected.indicators} price={selected.price} />
            </>
          ) : (
            <Card>
              <CardContent className="py-12 text-center text-sm text-gray-500 dark:text-gray-400">
                Select a stock to see its detailed analysis.
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

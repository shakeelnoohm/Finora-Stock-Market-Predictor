"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, X, BrainCircuit } from "lucide-react";
import Link from "next/link";
import { StockScore } from "@/lib/indicators";
import { StockSearch } from "@/components/stock/StockSearch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SignalBadge } from "@/components/stock/SignalBadge";
import { ScoreGauge } from "@/components/stock/ScoreGauge";
import { formatCurrency, formatPercent, cn } from "@/lib/utils";

const MAX_STOCKS = 3;

const COMPARE_ROWS: { label: string; key: string; format?: (v: number) => string; positive?: "high" | "low" }[] = [
  { label: "Price", key: "price", format: formatCurrency },
  { label: "Today's Change", key: "changePercent", format: (v) => formatPercent(v), positive: "high" },
  { label: "AI Score", key: "score", positive: "high" },
  { label: "RSI (14)", key: "rsi", positive: "low" },
  { label: "MACD Histogram", key: "macdHistogram", positive: "high", format: (v) => v.toFixed(3) },
  { label: "SMA 20", key: "sma20", format: formatCurrency },
  { label: "SMA 50", key: "sma50", format: formatCurrency },
  { label: "Momentum (10d %)", key: "momentum", format: (v) => `${v.toFixed(2)}%`, positive: "high" },
  { label: "Volume Ratio", key: "volumeRatio", format: (v) => `${v.toFixed(2)}x`, positive: "high" },
  { label: "ATR", key: "atr", format: formatCurrency },
  { label: "Bollinger Width", key: "bollingerWidth", format: (v) => `${(v * 100).toFixed(2)}%` },
];

function getVal(stock: StockScore, key: string): number {
  if (key === "price") return stock.price;
  if (key === "changePercent") return stock.changePercent;
  if (key === "score") return stock.score;
  return (stock.indicators as unknown as Record<string, number>)[key] ?? 0;
}

export default function ComparePage() {
  const [symbols, setSymbols] = useState<string[]>(["AAPL", "MSFT"]);
  const [stocks, setStocks] = useState<Record<string, StockScore>>({});
  const [loading, setLoading] = useState<Record<string, boolean>>({});

  const loadStock = useCallback(async (symbol: string) => {
    setLoading((prev) => ({ ...prev, [symbol]: true }));
    try {
      const res = await fetch(`/api/stock/indicators?symbol=${symbol}`);
      const data: StockScore = await res.json();
      setStocks((prev) => ({ ...prev, [symbol]: data }));
    } finally {
      setLoading((prev) => ({ ...prev, [symbol]: false }));
    }
  }, []);

  useEffect(() => {
    symbols.forEach((s) => loadStock(s));
  }, []);

  function addStock(symbol: string) {
    if (symbols.includes(symbol) || symbols.length >= MAX_STOCKS) return;
    setSymbols((prev) => [...prev, symbol]);
    loadStock(symbol);
  }

  function removeStock(symbol: string) {
    setSymbols((prev) => prev.filter((s) => s !== symbol));
    setStocks((prev) => { const n = { ...prev }; delete n[symbol]; return n; });
  }

  const loadedStocks = symbols.map((s) => stocks[s]).filter(Boolean) as StockScore[];

  function getBest(key: string, positive: "high" | "low" | undefined): string | null {
    if (!positive || loadedStocks.length < 2) return null;
    const vals = loadedStocks.map((s) => ({ symbol: s.symbol, val: getVal(s, key) }));
    const best = positive === "high"
      ? vals.reduce((a, b) => (b.val > a.val ? b : a))
      : vals.reduce((a, b) => (b.val < a.val ? b : a));
    return best.symbol;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Compare Stocks</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            Side-by-side technical analysis of up to {MAX_STOCKS} stocks
          </p>
        </div>
        {symbols.length < MAX_STOCKS && (
          <StockSearch
            onSelect={(sym) => addStock(sym)}
            className="w-64"
          />
        )}
      </div>

      {/* Stock header cards */}
      <div className={cn("grid gap-4", `grid-cols-${symbols.length + (symbols.length < MAX_STOCKS ? 1 : 0)}`)}>
        {symbols.map((sym) => {
          const s = stocks[sym];
          const isLoading = loading[sym];
          return (
            <Card key={sym} className="relative">
              <button
                onClick={() => removeStock(sym)}
                className="absolute top-3 right-3 text-gray-400 hover:text-red-500 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
              <CardContent className="pt-5 pb-5">
                {isLoading || !s ? (
                  <div className="space-y-3 animate-pulse">
                    <div className="h-6 w-16 bg-gray-200 dark:bg-gray-800 rounded" />
                    <div className="h-4 w-28 bg-gray-100 dark:bg-gray-800 rounded" />
                    <div className="h-10 w-24 bg-gray-200 dark:bg-gray-800 rounded" />
                  </div>
                ) : (
                  <>
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="font-mono font-bold text-lg text-gray-900 dark:text-white">{s.symbol}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[120px]">{s.name}</p>
                      </div>
                      <ScoreGauge score={s.score} size="sm" />
                    </div>
                    <p className="text-xl font-bold text-gray-900 dark:text-white">{formatCurrency(s.price)}</p>
                    <p className={cn("text-sm font-medium", s.changePercent >= 0 ? "text-emerald-500" : "text-red-500")}>
                      {formatPercent(s.changePercent)}
                    </p>
                    <div className="mt-2">
                      <SignalBadge signal={s.signal} size="sm" />
                    </div>
                    <Link href={`/predict?symbol=${s.symbol}`} className="block mt-3">
                      <Button size="sm" variant="outline" className="w-full">
                        <BrainCircuit className="h-3.5 w-3.5" /> AI Forecast
                      </Button>
                    </Link>
                  </>
                )}
              </CardContent>
            </Card>
          );
        })}
        {symbols.length < MAX_STOCKS && (
          <Card className="border-dashed border-2 bg-transparent">
            <CardContent className="pt-0 h-full flex flex-col items-center justify-center py-10 gap-3">
              <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                <Plus className="h-5 w-5 text-gray-400" />
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                Search above to add a stock
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Comparison Table */}
      {loadedStocks.length >= 2 && (
        <Card>
          <CardHeader>
            <CardTitle>Comparison Table</CardTitle>
          </CardHeader>
          <CardContent className="pt-0 pb-0 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-800">
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 dark:text-gray-400">Metric</th>
                  {loadedStocks.map((s) => (
                    <th key={s.symbol} className="text-right py-3 px-4 text-xs font-bold text-gray-900 dark:text-white font-mono">{s.symbol}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {COMPARE_ROWS.map((row) => {
                  const bestSym = getBest(row.key, row.positive);
                  return (
                    <tr key={row.key} className="border-b border-gray-100 dark:border-gray-800 last:border-0">
                      <td className="py-3 px-4 text-xs text-gray-500 dark:text-gray-400">{row.label}</td>
                      {loadedStocks.map((s) => {
                        const val = getVal(s, row.key);
                        const isBest = s.symbol === bestSym;
                        return (
                          <td key={s.symbol} className={cn(
                            "py-3 px-4 text-right text-xs font-mono font-medium",
                            isBest ? "text-emerald-500 font-bold" : "text-gray-700 dark:text-gray-300"
                          )}>
                            {row.format ? row.format(val) : val.toFixed(2)}
                            {isBest && <span className="ml-1 text-[9px]">✓</span>}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
                <tr className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800">
                  <td className="py-3 px-4 text-xs font-semibold text-gray-700 dark:text-gray-300">Signal</td>
                  {loadedStocks.map((s) => (
                    <td key={s.symbol} className="py-3 px-4 text-right">
                      <div className="flex justify-end">
                        <SignalBadge signal={s.signal} size="sm" />
                      </div>
                    </td>
                  ))}
                </tr>
                <tr className="bg-gray-50 dark:bg-gray-800/50">
                  <td className="py-3 px-4 text-xs font-semibold text-gray-700 dark:text-gray-300">Risk Level</td>
                  {loadedStocks.map((s) => (
                    <td key={s.symbol} className={cn(
                      "py-3 px-4 text-right text-xs font-semibold",
                      s.riskLevel === "Low" ? "text-emerald-500" :
                      s.riskLevel === "Medium" ? "text-amber-500" : "text-red-500"
                    )}>
                      {s.riskLevel}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}

      {loadedStocks.length < 2 && !Object.values(loading).some(Boolean) && (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">Add at least 2 stocks to compare.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

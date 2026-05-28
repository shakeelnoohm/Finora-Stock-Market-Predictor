"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { RefreshCw, Zap, BrainCircuit, Search } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatPercent, cn } from "@/lib/utils";
import { ScanResult } from "@/lib/scanner";

const PATTERN_META: Record<string, { color: string; bull: boolean }> = {
  "Golden Cross":      { color: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200", bull: true },
  "Death Cross":       { color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200", bull: false },
  "RSI Reversal":      { color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200", bull: true },
  "Volume Breakout":   { color: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200", bull: true },
  "52W High Breakout": { color: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200", bull: true },
  "52W Low Bounce":    { color: "bg-sky-100 text-sky-800 dark:bg-sky-900 dark:text-sky-200", bull: true },
  "Bullish Engulfing": { color: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200", bull: true },
  "Bearish Engulfing": { color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200", bull: false },
  "Hammer":            { color: "bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200", bull: true },
  "Shooting Star":     { color: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200", bull: false },
};

type FilterType = "All" | "Bullish" | "Bearish";

export default function ScannerPage() {
  const [results, setResults] = useState<ScanResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>("All");
  const [search, setSearch] = useState("");

  async function runScan() {
    setLoading(true);
    try {
      const res = await fetch("/api/stock/scan");
      const data = await res.json();
      setResults(data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { runScan(); }, []);

  const filtered = results
    .filter((r) => {
      if (filter === "Bullish") return r.strength >= 2;
      if (filter === "Bearish") return r.strength <= 0;
      return true;
    })
    .filter((r) =>
      !search || r.symbol.includes(search.toUpperCase()) || r.name.toUpperCase().includes(search.toUpperCase())
    )
    .sort((a, b) => b.strength - a.strength);

  const bullish = results.filter((r) => r.strength >= 2).length;
  const bearish = results.filter((r) => r.strength === 0).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Swing Trade Scanner</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            Pattern recognition across all NSE stocks — Golden Cross, Engulfing, Hammers, Breakouts
          </p>
        </div>
        <Button variant="outline" onClick={runScan} disabled={loading}>
          <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
          Re-scan
        </Button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-4 pb-4">
            <p className="text-xs text-gray-500">Total Scanned</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{results.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4">
            <p className="text-xs text-gray-500">Bullish Setups</p>
            <p className="text-2xl font-bold text-emerald-500 mt-1">{bullish}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4">
            <p className="text-xs text-gray-500">Bearish Setups</p>
            <p className="text-2xl font-bold text-red-500 mt-1">{bearish}</p>
          </CardContent>
        </Card>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap gap-3 items-center justify-between">
        <div className="flex gap-1">
          {(["All", "Bullish", "Bearish"] as FilterType[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-medium transition-colors",
                filter === f ? "bg-indigo-600 text-white" : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
              )}
            >
              {f}
            </button>
          ))}
        </div>
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search symbol…"
            className="pl-8 pr-3 py-1.5 text-xs rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 w-40"
          />
        </div>
      </div>

      <Card>
        <CardContent className="pt-0 pb-0">
          {loading ? (
            <div className="space-y-0">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="flex items-center gap-4 py-4 px-4 border-b border-gray-100 dark:border-gray-800">
                  <div className="h-8 w-16 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
                  <div className="flex-1 flex gap-2">
                    {[...Array(3)].map((__, j) => (
                      <div key={j} className="h-5 w-20 bg-gray-100 dark:bg-gray-800 rounded-full animate-pulse" />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div>
              {filtered.map((r) => (
                <div key={r.symbol} className="flex items-center gap-4 px-4 py-3.5 border-b border-gray-100 dark:border-gray-800 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-800/40">
                  <div className="w-28 shrink-0">
                    <p className="font-mono font-bold text-sm text-gray-900 dark:text-white">{r.symbol}</p>
                    <p className="text-[10px] text-gray-500 truncate">{r.name}</p>
                  </div>
                  <div className="w-24 shrink-0 text-right">
                    <p className="text-sm font-mono text-gray-900 dark:text-white">{formatCurrency(r.price)}</p>
                    <p className={cn("text-xs", r.changePercent >= 0 ? "text-emerald-500" : "text-red-500")}>{formatPercent(r.changePercent)}</p>
                  </div>
                  <div className="flex flex-wrap gap-1.5 flex-1">
                    {r.patternLabels.map((p) => (
                      <span key={p} className={cn("px-2 py-0.5 rounded-full text-[10px] font-semibold", PATTERN_META[p]?.color ?? "bg-gray-100 text-gray-700")}>
                        {p}
                      </span>
                    ))}
                  </div>
                  <div className="shrink-0 flex items-center gap-1">
                    <span className="text-[10px] text-gray-500">Strength</span>
                    <div className="flex gap-0.5">
                      {[...Array(3)].map((_, i) => (
                        <div key={i} className={cn("w-2 h-4 rounded-sm", i < r.strength ? "bg-emerald-500" : "bg-gray-200 dark:bg-gray-700")} />
                      ))}
                    </div>
                  </div>
                  <Link href={`/predict?symbol=${r.symbol}`}>
                    <Button size="sm" variant="ghost">
                      <BrainCircuit className="h-3.5 w-3.5" />
                    </Button>
                  </Link>
                </div>
              ))}
              {filtered.length === 0 && (
                <div className="py-12 text-center text-sm text-gray-500">No results match this filter.</div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

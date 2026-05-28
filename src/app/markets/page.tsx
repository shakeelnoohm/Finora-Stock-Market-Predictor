"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { RefreshCw, BrainCircuit, TrendingUp, TrendingDown } from "lucide-react";
import { StockQuote } from "@/lib/types";
import { POPULAR_STOCKS } from "@/lib/constants";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StockChart } from "@/components/stock/StockChart";
import { StockDataPoint } from "@/lib/types";
import { formatCurrency, formatPercent, formatLargeNumber } from "@/lib/utils";

export default function MarketsPage() {
  const [quotes, setQuotes] = useState<StockQuote[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<StockQuote | null>(null);
  const [history, setHistory] = useState<StockDataPoint[]>([]);
  const [loadingChart, setLoadingChart] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  async function fetchAll() {
    setLoading(true);
    const results = await Promise.allSettled(
      POPULAR_STOCKS.map((s) =>
        fetch(`/api/stock/quote?symbol=${s.symbol}`).then((r) => r.json())
      )
    );
    const data = results
      .filter((r) => r.status === "fulfilled")
      .map((r) => (r as PromiseFulfilledResult<StockQuote>).value);
    setQuotes(data);
    setLastUpdated(new Date());
    if (data.length && !selected) setSelected(data[0]);
    setLoading(false);
  }

  useEffect(() => {
    fetchAll();
  }, []);

  useEffect(() => {
    if (!selected) return;
    setLoadingChart(true);
    fetch(`/api/stock/history?symbol=${selected.symbol}&range=1M`)
      .then((r) => r.json())
      .then((d) => { setHistory(d); setLoadingChart(false); });
  }, [selected]);

  const sorted = [...quotes].sort((a, b) => b.changePercent - a.changePercent);
  const marketUp = quotes.filter((q) => q.changePercent >= 0).length;
  const marketDown = quotes.length - marketUp;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Markets</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            {lastUpdated ? `Last updated: ${lastUpdated.toLocaleTimeString()}` : "Loading..."}
          </p>
        </div>
        <Button variant="outline" onClick={fetchAll} disabled={loading}>
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-5 pb-5">
            <p className="text-xs text-gray-500 dark:text-gray-400">Total Stocks</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{quotes.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5 pb-5">
            <p className="text-xs text-gray-500 dark:text-gray-400">Advancing</p>
            <p className="text-2xl font-bold text-emerald-500 mt-1">{marketUp}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5 pb-5">
            <p className="text-xs text-gray-500 dark:text-gray-400">Declining</p>
            <p className="text-2xl font-bold text-red-500 mt-1">{marketDown}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5 pb-5">
            <p className="text-xs text-gray-500 dark:text-gray-400">Market Sentiment</p>
            <p className={`text-2xl font-bold mt-1 ${marketUp >= marketDown ? "text-emerald-500" : "text-red-500"}`}>
              {marketUp >= marketDown ? "Bullish" : "Bearish"}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-4">
          {selected && (
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <span className="font-mono font-bold text-lg text-gray-900 dark:text-white">{selected.symbol}</span>
                  <Badge variant={selected.changePercent >= 0 ? "positive" : "negative"}>
                    {selected.changePercent >= 0 ? <TrendingUp className="h-3 w-3 mr-1 inline" /> : <TrendingDown className="h-3 w-3 mr-1 inline" />}
                    {formatPercent(selected.changePercent)}
                  </Badge>
                  <span className="text-xl font-bold text-gray-900 dark:text-white">{formatCurrency(selected.price)}</span>
                </div>
                <Link href={`/predict?symbol=${selected.symbol}`}>
                  <Button size="sm">
                    <BrainCircuit className="h-3.5 w-3.5" />
                    Predict
                  </Button>
                </Link>
              </CardHeader>
              <CardContent>
                {loadingChart ? (
                  <div className="h-[300px] flex items-center justify-center">
                    <RefreshCw className="h-6 w-6 animate-spin text-gray-400" />
                  </div>
                ) : (
                  <StockChart data={history} symbol={selected.symbol} />
                )}
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-3">
          <Card>
            <CardHeader>
              <CardTitle>All Stocks</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              {loading ? (
                <div className="space-y-2">
                  {[...Array(8)].map((_, i) => (
                    <div key={i} className="h-12 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse" />
                  ))}
                </div>
              ) : (
                <div className="space-y-1">
                  {sorted.map((q) => (
                    <button
                      key={q.symbol}
                      onClick={() => setSelected(q)}
                      className={`w-full flex items-center justify-between p-2.5 rounded-lg transition-colors text-left ${
                        selected?.symbol === q.symbol
                          ? "bg-indigo-50 dark:bg-indigo-950"
                          : "hover:bg-gray-50 dark:hover:bg-gray-800"
                      }`}
                    >
                      <div>
                        <p className="font-mono font-bold text-sm text-gray-900 dark:text-white">{q.symbol}</p>
                        <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate max-w-[110px]">{q.name}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{formatCurrency(q.price)}</p>
                        <p className={`text-xs font-medium ${q.changePercent >= 0 ? "text-emerald-500" : "text-red-500"}`}>
                          {formatPercent(q.changePercent)}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Full Market Overview</CardTitle>
        </CardHeader>
        <CardContent className="pt-0 pb-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-800">
                {["Symbol", "Name", "Price", "Change", "% Change", "Volume", "High", "Low", "Action"].map((h) => (
                  <th key={h} className={`py-3 px-4 text-xs font-medium text-gray-500 dark:text-gray-400 ${h === "Symbol" || h === "Name" ? "text-left" : "text-right"}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading
                ? [...Array(5)].map((_, i) => (
                    <tr key={i} className="border-b border-gray-100 dark:border-gray-800">
                      {[...Array(9)].map((__, j) => (
                        <td key={j} className="py-3 px-4">
                          <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" />
                        </td>
                      ))}
                    </tr>
                  ))
                : sorted.map((q) => (
                    <tr
                      key={q.symbol}
                      className="border-b border-gray-100 dark:border-gray-800 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer"
                      onClick={() => setSelected(q)}
                    >
                      <td className="py-3 px-4 font-mono font-bold text-gray-900 dark:text-white">{q.symbol}</td>
                      <td className="py-3 px-4 text-gray-600 dark:text-gray-400 max-w-[120px] truncate">{q.name}</td>
                      <td className="py-3 px-4 text-right font-mono">{formatCurrency(q.price)}</td>
                      <td className={`py-3 px-4 text-right font-mono ${q.change >= 0 ? "text-emerald-500" : "text-red-500"}`}>
                        {q.change >= 0 ? "+" : ""}{formatCurrency(q.change)}
                      </td>
                      <td className={`py-3 px-4 text-right font-mono ${q.changePercent >= 0 ? "text-emerald-500" : "text-red-500"}`}>
                        {formatPercent(q.changePercent)}
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-gray-600 dark:text-gray-400">{formatLargeNumber(q.volume)}</td>
                      <td className="py-3 px-4 text-right font-mono text-gray-600 dark:text-gray-400">{formatCurrency(q.high)}</td>
                      <td className="py-3 px-4 text-right font-mono text-gray-600 dark:text-gray-400">{formatCurrency(q.low)}</td>
                      <td className="py-3 px-4 text-right">
                        <Link href={`/predict?symbol=${q.symbol}`} onClick={(e) => e.stopPropagation()}>
                          <Button size="sm" variant="ghost">
                            <BrainCircuit className="h-3.5 w-3.5" />
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}

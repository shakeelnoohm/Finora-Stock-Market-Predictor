"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Star, BrainCircuit, Trash2, Plus } from "lucide-react";
import { StockQuote } from "@/lib/types";
import { StockCard } from "@/components/stock/StockCard";
import { StockSearch } from "@/components/stock/StockSearch";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency, formatPercent } from "@/lib/utils";

export default function WatchlistPage() {
  const [watchlist, setWatchlist] = useState<string[]>([]);
  const [quotes, setQuotes] = useState<Record<string, StockQuote>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("watchlist");
    if (saved) setWatchlist(JSON.parse(saved));
  }, []);

  useEffect(() => {
    if (!watchlist.length) return;
    setLoading(true);
    Promise.allSettled(
      watchlist.map((s) => fetch(`/api/stock/quote?symbol=${s}`).then((r) => r.json()))
    ).then((results) => {
      const map: Record<string, StockQuote> = {};
      results.forEach((r, i) => {
        if (r.status === "fulfilled") map[watchlist[i]] = r.value;
      });
      setQuotes(map);
      setLoading(false);
    });
  }, [watchlist]);

  function removeFromWatchlist(symbol: string) {
    setWatchlist((prev) => {
      const next = prev.filter((s) => s !== symbol);
      localStorage.setItem("watchlist", JSON.stringify(next));
      return next;
    });
  }

  function addToWatchlist(symbol: string) {
    setWatchlist((prev) => {
      if (prev.includes(symbol)) return prev;
      const next = [...prev, symbol];
      localStorage.setItem("watchlist", JSON.stringify(next));
      return next;
    });
  }

  const totalValue = Object.values(quotes).reduce((sum, q) => sum + q.price, 0);
  const gainCount = Object.values(quotes).filter((q) => q.changePercent >= 0).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Watchlist</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            Track your favourite stocks
          </p>
        </div>
        <StockSearch onSelect={(sym, name) => { addToWatchlist(sym); }} className="w-72" />
      </div>

      {watchlist.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-5 pb-5">
              <p className="text-xs text-gray-500 dark:text-gray-400">Tracked Stocks</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{watchlist.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-5 pb-5">
              <p className="text-xs text-gray-500 dark:text-gray-400">Gainers Today</p>
              <p className="text-2xl font-bold text-emerald-500 mt-1">{gainCount}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-5 pb-5">
              <p className="text-xs text-gray-500 dark:text-gray-400">Losers Today</p>
              <p className="text-2xl font-bold text-red-500 mt-1">{watchlist.length - gainCount}</p>
            </CardContent>
          </Card>
        </div>
      )}

      {watchlist.length === 0 ? (
        <Card>
          <CardContent className="py-16 flex flex-col items-center gap-4 text-center">
            <div className="w-14 h-14 rounded-2xl bg-amber-100 dark:bg-amber-950 flex items-center justify-center">
              <Star className="h-7 w-7 text-amber-500" />
            </div>
            <div>
              <p className="font-semibold text-gray-900 dark:text-white">No stocks yet</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Search for a stock above or star one from the Dashboard.
              </p>
            </div>
            <Link href="/">
              <Button variant="outline">
                <Plus className="h-4 w-4" />
                Browse Stocks
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {watchlist.map((s) => (
            <div key={s} className="h-36 bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : (
        <div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {watchlist.map((sym) => {
              const q = quotes[sym];
              if (!q) return null;
              return (
                <div key={sym} className="relative group">
                  <StockCard
                    quote={q}
                    onWatchlist
                    onToggleWatchlist={removeFromWatchlist}
                  />
                  <Link href={`/predict?symbol=${sym}`} className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button size="sm" variant="secondary">
                      <BrainCircuit className="h-3.5 w-3.5" />
                      Predict
                    </Button>
                  </Link>
                </div>
              );
            })}
          </div>

          <div className="mt-6">
            <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Performance Table</h2>
            <Card>
              <CardContent className="pt-0 pb-0">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 dark:border-gray-800">
                      <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 dark:text-gray-400">Symbol</th>
                      <th className="text-right py-3 px-4 text-xs font-medium text-gray-500 dark:text-gray-400">Price</th>
                      <th className="text-right py-3 px-4 text-xs font-medium text-gray-500 dark:text-gray-400">Change</th>
                      <th className="text-right py-3 px-4 text-xs font-medium text-gray-500 dark:text-gray-400">% Change</th>
                      <th className="py-3 px-4"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {watchlist.map((sym) => {
                      const q = quotes[sym];
                      if (!q) return null;
                      return (
                        <tr key={sym} className="border-b border-gray-100 dark:border-gray-800 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                          <td className="py-3 px-4">
                            <span className="font-mono font-bold text-gray-900 dark:text-white">{sym}</span>
                            <span className="ml-2 text-xs text-gray-500 dark:text-gray-400 hidden sm:inline">{q.name}</span>
                          </td>
                          <td className="py-3 px-4 text-right font-mono">{formatCurrency(q.price)}</td>
                          <td className={`py-3 px-4 text-right font-mono text-sm ${q.change >= 0 ? "text-emerald-500" : "text-red-500"}`}>
                            {q.change >= 0 ? "+" : ""}{formatCurrency(q.change)}
                          </td>
                          <td className={`py-3 px-4 text-right font-mono text-sm ${q.changePercent >= 0 ? "text-emerald-500" : "text-red-500"}`}>
                            {formatPercent(q.changePercent)}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Link href={`/predict?symbol=${sym}`}>
                                <Button size="sm" variant="ghost">
                                  <BrainCircuit className="h-3.5 w-3.5" />
                                </Button>
                              </Link>
                              <Button size="sm" variant="ghost" onClick={() => removeFromWatchlist(sym)}>
                                <Trash2 className="h-3.5 w-3.5 text-red-400" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}

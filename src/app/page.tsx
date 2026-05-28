"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { BrainCircuit, TrendingUp, TrendingDown, RefreshCw, Zap, ChevronRight } from "lucide-react";
import { StockScore } from "@/lib/indicators";
import { SignalBadge } from "@/components/stock/SignalBadge";
import { ScoreGauge } from "@/components/stock/ScoreGauge";
import { StockCard } from "@/components/stock/StockCard";
import { StockChart } from "@/components/stock/StockChart";
import { StockStats } from "@/components/stock/StockStats";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StockQuote, StockDataPoint } from "@/lib/types";
import { POPULAR_STOCKS, TIME_RANGES } from "@/lib/constants";
import { formatCurrency, formatPercent } from "@/lib/utils";
import type { TimeRange } from "@/lib/types";

export default function DashboardPage() {
  const [quotes, setQuotes] = useState<StockQuote[]>([]);
  const [selectedSymbol, setSelectedSymbol] = useState("AAPL");
  const [selectedQuote, setSelectedQuote] = useState<StockQuote | null>(null);
  const [history, setHistory] = useState<StockDataPoint[]>([]);
  const [range, setRange] = useState<TimeRange>("1M");
  const [loadingQuotes, setLoadingQuotes] = useState(true);
  const [loadingChart, setLoadingChart] = useState(false);
  const [watchlist, setWatchlist] = useState<string[]>([]);
  const [topPicks, setTopPicks] = useState<StockScore[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem("watchlist");
    if (saved) setWatchlist(JSON.parse(saved));
  }, []);

  useEffect(() => {
    fetch("/api/stock/screen")
      .then((r) => r.json())
      .then((data: StockScore[]) => setTopPicks(data.filter((s) => s.signal === "Strong Buy" || s.signal === "Buy").slice(0, 4)));
  }, []);

  const toggleWatchlist = useCallback((symbol: string) => {
    setWatchlist((prev) => {
      const next = prev.includes(symbol) ? prev.filter((s) => s !== symbol) : [...prev, symbol];
      localStorage.setItem("watchlist", JSON.stringify(next));
      return next;
    });
  }, []);

  useEffect(() => {
    async function fetchQuotes() {
      setLoadingQuotes(true);
      try {
        const results = await Promise.allSettled(
          POPULAR_STOCKS.map((s) => fetch(`/api/stock/quote?symbol=${s.symbol}`).then((r) => r.json()))
        );
        const data = results
          .filter((r) => r.status === "fulfilled")
          .map((r) => (r as PromiseFulfilledResult<StockQuote>).value);
        setQuotes(data);
        if (data.length) setSelectedQuote(data.find((q) => q.symbol === selectedSymbol) ?? data[0]);
      } finally {
        setLoadingQuotes(false);
      }
    }
    fetchQuotes();
  }, []);

  useEffect(() => {
    async function fetchHistory() {
      setLoadingChart(true);
      try {
        const res = await fetch(`/api/stock/history?symbol=${selectedSymbol}&range=${range}`);
        const data = await res.json();
        setHistory(data);
      } finally {
        setLoadingChart(false);
      }
    }
    fetchHistory();
  }, [selectedSymbol, range]);

  function handleSelectStock(quote: StockQuote) {
    setSelectedSymbol(quote.symbol);
    setSelectedQuote(quote);
  }

  const gainers = [...quotes].sort((a, b) => b.changePercent - a.changePercent).slice(0, 3);
  const losers = [...quotes].sort((a, b) => a.changePercent - b.changePercent).slice(0, 3);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">NSE · BSE · Indian Market Overview</p>
        </div>
        <div className="flex gap-2">
          <Link href="/picks">
            <Button variant="secondary">
              <Zap className="h-4 w-4" />
              Daily Picks
            </Button>
          </Link>
          <Link href="/predict">
            <Button>
              <BrainCircuit className="h-4 w-4" />
              AI Predict
            </Button>
          </Link>
        </div>
      </div>

      {topPicks.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-amber-500" />
              <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Top Picks for Today</span>
            </div>
            <Link href="/picks" className="text-xs text-indigo-500 hover:underline flex items-center gap-0.5">
              View all <ChevronRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {topPicks.map((s) => (
              <Link key={s.symbol} href={`/picks`}>
                <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-3 hover:border-indigo-400 dark:hover:border-indigo-700 transition-all cursor-pointer hover:shadow-md">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-mono font-bold text-sm text-gray-900 dark:text-white">{s.symbol}</p>
                      <p className="text-[10px] text-gray-500 truncate max-w-[90px]">{s.name}</p>
                    </div>
                    <ScoreGauge score={s.score} size="sm" showLabel={false} />
                  </div>
                  <p className="text-base font-bold text-gray-900 dark:text-white">{formatCurrency(s.price)}</p>
                  <div className="flex items-center justify-between mt-1.5">
                    <SignalBadge signal={s.signal} size="sm" />
                    <span className={s.changePercent >= 0 ? "text-emerald-500 text-xs" : "text-red-500 text-xs"}>
                      {formatPercent(s.changePercent)}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-4">
          {selectedQuote && (
            <Card>
              <CardHeader>
                <div>
                  <div className="flex items-center gap-3">
                    <span className="text-xl font-bold text-gray-900 dark:text-white font-mono">
                      {selectedQuote.symbol}
                    </span>
                    <Badge variant={selectedQuote.changePercent >= 0 ? "positive" : "negative"}>
                      {selectedQuote.changePercent >= 0 ? (
                        <TrendingUp className="h-3 w-3 mr-1" />
                      ) : (
                        <TrendingDown className="h-3 w-3 mr-1" />
                      )}
                      {formatPercent(selectedQuote.changePercent)}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{selectedQuote.name}</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                    {formatCurrency(selectedQuote.price)}
                    <span className={`text-base ml-2 font-medium ${selectedQuote.change >= 0 ? "text-emerald-500" : "text-red-500"}`}>
                      {selectedQuote.change >= 0 ? "+" : ""}{formatCurrency(selectedQuote.change)}
                    </span>
                  </p>
                </div>
                <div className="flex gap-1 flex-wrap">
                  {TIME_RANGES.map((r) => (
                    <button
                      key={r}
                      onClick={() => setRange(r)}
                      className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                        range === r
                          ? "bg-indigo-600 text-white"
                          : "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </CardHeader>
              <CardContent>
                {loadingChart ? (
                  <div className="h-[300px] flex items-center justify-center">
                    <RefreshCw className="h-6 w-6 animate-spin text-gray-400" />
                  </div>
                ) : (
                  <StockChart data={history} symbol={selectedSymbol} />
                )}
              </CardContent>
            </Card>
          )}

          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Top Gainers</CardTitle>
              </CardHeader>
              <CardContent className="pt-0 space-y-2">
                {gainers.map((q) => (
                  <button
                    key={q.symbol}
                    onClick={() => handleSelectStock(q)}
                    className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-left"
                  >
                    <span className="font-mono text-sm font-semibold text-gray-900 dark:text-white">{q.symbol}</span>
                    <div className="text-right">
                      <p className="text-sm font-medium">{formatCurrency(q.price)}</p>
                      <p className="text-xs text-emerald-500">{formatPercent(q.changePercent)}</p>
                    </div>
                  </button>
                ))}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Top Losers</CardTitle>
              </CardHeader>
              <CardContent className="pt-0 space-y-2">
                {losers.map((q) => (
                  <button
                    key={q.symbol}
                    onClick={() => handleSelectStock(q)}
                    className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-left"
                  >
                    <span className="font-mono text-sm font-semibold text-gray-900 dark:text-white">{q.symbol}</span>
                    <div className="text-right">
                      <p className="text-sm font-medium">{formatCurrency(q.price)}</p>
                      <p className="text-xs text-red-500">{formatPercent(q.changePercent)}</p>
                    </div>
                  </button>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="space-y-4">
          {selectedQuote && <StockStats quote={selectedQuote} />}

          <Card>
            <CardHeader>
              <CardTitle>Stocks</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              {loadingQuotes ? (
                <div className="space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-16 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse" />
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  {quotes.map((q) => (
                    <StockCard
                      key={q.symbol}
                      quote={q}
                      onClick={() => handleSelectStock(q)}
                      selected={q.symbol === selectedSymbol}
                      onWatchlist={watchlist.includes(q.symbol)}
                      onToggleWatchlist={toggleWatchlist}
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

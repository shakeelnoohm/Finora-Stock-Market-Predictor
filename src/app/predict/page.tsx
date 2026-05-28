"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { BrainCircuit, RefreshCw, AlertTriangle, Play } from "lucide-react";
import { StockSearch } from "@/components/stock/StockSearch";
import { StockChart } from "@/components/stock/StockChart";
import { PredictionChart } from "@/components/stock/PredictionChart";
import { PredictionPanel } from "@/components/stock/PredictionPanel";
import { StockStats } from "@/components/stock/StockStats";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StockQuote, StockDataPoint, PredictionResult } from "@/lib/types";
import { formatCurrency, formatPercent } from "@/lib/utils";
import { TIME_RANGES } from "@/lib/constants";
import type { TimeRange } from "@/lib/types";

function PredictContent() {
  const searchParams = useSearchParams();
  const initialSymbol = searchParams.get("symbol") ?? "AAPL";

  const [symbol, setSymbol] = useState(initialSymbol);
  const [symbolName, setSymbolName] = useState("");
  const [quote, setQuote] = useState<StockQuote | null>(null);
  const [history, setHistory] = useState<StockDataPoint[]>([]);
  const [range, setRange] = useState<TimeRange>("3M");
  const [prediction, setPrediction] = useState<PredictionResult | null>(null);
  const [loadingQuote, setLoadingQuote] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [predicting, setPredicting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchQuote = useCallback(async (sym: string) => {
    setLoadingQuote(true);
    try {
      const res = await fetch(`/api/stock/quote?symbol=${sym}`);
      const data = await res.json();
      setQuote(data);
      setSymbolName(data.name ?? sym);
    } finally {
      setLoadingQuote(false);
    }
  }, []);

  const fetchHistory = useCallback(async (sym: string, r: TimeRange) => {
    setLoadingHistory(true);
    try {
      const res = await fetch(`/api/stock/history?symbol=${sym}&range=${r}`);
      const data = await res.json();
      setHistory(data);
    } finally {
      setLoadingHistory(false);
    }
  }, []);

  useEffect(() => {
    fetchQuote(symbol);
    fetchHistory(symbol, range);
    setPrediction(null);
  }, [symbol, fetchQuote, fetchHistory]);

  useEffect(() => {
    fetchHistory(symbol, range);
  }, [range, symbol, fetchHistory]);

  async function runPrediction() {
    if (!history.length) return;
    setPredicting(true);
    setError(null);
    try {
      const { runPrediction: predict } = await import("@/lib/predictor");
      const result = await predict(symbol, history);
      setPrediction(result);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Prediction failed");
    } finally {
      setPredicting(false);
    }
  }

  function handleSelect(sym: string, name: string) {
    setSymbol(sym);
    setSymbolName(name);
    setPrediction(null);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">AI Price Prediction</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            LSTM neural network trained in your browser via TensorFlow.js
          </p>
        </div>
        <StockSearch onSelect={handleSelect} className="w-72" />
      </div>

      {quote && !loadingQuote && (
        <Card>
          <CardContent className="pt-5 pb-5">
            <div className="flex flex-wrap items-center gap-4 justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-indigo-600 flex items-center justify-center">
                  <span className="text-white font-bold text-sm">{symbol.slice(0, 2)}</span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-bold font-mono text-gray-900 dark:text-white">{symbol}</span>
                    <Badge variant={quote.changePercent >= 0 ? "positive" : "negative"}>
                      {formatPercent(quote.changePercent)}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{symbolName || quote.name}</p>
                </div>
              </div>
              <div className="flex items-end gap-3">
                <div className="text-right">
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">{formatCurrency(quote.price)}</p>
                  <p className={`text-sm font-medium ${quote.change >= 0 ? "text-emerald-500" : "text-red-500"}`}>
                    {quote.change >= 0 ? "+" : ""}{formatCurrency(quote.change)} today
                  </p>
                </div>
                <Button
                  onClick={runPrediction}
                  disabled={predicting || loadingHistory}
                  size="lg"
                >
                  {predicting ? (
                    <><RefreshCw className="h-4 w-4 animate-spin" /> Training Model…</>
                  ) : (
                    <><Play className="h-4 w-4" /> Predict</>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {error && (
        <div className="flex items-center gap-2 p-4 rounded-lg border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400 text-sm">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      {predicting && (
        <Card>
          <CardContent className="pt-8 pb-8 flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-indigo-100 dark:bg-indigo-950 flex items-center justify-center">
              <BrainCircuit className="h-8 w-8 text-indigo-600 animate-pulse" />
            </div>
            <div className="text-center">
              <p className="font-semibold text-gray-900 dark:text-white">Training LSTM Model</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Building and training neural network on {history.length} data points…
              </p>
            </div>
            <div className="w-48 h-1.5 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
              <div className="h-full bg-indigo-600 rounded-full animate-[pulse_1s_ease-in-out_infinite] w-3/4" />
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{prediction ? "Prediction Chart" : "Historical Price"}</CardTitle>
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
              {loadingHistory ? (
                <div className="h-[320px] flex items-center justify-center">
                  <RefreshCw className="h-6 w-6 animate-spin text-gray-400" />
                </div>
              ) : prediction ? (
                <PredictionChart history={history} prediction={prediction} />
              ) : (
                <StockChart data={history} symbol={symbol} />
              )}
            </CardContent>
          </Card>

          {!prediction && !predicting && (
            <Card>
              <CardContent className="py-10 flex flex-col items-center gap-4 text-center">
                <div className="w-14 h-14 rounded-2xl bg-indigo-100 dark:bg-indigo-950 flex items-center justify-center">
                  <BrainCircuit className="h-7 w-7 text-indigo-500" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">Ready to Predict</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 max-w-xs">
                    Click <strong>Predict</strong> to train an LSTM neural network on {symbol}&apos;s historical data and forecast the next 7 days.
                  </p>
                </div>
                <Button onClick={runPrediction} disabled={loadingHistory}>
                  <Play className="h-4 w-4" />
                  Run Prediction
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-4">
          {prediction && <PredictionPanel result={prediction} />}
          {quote && <StockStats quote={quote} />}
        </div>
      </div>
    </div>
  );
}

export default function PredictPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-64"><RefreshCw className="h-6 w-6 animate-spin text-gray-400" /></div>}>
      <PredictContent />
    </Suspense>
  );
}

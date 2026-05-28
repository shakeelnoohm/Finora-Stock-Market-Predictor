"use client";

import { PredictionResult } from "@/lib/types";
import { formatCurrency, formatPercent } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Minus, Brain, AlertTriangle } from "lucide-react";

interface PredictionPanelProps {
  result: PredictionResult;
}

export function PredictionPanel({ result }: PredictionPanelProps) {
  const lastPred = result.predictions[result.predictions.length - 1];
  const priceChange = lastPred.predicted - result.currentPrice;
  const percentChange = (priceChange / result.currentPrice) * 100;

  const TrendIcon =
    result.trend === "bullish" ? TrendingUp : result.trend === "bearish" ? TrendingDown : Minus;
  const trendColor =
    result.trend === "bullish"
      ? "text-emerald-500"
      : result.trend === "bearish"
      ? "text-red-500"
      : "text-amber-500";

  return (
    <Card>
      <CardHeader>
        <CardTitle>AI Prediction</CardTitle>
        <Badge
          variant={
            result.trend === "bullish"
              ? "positive"
              : result.trend === "bearish"
              ? "negative"
              : "neutral"
          }
        >
          <TrendIcon className="h-3 w-3 mr-1" />
          {result.trend.charAt(0).toUpperCase() + result.trend.slice(1)}
        </Badge>
      </CardHeader>
      <CardContent className="pt-2 space-y-4">
        <div className="flex items-center gap-2 p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
          <Brain className="h-5 w-5 text-indigo-500 shrink-0" />
          <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">{result.summary}</p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800 text-center">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">7-Day Target</p>
            <p className="text-lg font-bold text-gray-900 dark:text-white">{formatCurrency(lastPred.predicted)}</p>
            <p className={`text-xs font-medium ${priceChange >= 0 ? "text-emerald-500" : "text-red-500"}`}>
              {priceChange >= 0 ? "+" : ""}{formatCurrency(priceChange)} ({formatPercent(percentChange)})
            </p>
          </div>
          <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800 text-center">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Confidence</p>
            <p className="text-lg font-bold text-gray-900 dark:text-white">{result.confidence.toFixed(1)}%</p>
            <div className="mt-1 h-1.5 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-indigo-500 rounded-full"
                style={{ width: `${result.confidence}%` }}
              />
            </div>
          </div>
        </div>

        <div>
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">7-Day Forecast</p>
          <div className="space-y-1.5">
            {result.predictions.map((p, i) => {
              const change = p.predicted - result.currentPrice;
              const pct = (change / result.currentPrice) * 100;
              return (
                <div key={i} className="flex items-center justify-between text-xs">
                  <span className="text-gray-500 w-12">Day {i + 1}</span>
                  <span className="font-mono text-gray-800 dark:text-gray-200">{formatCurrency(p.predicted)}</span>
                  <span className={pct >= 0 ? "text-emerald-500" : "text-red-500"}>{formatPercent(pct)}</span>
                  <span className="text-gray-400 text-[10px]">
                    {formatCurrency(p.lower)}–{formatCurrency(p.upper)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex items-start gap-1.5 p-2.5 rounded-lg border border-amber-200 dark:border-amber-900 bg-amber-50 dark:bg-amber-950/30">
          <AlertTriangle className="h-3.5 w-3.5 text-amber-500 shrink-0 mt-0.5" />
          <p className="text-[10px] text-amber-700 dark:text-amber-400 leading-relaxed">
            AI predictions are for educational purposes only. Not financial advice. Past performance does not guarantee future results.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

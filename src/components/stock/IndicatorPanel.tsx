"use client";

import { TechnicalIndicators } from "@/lib/indicators";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface IndicatorPanelProps {
  indicators: TechnicalIndicators;
  price: number;
}

function IndicatorBar({ label, value, min, max, good = "high" }: {
  label: string;
  value: number;
  min: number;
  max: number;
  good?: "high" | "low" | "middle";
}) {
  const pct = Math.max(0, Math.min(100, ((value - min) / (max - min)) * 100));
  const isGood =
    good === "high" ? value > (max - min) * 0.5 + min :
    good === "low" ? value < (max - min) * 0.5 + min :
    pct > 30 && pct < 70;

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="text-gray-500 dark:text-gray-400">{label}</span>
        <span className={cn("font-mono font-medium", isGood ? "text-emerald-500" : "text-red-400")}>
          {value.toFixed(2)}
        </span>
      </div>
      <div className="h-1.5 w-full bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
        <div
          className={cn("h-full rounded-full transition-all", isGood ? "bg-emerald-500" : "bg-red-400")}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function StatRow({ label, value, positive }: { label: string; value: string; positive?: boolean }) {
  return (
    <div className="flex justify-between items-center py-1.5 border-b border-gray-100 dark:border-gray-800 last:border-0">
      <span className="text-xs text-gray-500 dark:text-gray-400">{label}</span>
      <span className={cn(
        "text-xs font-mono font-medium",
        positive === true ? "text-emerald-500" :
        positive === false ? "text-red-400" :
        "text-gray-900 dark:text-white"
      )}>{value}</span>
    </div>
  );
}

export function IndicatorPanel({ indicators: ind, price }: IndicatorPanelProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Technical Indicators</CardTitle>
      </CardHeader>
      <CardContent className="pt-0 space-y-5">
        <div className="space-y-3">
          <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">Oscillators</p>
          <IndicatorBar label="RSI (14)" value={ind.rsi} min={0} max={100} good="middle" />
          <IndicatorBar label="MACD Histogram" value={ind.macdHistogram} min={-5} max={5} good="high" />
          <IndicatorBar label="Momentum (10d %)" value={ind.momentum} min={-15} max={15} good="high" />
          <IndicatorBar label="Volume Ratio" value={ind.volumeRatio} min={0} max={3} good="high" />
        </div>

        <div className="space-y-2">
          <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">Moving Averages</p>
          <StatRow label="SMA 20" value={formatCurrency(ind.sma20)} positive={price > ind.sma20} />
          <StatRow label="SMA 50" value={formatCurrency(ind.sma50)} positive={price > ind.sma50} />
          <StatRow label="EMA 12" value={formatCurrency(ind.ema12)} positive={price > ind.ema12} />
          <StatRow label="Price vs SMA20" value={`${ind.priceVsSma20 >= 0 ? "+" : ""}${ind.priceVsSma20.toFixed(2)}%`} positive={ind.priceVsSma20 >= 0} />
          <StatRow label="Price vs SMA50" value={`${ind.priceVsSma50 >= 0 ? "+" : ""}${ind.priceVsSma50.toFixed(2)}%`} positive={ind.priceVsSma50 >= 0} />
        </div>

        <div className="space-y-2">
          <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">Bollinger Bands</p>
          <StatRow label="Upper Band" value={formatCurrency(ind.bollingerUpper)} />
          <StatRow label="Middle (SMA20)" value={formatCurrency(ind.bollingerMiddle)} />
          <StatRow label="Lower Band" value={formatCurrency(ind.bollingerLower)} positive={price > ind.bollingerLower} />
          <StatRow label="Band Width" value={`${(ind.bollingerWidth * 100).toFixed(2)}%`} />
          <StatRow
            label="Position"
            value={
              price > ind.bollingerUpper ? "Above Upper" :
              price < ind.bollingerLower ? "Below Lower" : "Within Bands"
            }
            positive={price <= ind.bollingerUpper && price >= ind.bollingerLower}
          />
        </div>

        <div className="space-y-2">
          <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">Volatility</p>
          <StatRow label="ATR (14)" value={formatCurrency(ind.atr)} />
          <StatRow label="ATR %" value={`${((ind.atr / price) * 100).toFixed(2)}%`} />
        </div>
      </CardContent>
    </Card>
  );
}

"use client";

import { useMemo } from "react";
import {
  ComposedChart,
  Line,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ReferenceLine,
} from "recharts";
import { StockDataPoint, PredictionResult } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";
import { format, parseISO } from "date-fns";

interface PredictionChartProps {
  history: StockDataPoint[];
  prediction: PredictionResult;
}

export function PredictionChart({ history, prediction }: PredictionChartProps) {
  const chartData = useMemo(() => {
    const lastDays = history.slice(-30).map((d) => ({
      date: (() => { try { return format(parseISO(d.date), "MMM d"); } catch { return d.date; } })(),
      actual: d.close,
      predicted: null as number | null,
      lower: null as number | null,
      upper: null as number | null,
      type: "history",
    }));

    const predPoints = prediction.predictions.map((p) => ({
      date: (() => { try { return format(parseISO(p.date), "MMM d"); } catch { return p.date; } })(),
      actual: null as number | null,
      predicted: p.predicted,
      lower: p.lower,
      upper: p.upper,
      type: "prediction",
    }));

    const bridgePoint = lastDays[lastDays.length - 1];
    const firstPred = { ...predPoints[0], actual: bridgePoint.actual };

    return [...lastDays, firstPred, ...predPoints.slice(1)];
  }, [history, prediction]);

  const trendColor =
    prediction.trend === "bullish"
      ? "#22c55e"
      : prediction.trend === "bearish"
      ? "#ef4444"
      : "#f59e0b";

  return (
    <ResponsiveContainer width="100%" height={320}>
      <ComposedChart data={chartData} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
        <defs>
          <linearGradient id="predGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={trendColor} stopOpacity={0.25} />
            <stop offset="95%" stopColor={trendColor} stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" className="dark:[&>line]:stroke-gray-800" />
        <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#9ca3af" }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
        <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} tickLine={false} axisLine={false} tickFormatter={(v) => `$${v.toFixed(0)}`} width={60} />
        <Tooltip
          content={({ active, payload, label }) => {
            if (!active || !payload?.length) return null;
            return (
              <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl p-3 text-xs">
                <p className="font-semibold text-gray-700 dark:text-gray-300 mb-1">{label}</p>
                {payload.map((p) => (
                  p.value != null && (
                    <div key={p.name} className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full" style={{ background: p.color as string }} />
                      <span className="text-gray-500 capitalize">{p.name}:</span>
                      <span className="font-mono font-medium">{formatCurrency(p.value as number)}</span>
                    </div>
                  )
                ))}
              </div>
            );
          }}
        />
        <Legend wrapperStyle={{ fontSize: "12px" }} />
        <ReferenceLine x={chartData[chartData.length - 7]?.date} stroke="#6b7280" strokeDasharray="4 4" label={{ value: "Today", fontSize: 10, fill: "#6b7280" }} />
        <Area dataKey="upper" fill="url(#predGradient)" stroke="none" name="upper bound" legendType="none" />
        <Area dataKey="lower" fill="white" stroke="none" name="lower bound" legendType="none" />
        <Line type="monotone" dataKey="actual" stroke="#6366f1" strokeWidth={2} dot={false} name="actual" connectNulls={false} />
        <Line type="monotone" dataKey="predicted" stroke={trendColor} strokeWidth={2} strokeDasharray="5 3" dot={{ r: 3, fill: trendColor }} name="predicted" connectNulls={false} />
      </ComposedChart>
    </ResponsiveContainer>
  );
}

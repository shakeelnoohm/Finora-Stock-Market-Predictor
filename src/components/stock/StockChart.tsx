"use client";

import { useMemo } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { StockDataPoint } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";
import { format, parseISO } from "date-fns";

interface StockChartProps {
  data: StockDataPoint[];
  symbol: string;
}

interface TooltipProps {
  active?: boolean;
  payload?: Array<{ value: number; payload: StockDataPoint }>;
  label?: string;
}

function CustomTooltip({ active, payload, label }: TooltipProps) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl p-3 text-xs">
      <p className="font-semibold text-gray-700 dark:text-gray-300 mb-1.5">{label}</p>
      <div className="grid grid-cols-2 gap-x-4 gap-y-1">
        <span className="text-gray-500">Open</span>
        <span className="text-right font-mono">{formatCurrency(d.open)}</span>
        <span className="text-gray-500">High</span>
        <span className="text-right font-mono text-emerald-500">{formatCurrency(d.high)}</span>
        <span className="text-gray-500">Low</span>
        <span className="text-right font-mono text-red-500">{formatCurrency(d.low)}</span>
        <span className="text-gray-500">Close</span>
        <span className="text-right font-mono font-semibold">{formatCurrency(d.close)}</span>
      </div>
    </div>
  );
}

export function StockChart({ data, symbol }: StockChartProps) {
  const chartData = useMemo(() => {
    return data.map((d) => ({
      ...d,
      displayDate: (() => {
        try { return format(parseISO(d.date), "MMM d"); } catch { return d.date; }
      })(),
    }));
  }, [data]);

  const isPositive = useMemo(() => {
    if (chartData.length < 2) return true;
    return chartData[chartData.length - 1].close >= chartData[0].close;
  }, [chartData]);

  const color = isPositive ? "#22c55e" : "#ef4444";
  const gradientId = `gradient-${symbol}`;

  const prices = chartData.map((d) => d.close);
  const minPrice = Math.min(...prices) * 0.998;
  const maxPrice = Math.max(...prices) * 1.002;

  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={chartData} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={color} stopOpacity={0.3} />
            <stop offset="95%" stopColor={color} stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" className="dark:[&>line]:stroke-gray-800" />
        <XAxis
          dataKey="displayDate"
          tick={{ fontSize: 11, fill: "#9ca3af" }}
          tickLine={false}
          axisLine={false}
          interval="preserveStartEnd"
        />
        <YAxis
          domain={[minPrice, maxPrice]}
          tick={{ fontSize: 11, fill: "#9ca3af" }}
          tickLine={false}
          axisLine={false}
          tickFormatter={(v) => `$${v.toFixed(0)}`}
          width={60}
        />
        <Tooltip content={<CustomTooltip />} />
        <ReferenceLine
          y={chartData[0]?.close}
          stroke="#6b7280"
          strokeDasharray="4 4"
          strokeOpacity={0.5}
        />
        <Area
          type="monotone"
          dataKey="close"
          stroke={color}
          strokeWidth={2}
          fill={`url(#${gradientId})`}
          dot={false}
          activeDot={{ r: 4, strokeWidth: 0 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

"use client";

import { StockQuote } from "@/lib/types";
import { formatCurrency, formatLargeNumber } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface StockStatsProps {
  quote: StockQuote;
}

function StatRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-800 last:border-0">
      <span className="text-xs text-gray-500 dark:text-gray-400">{label}</span>
      <span className="text-xs font-medium text-gray-900 dark:text-white font-mono">{value}</span>
    </div>
  );
}

export function StockStats({ quote }: StockStatsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Key Statistics</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <StatRow label="Open" value={formatCurrency(quote.open)} />
        <StatRow label="Day High" value={formatCurrency(quote.high)} />
        <StatRow label="Day Low" value={formatCurrency(quote.low)} />
        <StatRow label="Volume" value={formatLargeNumber(quote.volume)} />
        {quote.avgVolume && (
          <StatRow label="Avg Volume" value={formatLargeNumber(quote.avgVolume)} />
        )}
        {quote.marketCap && (
          <StatRow label="Market Cap" value={`$${formatLargeNumber(quote.marketCap)}`} />
        )}
        {quote.pe && (
          <StatRow label="P/E Ratio" value={quote.pe.toFixed(2)} />
        )}
        {quote.eps && (
          <StatRow label="EPS" value={formatCurrency(quote.eps)} />
        )}
        {quote.week52High && (
          <StatRow label="52W High" value={formatCurrency(quote.week52High)} />
        )}
        {quote.week52Low && (
          <StatRow label="52W Low" value={formatCurrency(quote.week52Low)} />
        )}
      </CardContent>
    </Card>
  );
}

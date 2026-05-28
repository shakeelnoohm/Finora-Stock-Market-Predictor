"use client";

import { TrendingUp, TrendingDown, Minus, Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StockQuote } from "@/lib/types";
import { formatCurrency, formatPercent, formatLargeNumber } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface StockCardProps {
  quote: StockQuote;
  onClick?: () => void;
  selected?: boolean;
  onWatchlist?: boolean;
  onToggleWatchlist?: (symbol: string) => void;
}

export function StockCard({ quote, onClick, selected, onWatchlist, onToggleWatchlist }: StockCardProps) {
  const isUp = quote.changePercent >= 0;
  const isFlat = Math.abs(quote.changePercent) < 0.01;

  return (
    <Card
      className={cn(
        "cursor-pointer transition-all duration-200 hover:shadow-md hover:border-indigo-300 dark:hover:border-indigo-700",
        selected && "border-indigo-500 dark:border-indigo-500 ring-1 ring-indigo-500"
      )}
      onClick={onClick}
    >
      <CardContent className="pt-4 pb-4">
        <div className="flex items-start justify-between mb-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-base text-gray-900 dark:text-white">
                {quote.symbol}
              </span>
              <Badge
                variant={isFlat ? "neutral" : isUp ? "positive" : "negative"}
              >
                {isFlat ? (
                  <><Minus className="h-2.5 w-2.5 mr-0.5" />{formatPercent(quote.changePercent)}</>
                ) : isUp ? (
                  <><TrendingUp className="h-2.5 w-2.5 mr-0.5" />{formatPercent(quote.changePercent)}</>
                ) : (
                  <><TrendingDown className="h-2.5 w-2.5 mr-0.5" />{formatPercent(quote.changePercent)}</>
                )}
              </Badge>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate max-w-[160px]">{quote.name}</p>
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); onToggleWatchlist?.(quote.symbol); }}
            className={cn(
              "p-1 rounded transition-colors",
              onWatchlist
                ? "text-amber-500 hover:text-amber-600"
                : "text-gray-300 dark:text-gray-600 hover:text-amber-500"
            )}
          >
            <Star className={cn("h-4 w-4", onWatchlist && "fill-current")} />
          </button>
        </div>

        <div className="flex items-end justify-between">
          <span className="text-2xl font-bold text-gray-900 dark:text-white">
            {formatCurrency(quote.price)}
          </span>
          <span className={cn("text-sm font-medium", isUp ? "text-emerald-600" : "text-red-500")}>
            {isUp ? "+" : ""}{formatCurrency(quote.change)}
          </span>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-1.5 text-xs text-gray-500 dark:text-gray-400">
          <div>Vol: <span className="text-gray-700 dark:text-gray-300">{formatLargeNumber(quote.volume)}</span></div>
          <div>H: <span className="text-gray-700 dark:text-gray-300">{formatCurrency(quote.high)}</span></div>
          <div>Open: <span className="text-gray-700 dark:text-gray-300">{formatCurrency(quote.open)}</span></div>
          <div>L: <span className="text-gray-700 dark:text-gray-300">{formatCurrency(quote.low)}</span></div>
        </div>
      </CardContent>
    </Card>
  );
}

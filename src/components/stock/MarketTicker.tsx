"use client";

import { useEffect, useState } from "react";
import { TrendingUp, TrendingDown } from "lucide-react";
import { formatCurrency, formatPercent } from "@/lib/utils";
import { StockQuote } from "@/lib/types";
import { POPULAR_STOCKS, MARKET_INDICES } from "@/lib/constants";

const INDEX_SYMBOLS = MARKET_INDICES.map((m) => ({ symbol: m.symbol, name: m.name }));

export function MarketTicker() {
  const [quotes, setQuotes] = useState<StockQuote[]>([]);
  const [time, setTime] = useState("");
  const [isLive, setIsLive] = useState<boolean | null>(null);

  useEffect(() => {
    async function fetchAll() {
      const symbols = [...INDEX_SYMBOLS, ...POPULAR_STOCKS.slice(0, 8)];
      const results = await Promise.allSettled(
        symbols.map((s) =>
          fetch(`/api/stock/quote?symbol=${s.symbol}`).then((r) => r.json())
        )
      );
      const data = results
        .filter((r) => r.status === "fulfilled")
        .map((r) => (r as PromiseFulfilledResult<StockQuote & { source?: string }>).value);
      setQuotes(data);
      if (data.length > 0) {
        setIsLive((data[0] as StockQuote & { source?: string }).source === "yahoo");
      }
    }
    fetchAll();
  }, []);

  useEffect(() => {
    function tick() {
      setTime(
        new Date().toLocaleTimeString("en-IN", {
          timeZone: "Asia/Kolkata",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        }) + " IST"
      );
    }
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  if (!quotes.length) {
    return (
      <div className="h-10 bg-gray-900 flex items-center px-6 gap-8 overflow-hidden">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-3 w-24 bg-gray-800 rounded animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="h-10 bg-gray-900 border-b border-gray-800 flex items-center overflow-hidden">
      <div className="shrink-0 flex items-center gap-2 px-4 border-r border-gray-800">
        <span className="text-[10px] font-bold text-indigo-400 tracking-widest">NSE</span>
        {isLive !== null && (
          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
            isLive ? "bg-emerald-500 text-white" : "bg-amber-500 text-white"
          }`}>
            {isLive ? "● LIVE" : "● MOCK"}
          </span>
        )}
        <span className="text-[10px] text-gray-500">{time}</span>
      </div>
      <div className="flex gap-8 animate-[marquee_40s_linear_infinite] whitespace-nowrap px-6">
        {[...quotes, ...quotes].map((q, i) => (
          <span key={i} className="flex items-center gap-1.5 text-xs shrink-0">
            <span className={`font-mono font-semibold ${INDEX_SYMBOLS.some(ix => ix.symbol === q.symbol) ? "text-amber-400" : "text-white"}`}>
              {q.symbol}
            </span>
            <span className="text-gray-300">{formatCurrency(q.price)}</span>
            <span className={q.changePercent >= 0 ? "text-emerald-400" : "text-red-400"}>
              {q.changePercent >= 0 ? (
                <TrendingUp className="h-3 w-3 inline mr-0.5" />
              ) : (
                <TrendingDown className="h-3 w-3 inline mr-0.5" />
              )}
              {formatPercent(q.changePercent)}
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}

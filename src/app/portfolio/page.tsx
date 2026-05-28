"use client";

import { useEffect, useState, useCallback } from "react";
import { Plus, Trash2, TrendingUp, TrendingDown, RefreshCw, PieChart } from "lucide-react";
import { PieChart as RePieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatPercent, formatLargeNumber, cn } from "@/lib/utils";
import {
  Holding, HoldingWithLive, loadPortfolio, savePortfolio,
  calcXIRR, getSectorBreakdown, SECTOR_MAP,
} from "@/lib/portfolio";
import { POPULAR_STOCKS } from "@/lib/constants";
import { StockQuote } from "@/lib/types";

const SECTOR_COLORS = ["#6366f1","#22c55e","#f59e0b","#ef4444","#06b6d4","#8b5cf6","#ec4899","#14b8a6","#f97316","#84cc16"];

const EMPTY_FORM = { symbol: "", qty: "", avgBuyPrice: "", buyDate: new Date().toISOString().split("T")[0] };

export default function PortfolioPage() {
  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [live, setLive] = useState<Record<string, StockQuote>>({});
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [showForm, setShowForm] = useState(false);
  const [suggestion, setSuggestion] = useState<{ symbol: string; name: string }[]>([]);

  useEffect(() => {
    setHoldings(loadPortfolio());
  }, []);

  const fetchLive = useCallback(async (syms: string[]) => {
    if (!syms.length) return;
    setLoading(true);
    const results = await Promise.allSettled(
      syms.map((s) => fetch(`/api/stock/quote?symbol=${s}`).then((r) => r.json()))
    );
    const map: Record<string, StockQuote> = {};
    results.forEach((r, i) => {
      if (r.status === "fulfilled") map[syms[i]] = r.value;
    });
    setLive(map);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (holdings.length) fetchLive(holdings.map((h) => h.symbol));
  }, [holdings, fetchLive]);

  function addHolding() {
    if (!form.symbol || !form.qty || !form.avgBuyPrice) return;
    const known = POPULAR_STOCKS.find((s) => s.symbol === form.symbol.toUpperCase());
    const newH: Holding = {
      id: Date.now().toString(),
      symbol: form.symbol.toUpperCase(),
      name: known?.name ?? form.symbol.toUpperCase(),
      qty: parseFloat(form.qty),
      avgBuyPrice: parseFloat(form.avgBuyPrice),
      buyDate: form.buyDate,
      sector: SECTOR_MAP[form.symbol.toUpperCase()] ?? "Other",
    };
    const updated = [...holdings, newH];
    setHoldings(updated);
    savePortfolio(updated);
    setForm(EMPTY_FORM);
    setShowForm(false);
    setSuggestion([]);
  }

  function removeHolding(id: string) {
    const updated = holdings.filter((h) => h.id !== id);
    setHoldings(updated);
    savePortfolio(updated);
  }

  function handleSymbolInput(val: string) {
    setForm((f) => ({ ...f, symbol: val }));
    const q = val.toUpperCase();
    if (q.length < 1) { setSuggestion([]); return; }
    setSuggestion(POPULAR_STOCKS.filter((s) => s.symbol.startsWith(q) || s.name.toUpperCase().includes(q)).slice(0, 5));
  }

  const enriched: HoldingWithLive[] = holdings.map((h) => {
    const q = live[h.symbol];
    const livePrice = q?.price ?? h.avgBuyPrice;
    const currentValue = livePrice * h.qty;
    const investedValue = h.avgBuyPrice * h.qty;
    const pnl = currentValue - investedValue;
    const pnlPercent = (pnl / investedValue) * 100;
    const dayChange = q ? q.change * h.qty : 0;
    const dayChangePercent = q?.changePercent ?? 0;
    return { ...h, livePrice, currentValue, investedValue, pnl, pnlPercent, dayChange, dayChangePercent };
  });

  const totalInvested = enriched.reduce((s, h) => s + h.investedValue, 0);
  const totalCurrent = enriched.reduce((s, h) => s + h.currentValue, 0);
  const totalPnL = totalCurrent - totalInvested;
  const totalPnLPct = totalInvested > 0 ? (totalPnL / totalInvested) * 100 : 0;
  const dayPnL = enriched.reduce((s, h) => s + h.dayChange, 0);
  const xirr = calcXIRR(enriched);
  const sectorData = getSectorBreakdown(enriched);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Portfolio</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Track your NSE/BSE holdings & P&L</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => fetchLive(holdings.map((h) => h.symbol))} disabled={loading}>
            <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
          </Button>
          <Button onClick={() => setShowForm((v) => !v)}>
            <Plus className="h-4 w-4" /> Add Holding
          </Button>
        </div>
      </div>

      {/* Add Form */}
      {showForm && (
        <Card>
          <CardHeader><CardTitle>Add New Holding</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="relative">
                <Input placeholder="Symbol (e.g. RELIANCE)" value={form.symbol} onChange={(e) => handleSymbolInput(e.target.value)} />
                {suggestion.length > 0 && (
                  <div className="absolute top-full left-0 right-0 z-20 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg mt-1 shadow-lg overflow-hidden">
                    {suggestion.map((s) => (
                      <button key={s.symbol} onClick={() => { setForm((f) => ({ ...f, symbol: s.symbol })); setSuggestion([]); }}
                        className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-800">
                        <span className="font-mono font-bold">{s.symbol}</span>
                        <span className="text-gray-500 ml-2 text-xs">{s.name}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <Input type="number" placeholder="Quantity" value={form.qty} onChange={(e) => setForm((f) => ({ ...f, qty: e.target.value }))} />
              <Input type="number" placeholder="Avg Buy Price (₹)" value={form.avgBuyPrice} onChange={(e) => setForm((f) => ({ ...f, avgBuyPrice: e.target.value }))} />
              <Input type="date" value={form.buyDate} onChange={(e) => setForm((f) => ({ ...f, buyDate: e.target.value }))} />
            </div>
            <div className="flex gap-2 mt-3">
              <Button onClick={addHolding}>Add</Button>
              <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        {[
          { label: "Total Invested", value: formatLargeNumber(totalInvested), sub: "" },
          { label: "Current Value", value: formatLargeNumber(totalCurrent), sub: "" },
          { label: "Total P&L", value: formatCurrency(totalPnL), sub: formatPercent(totalPnLPct), pos: totalPnL >= 0 },
          { label: "Today's P&L", value: formatCurrency(dayPnL), sub: "", pos: dayPnL >= 0 },
          { label: "XIRR", value: `${xirr.toFixed(2)}%`, sub: "annualised", pos: xirr >= 0 },
        ].map((c) => (
          <Card key={c.label}>
            <CardContent className="pt-4 pb-4">
              <p className="text-xs text-gray-500 dark:text-gray-400">{c.label}</p>
              <p className={cn("text-lg font-bold mt-0.5", c.pos === true ? "text-emerald-500" : c.pos === false ? "text-red-500" : "text-gray-900 dark:text-white")}>{c.value}</p>
              {c.sub && <p className={cn("text-xs", c.pos === true ? "text-emerald-500" : c.pos === false ? "text-red-500" : "text-gray-400")}>{c.sub}</p>}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Holdings Table */}
        <div className="xl:col-span-2">
          <Card>
            <CardHeader><CardTitle>Holdings ({enriched.length})</CardTitle></CardHeader>
            <CardContent className="pt-0 pb-0">
              {enriched.length === 0 ? (
                <div className="py-16 text-center">
                  <PieChart className="h-10 w-10 text-gray-300 dark:text-gray-700 mx-auto mb-3" />
                  <p className="text-sm text-gray-500">No holdings yet. Click "Add Holding" to start.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-100 dark:border-gray-800">
                        {["Stock", "Qty", "Avg Price", "LTP", "Invested", "Value", "P&L", "Day", ""].map((h) => (
                          <th key={h} className={cn("py-3 px-3 text-xs font-medium text-gray-500", h === "Stock" ? "text-left" : "text-right")}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {enriched.map((h) => (
                        <tr key={h.id} className="border-b border-gray-100 dark:border-gray-800 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-800/40">
                          <td className="py-3 px-3">
                            <p className="font-mono font-bold text-gray-900 dark:text-white">{h.symbol}</p>
                            <p className="text-[10px] text-gray-500 truncate max-w-[100px]">{h.sector}</p>
                          </td>
                          <td className="py-3 px-3 text-right font-mono">{h.qty}</td>
                          <td className="py-3 px-3 text-right font-mono">{formatCurrency(h.avgBuyPrice)}</td>
                          <td className="py-3 px-3 text-right font-mono">{formatCurrency(h.livePrice)}</td>
                          <td className="py-3 px-3 text-right font-mono text-gray-500">{formatLargeNumber(h.investedValue)}</td>
                          <td className="py-3 px-3 text-right font-mono">{formatLargeNumber(h.currentValue)}</td>
                          <td className={cn("py-3 px-3 text-right font-mono font-semibold", h.pnl >= 0 ? "text-emerald-500" : "text-red-500")}>
                            {formatCurrency(h.pnl)}<br />
                            <span className="text-[10px]">{formatPercent(h.pnlPercent)}</span>
                          </td>
                          <td className={cn("py-3 px-3 text-right font-mono text-xs", h.dayChange >= 0 ? "text-emerald-500" : "text-red-500")}>
                            {h.dayChange >= 0 ? "+" : ""}{formatCurrency(h.dayChange)}
                          </td>
                          <td className="py-3 px-3 text-right">
                            <Button size="sm" variant="ghost" onClick={() => removeHolding(h.id)}>
                              <Trash2 className="h-3.5 w-3.5 text-red-400" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sector Pie */}
        <div className="space-y-4">
          <Card>
            <CardHeader><CardTitle>Sector Allocation</CardTitle></CardHeader>
            <CardContent>
              {sectorData.length === 0 ? (
                <div className="h-48 flex items-center justify-center text-sm text-gray-400">No data</div>
              ) : (
                <>
                  <ResponsiveContainer width="100%" height={200}>
                    <RePieChart>
                      <Pie data={sectorData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" paddingAngle={3}>
                        {sectorData.map((_, i) => (
                          <Cell key={i} fill={SECTOR_COLORS[i % SECTOR_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(v) => formatLargeNumber(Number(v))} />
                    </RePieChart>
                  </ResponsiveContainer>
                  <div className="space-y-1.5 mt-2">
                    {sectorData.map((s, i) => (
                      <div key={s.name} className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: SECTOR_COLORS[i % SECTOR_COLORS.length] }} />
                          <span className="text-gray-700 dark:text-gray-300">{s.name}</span>
                        </div>
                        <span className="font-medium text-gray-900 dark:text-white">{s.percent.toFixed(1)}%</span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

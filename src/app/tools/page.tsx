"use client";

import { useState } from "react";
import { Calculator, TrendingUp, IndianRupee, Percent } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatCurrency, formatPercent, cn } from "@/lib/utils";

// ── Stop Loss / Position Size Calculator ───────────────────────────────────
function StopLossCalc() {
  const [capital, setCapital] = useState("100000");
  const [riskPct, setRiskPct] = useState("1");
  const [entry, setEntry] = useState("");
  const [slPct, setSlPct] = useState("2");
  const [rrr, setRrr] = useState("2");

  const entryN = parseFloat(entry) || 0;
  const slPctN = parseFloat(slPct) || 0;
  const capitalN = parseFloat(capital) || 0;
  const riskPctN = parseFloat(riskPct) || 0;
  const rrrN = parseFloat(rrr) || 2;

  const stopLoss = entryN * (1 - slPctN / 100);
  const target = entryN * (1 + (slPctN / 100) * rrrN);
  const riskPerShare = entryN - stopLoss;
  const maxRiskAmount = capitalN * (riskPctN / 100);
  const qty = riskPerShare > 0 ? Math.floor(maxRiskAmount / riskPerShare) : 0;
  const positionValue = qty * entryN;
  const positionPct = capitalN > 0 ? (positionValue / capitalN) * 100 : 0;
  const potentialProfit = qty * (target - entryN);
  const potentialLoss = qty * riskPerShare;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Stop Loss & Position Sizer</CardTitle>
        <Calculator className="h-4 w-4 text-gray-400" />
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Total Capital (₹)</label>
            <Input type="number" value={capital} onChange={(e) => setCapital(e.target.value)} />
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Risk per Trade (%)</label>
            <Input type="number" value={riskPct} onChange={(e) => setRiskPct(e.target.value)} />
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Entry Price (₹)</label>
            <Input type="number" value={entry} onChange={(e) => setEntry(e.target.value)} placeholder="e.g. 2945" />
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Stop Loss (%)</label>
            <Input type="number" value={slPct} onChange={(e) => setSlPct(e.target.value)} />
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Risk:Reward Ratio</label>
            <Input type="number" value={rrr} onChange={(e) => setRrr(e.target.value)} placeholder="e.g. 2" />
          </div>
        </div>
        {entryN > 0 && (
          <div className="grid grid-cols-2 gap-3 pt-2 border-t border-gray-100 dark:border-gray-800">
            {[
              { label: "Stop Loss Price", value: formatCurrency(stopLoss), color: "text-red-500" },
              { label: "Target Price", value: formatCurrency(target), color: "text-emerald-500" },
              { label: "Quantity to Buy", value: `${qty} shares`, color: "text-indigo-500" },
              { label: "Position Value", value: formatCurrency(positionValue), color: "" },
              { label: "Capital at Risk", value: `${positionPct.toFixed(1)}% of capital`, color: positionPct > 10 ? "text-red-500" : "text-gray-700 dark:text-gray-300" },
              { label: "Potential Profit", value: formatCurrency(potentialProfit), color: "text-emerald-500" },
              { label: "Max Loss", value: formatCurrency(potentialLoss), color: "text-red-500" },
              { label: "R:R", value: `1 : ${rrrN}`, color: "text-amber-500" },
            ].map((row) => (
              <div key={row.label} className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                <p className="text-[10px] text-gray-500">{row.label}</p>
                <p className={cn("text-sm font-bold mt-0.5", row.color || "text-gray-900 dark:text-white")}>{row.value}</p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ── SIP Calculator ─────────────────────────────────────────────────────────
function SIPCalc() {
  const [monthly, setMonthly] = useState("10000");
  const [years, setYears] = useState("10");
  const [rate, setRate] = useState("12");

  const m = parseFloat(monthly) || 0;
  const y = parseFloat(years) || 0;
  const r = parseFloat(rate) || 0;
  const n = y * 12;
  const monthlyRate = r / 100 / 12;
  const fv = monthlyRate > 0
    ? m * ((Math.pow(1 + monthlyRate, n) - 1) / monthlyRate) * (1 + monthlyRate)
    : m * n;
  const invested = m * n;
  const wealthGained = fv - invested;

  return (
    <Card>
      <CardHeader>
        <CardTitle>SIP Calculator</CardTitle>
        <TrendingUp className="h-4 w-4 text-gray-400" />
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Monthly SIP (₹)</label>
            <Input type="number" value={monthly} onChange={(e) => setMonthly(e.target.value)} />
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Duration (Years)</label>
            <Input type="number" value={years} onChange={(e) => setYears(e.target.value)} />
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Expected Return (%)</label>
            <Input type="number" value={rate} onChange={(e) => setRate(e.target.value)} />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3 pt-2 border-t border-gray-100 dark:border-gray-800">
          {[
            { label: "Total Invested", value: formatCurrency(invested), color: "text-gray-900 dark:text-white" },
            { label: "Wealth Gained", value: formatCurrency(wealthGained), color: "text-emerald-500" },
            { label: "Maturity Value", value: formatCurrency(fv), color: "text-indigo-500" },
          ].map((c) => (
            <div key={c.label} className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 text-center">
              <p className="text-[10px] text-gray-500">{c.label}</p>
              <p className={cn("text-sm font-bold mt-0.5", c.color)}>{c.value}</p>
            </div>
          ))}
        </div>
        <div className="h-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${Math.min(100, (invested / fv) * 100)}%` }} />
        </div>
        <p className="text-[11px] text-gray-500 text-center">
          Invested: {((invested / fv) * 100).toFixed(1)}% · Gains: {((wealthGained / fv) * 100).toFixed(1)}%
        </p>
      </CardContent>
    </Card>
  );
}

// ── Tax Calculator ─────────────────────────────────────────────────────────
function TaxCalc() {
  const [buyPrice, setBuyPrice] = useState("");
  const [sellPrice, setSellPrice] = useState("");
  const [qty, setQty] = useState("");
  const [holdingDays, setHoldingDays] = useState("");

  const buy = parseFloat(buyPrice) || 0;
  const sell = parseFloat(sellPrice) || 0;
  const q = parseFloat(qty) || 0;
  const days = parseFloat(holdingDays) || 0;

  const gain = (sell - buy) * q;
  const isLTCG = days >= 365;
  const taxableGain = isLTCG ? Math.max(0, gain - 100000) : gain;
  const taxRate = isLTCG ? 0.10 : 0.15;
  const tax = gain > 0 ? taxableGain * taxRate : 0;
  const netProfit = gain - tax;
  const stt = sell * q * 0.001;
  const totalCharges = stt + (sell * q * 0.0001);

  return (
    <Card>
      <CardHeader>
        <CardTitle>STCG / LTCG Tax Calculator</CardTitle>
        <IndianRupee className="h-4 w-4 text-gray-400" />
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Buy Price (₹)</label>
            <Input type="number" value={buyPrice} onChange={(e) => setBuyPrice(e.target.value)} placeholder="Entry price" />
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Sell Price (₹)</label>
            <Input type="number" value={sellPrice} onChange={(e) => setSellPrice(e.target.value)} placeholder="Exit price" />
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Quantity</label>
            <Input type="number" value={qty} onChange={(e) => setQty(e.target.value)} />
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Holding Period (days)</label>
            <Input type="number" value={holdingDays} onChange={(e) => setHoldingDays(e.target.value)} placeholder="e.g. 400" />
          </div>
        </div>
        {buy > 0 && sell > 0 && q > 0 && days > 0 && (
          <div className="space-y-3 pt-2 border-t border-gray-100 dark:border-gray-800">
            <div className={cn("px-3 py-2 rounded-lg text-xs font-semibold", isLTCG ? "bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300" : "bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300")}>
              {isLTCG ? "📅 Long Term Capital Gain (LTCG) — 10% above ₹1L exemption" : "⚡ Short Term Capital Gain (STCG) — 15% flat"}
            </div>
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: "Total Gain/Loss", value: formatCurrency(gain), color: gain >= 0 ? "text-emerald-500" : "text-red-500" },
                { label: "Taxable Gain", value: formatCurrency(taxableGain), color: "" },
                { label: `Tax (${(taxRate * 100).toFixed(0)}%)`, value: formatCurrency(tax), color: "text-red-500" },
                { label: "STT + Charges", value: formatCurrency(totalCharges), color: "text-orange-500" },
                { label: "Net Profit (after tax)", value: formatCurrency(netProfit - totalCharges), color: netProfit >= 0 ? "text-emerald-500" : "text-red-500" },
                { label: "Effective Return", value: buy > 0 ? formatPercent(((sell - buy) / buy) * 100) : "—", color: "" },
              ].map((row) => (
                <div key={row.label} className="bg-gray-50 dark:bg-gray-800 rounded-lg p-2.5">
                  <p className="text-[10px] text-gray-500">{row.label}</p>
                  <p className={cn("text-sm font-bold mt-0.5", row.color || "text-gray-900 dark:text-white")}>{row.value}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ── Pivot Points ────────────────────────────────────────────────────────────
function PivotCalc() {
  const [high, setHigh] = useState("");
  const [low, setLow] = useState("");
  const [close, setClose] = useState("");

  const h = parseFloat(high) || 0;
  const l = parseFloat(low) || 0;
  const c = parseFloat(close) || 0;

  const pp = h && l && c ? (h + l + c) / 3 : 0;
  const r1 = 2 * pp - l;
  const r2 = pp + (h - l);
  const r3 = h + 2 * (pp - l);
  const s1 = 2 * pp - h;
  const s2 = pp - (h - l);
  const s3 = l - 2 * (h - pp);
  const cprTop = (h + l) / 2;
  const cprBottom = pp;

  const levels = [
    { label: "R3", value: r3, color: "text-red-600 dark:text-red-400" },
    { label: "R2", value: r2, color: "text-red-500" },
    { label: "R1", value: r1, color: "text-red-400" },
    { label: "CPR Top", value: cprTop, color: "text-amber-500" },
    { label: "Pivot (PP)", value: pp, color: "text-indigo-500 font-bold" },
    { label: "CPR Bottom", value: cprBottom, color: "text-amber-500" },
    { label: "S1", value: s1, color: "text-emerald-400" },
    { label: "S2", value: s2, color: "text-emerald-500" },
    { label: "S3", value: s3, color: "text-emerald-600 dark:text-emerald-400" },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Intraday Pivot Points & CPR</CardTitle>
        <Percent className="h-4 w-4 text-gray-400" />
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Previous High (₹)</label>
            <Input type="number" value={high} onChange={(e) => setHigh(e.target.value)} placeholder="e.g. 2980" />
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Previous Low (₹)</label>
            <Input type="number" value={low} onChange={(e) => setLow(e.target.value)} placeholder="e.g. 2910" />
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Previous Close (₹)</label>
            <Input type="number" value={close} onChange={(e) => setClose(e.target.value)} placeholder="e.g. 2945" />
          </div>
        </div>
        {pp > 0 && (
          <div className="space-y-1.5 pt-2 border-t border-gray-100 dark:border-gray-800">
            {levels.map((lv) => (
              <div key={lv.label} className="flex items-center justify-between py-1.5 px-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                <span className="text-xs text-gray-600 dark:text-gray-400 w-20">{lv.label}</span>
                <div className="flex-1 mx-3 h-1 bg-gray-200 dark:bg-gray-700 rounded" />
                <span className={cn("text-sm font-mono", lv.color)}>{formatCurrency(lv.value)}</span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function ToolsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Trading Tools</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
          Calculators for position sizing, SIP, tax, and intraday levels
        </p>
      </div>
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <StopLossCalc />
        <SIPCalc />
        <TaxCalc />
        <PivotCalc />
      </div>
    </div>
  );
}

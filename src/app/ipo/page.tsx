"use client";

import { Calendar, TrendingUp, TrendingDown, Clock, CheckCircle, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency, cn } from "@/lib/utils";

interface IPO {
  company: string;
  symbol: string;
  sector: string;
  openDate: string;
  closeDate: string;
  listingDate: string;
  priceBand: [number, number];
  lotSize: number;
  issueSize: string;
  gmp: number;
  subscriptionTimes: number | null;
  status: "upcoming" | "open" | "closed" | "listed";
  listingPrice?: number;
  issuePrice?: number;
}

const IPOS: IPO[] = [
  { company: "Ola Electric Mobility", symbol: "OLAELEC", sector: "EV / Auto", openDate: "2025-07-08", closeDate: "2025-07-10", listingDate: "2025-07-18", priceBand: [72, 76], lotSize: 195, issueSize: "₹6,146 Cr", gmp: 12, subscriptionTimes: 4.3, status: "listed", listingPrice: 76, issuePrice: 76 },
  { company: "Bajaj Housing Finance", symbol: "BAJAJHFL", sector: "NBFC", openDate: "2025-09-09", closeDate: "2025-09-11", listingDate: "2025-09-16", priceBand: [66, 70], lotSize: 214, issueSize: "₹6,560 Cr", gmp: 58, subscriptionTimes: 64.0, status: "listed", listingPrice: 150, issuePrice: 70 },
  { company: "Hyundai India", symbol: "HYUNDAI", sector: "Auto", openDate: "2025-10-15", closeDate: "2025-10-17", listingDate: "2025-10-22", priceBand: [1865, 1960], lotSize: 7, issueSize: "₹27,870 Cr", gmp: -40, subscriptionTimes: 2.4, status: "listed", listingPrice: 1934, issuePrice: 1960 },
  { company: "Swiggy", symbol: "SWIGGY", sector: "Food Tech", openDate: "2025-11-06", closeDate: "2025-11-08", listingDate: "2025-11-13", priceBand: [371, 390], lotSize: 38, issueSize: "₹11,327 Cr", gmp: 10, subscriptionTimes: 3.6, status: "listed", listingPrice: 412, issuePrice: 390 },
  { company: "Niva Bupa Health Insurance", symbol: "NIVABUPA", sector: "Insurance", openDate: "2025-11-07", closeDate: "2025-11-11", listingDate: "2025-11-14", priceBand: [70, 74], lotSize: 202, issueSize: "₹2,200 Cr", gmp: 5, subscriptionTimes: 2.0, status: "listed", listingPrice: 78, issuePrice: 74 },
  { company: "Vishal Mega Mart", symbol: "VISHALMEGA", sector: "Retail", openDate: "2025-12-11", closeDate: "2025-12-13", listingDate: "2025-12-18", priceBand: [74, 78], lotSize: 192, issueSize: "₹8,000 Cr", gmp: 18, subscriptionTimes: 27.3, status: "listed", listingPrice: 98, issuePrice: 78 },
  { company: "HDB Financial Services", symbol: "HDBFIN", sector: "NBFC", openDate: "2026-06-20", closeDate: "2026-06-24", listingDate: "2026-07-02", priceBand: [700, 740], lotSize: 20, issueSize: "₹12,500 Cr", gmp: 85, subscriptionTimes: null, status: "upcoming" },
  { company: "LG Electronics India", symbol: "LGEINDIA", sector: "Consumer Electronics", openDate: "2026-07-01", closeDate: "2026-07-03", listingDate: "2026-07-10", priceBand: [1500, 1600], lotSize: 9, issueSize: "₹15,000 Cr", gmp: 120, subscriptionTimes: null, status: "upcoming" },
  { company: "Ather Energy", symbol: "ATHER", sector: "EV", openDate: "2026-07-15", closeDate: "2026-07-17", listingDate: "2026-07-24", priceBand: [304, 321], lotSize: 46, issueSize: "₹2,981 Cr", gmp: 35, subscriptionTimes: null, status: "upcoming" },
  { company: "PhysicsWallah", symbol: "PW", sector: "EdTech", openDate: "2026-08-01", closeDate: "2026-08-05", listingDate: "2026-08-12", priceBand: [1100, 1200], lotSize: 12, issueSize: "₹3,500 Cr", gmp: 200, subscriptionTimes: null, status: "upcoming" },
];

const STATUS_CONFIG = {
  upcoming: { label: "Upcoming", icon: Clock, className: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200" },
  open: { label: "Open Now", icon: AlertCircle, className: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200" },
  closed: { label: "Closed", icon: CheckCircle, className: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300" },
  listed: { label: "Listed", icon: CheckCircle, className: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200" },
};

export default function IPOPage() {
  const upcoming = IPOS.filter((i) => i.status === "upcoming" || i.status === "open");
  const past = IPOS.filter((i) => i.status === "listed" || i.status === "closed");

  function listingGain(ipo: IPO): number | null {
    if (!ipo.listingPrice || !ipo.issuePrice) return null;
    return ((ipo.listingPrice - ipo.issuePrice) / ipo.issuePrice) * 100;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">IPO Calendar</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
          Upcoming & recent NSE/BSE IPOs with GMP and subscription data
        </p>
      </div>

      {/* Upcoming IPOs */}
      <div>
        <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
          <Clock className="h-4 w-4 text-blue-500" /> Upcoming IPOs
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {upcoming.map((ipo) => {
            const cfg = STATUS_CONFIG[ipo.status];
            const minInvestment = ipo.priceBand[1] * ipo.lotSize;
            return (
              <Card key={ipo.symbol}>
                <CardContent className="pt-4 pb-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-bold text-gray-900 dark:text-white">{ipo.company}</p>
                      <p className="text-xs text-gray-500">{ipo.sector}</p>
                    </div>
                    <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1", cfg.className)}>
                      <cfg.icon className="h-3 w-3" /> {cfg.label}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs mb-3">
                    <div><span className="text-gray-500">Open:</span> <span className="font-medium text-gray-900 dark:text-white">{ipo.openDate}</span></div>
                    <div><span className="text-gray-500">Close:</span> <span className="font-medium text-gray-900 dark:text-white">{ipo.closeDate}</span></div>
                    <div><span className="text-gray-500">Price Band:</span> <span className="font-mono font-medium">₹{ipo.priceBand[0]}–{ipo.priceBand[1]}</span></div>
                    <div><span className="text-gray-500">Lot Size:</span> <span className="font-medium">{ipo.lotSize} shares</span></div>
                    <div><span className="text-gray-500">Issue Size:</span> <span className="font-medium">{ipo.issueSize}</span></div>
                    <div><span className="text-gray-500">Min Investment:</span> <span className="font-medium">{formatCurrency(minInvestment)}</span></div>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-800">
                    <div>
                      <p className="text-[10px] text-gray-500">GMP (Grey Market)</p>
                      <p className={cn("text-sm font-bold", ipo.gmp >= 0 ? "text-emerald-500" : "text-red-500")}>
                        {ipo.gmp >= 0 ? "+" : ""}₹{ipo.gmp}
                        <span className="text-[10px] ml-1">({((ipo.gmp / ipo.priceBand[1]) * 100).toFixed(1)}%)</span>
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] text-gray-500">Listing Date</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{ipo.listingDate}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Listed IPOs */}
      <div>
        <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
          <CheckCircle className="h-4 w-4 text-purple-500" /> Recently Listed
        </h2>
        <Card>
          <CardContent className="pt-0 pb-0 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-800">
                  {["Company", "Sector", "Issue Price", "Listing Price", "Listing Gain", "Subscribed", "Status"].map((h) => (
                    <th key={h} className={cn("py-3 px-4 text-xs font-medium text-gray-500", h === "Company" || h === "Sector" ? "text-left" : "text-right")}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {past.map((ipo) => {
                  const gain = listingGain(ipo);
                  return (
                    <tr key={ipo.symbol} className="border-b border-gray-100 dark:border-gray-800 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-800/40">
                      <td className="py-3 px-4">
                        <p className="font-semibold text-gray-900 dark:text-white">{ipo.company}</p>
                        <p className="text-[10px] text-gray-500">{ipo.symbol}</p>
                      </td>
                      <td className="py-3 px-4 text-xs text-gray-500">{ipo.sector}</td>
                      <td className="py-3 px-4 text-right font-mono">{ipo.issuePrice ? formatCurrency(ipo.issuePrice) : "—"}</td>
                      <td className="py-3 px-4 text-right font-mono">{ipo.listingPrice ? formatCurrency(ipo.listingPrice) : "—"}</td>
                      <td className={cn("py-3 px-4 text-right font-mono font-bold", gain !== null ? gain >= 0 ? "text-emerald-500" : "text-red-500" : "text-gray-400")}>
                        {gain !== null ? (
                          <span className="flex items-center justify-end gap-1">
                            {gain >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                            {gain >= 0 ? "+" : ""}{gain.toFixed(1)}%
                          </span>
                        ) : "—"}
                      </td>
                      <td className="py-3 px-4 text-right text-xs">
                        {ipo.subscriptionTimes ? <span className="font-semibold text-indigo-500">{ipo.subscriptionTimes}x</span> : "—"}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full", STATUS_CONFIG[ipo.status].className)}>
                          {STATUS_CONFIG[ipo.status].label}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

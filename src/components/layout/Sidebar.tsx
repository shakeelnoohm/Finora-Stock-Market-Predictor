"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, BrainCircuit, Star, TrendingUp, BarChart2,
  Settings, Zap, GitCompare, Briefcase, ScanLine, Bell,
  Grid2x2, Wrench, CalendarDays,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_GROUPS = [
  {
    label: "Overview",
    items: [
      { href: "/", icon: LayoutDashboard, label: "Dashboard" },
      { href: "/heatmap", icon: Grid2x2, label: "Sector Heatmap" },
      { href: "/markets", icon: BarChart2, label: "Markets" },
    ],
  },
  {
    label: "Stock Picking",
    items: [
      { href: "/picks", icon: Zap, label: "Daily Picks" },
      { href: "/scanner", icon: ScanLine, label: "Swing Scanner" },
      { href: "/compare", icon: GitCompare, label: "Compare" },
      { href: "/predict", icon: BrainCircuit, label: "AI Predict" },
    ],
  },
  {
    label: "My Portfolio",
    items: [
      { href: "/portfolio", icon: Briefcase, label: "Portfolio" },
      { href: "/watchlist", icon: Star, label: "Watchlist" },
      { href: "/alerts", icon: Bell, label: "Price Alerts" },
    ],
  },
  {
    label: "Tools & More",
    items: [
      { href: "/tools", icon: Wrench, label: "Trading Tools" },
      { href: "/ipo", icon: CalendarDays, label: "IPO Calendar" },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex flex-col w-64 shrink-0 min-h-screen bg-gray-950 border-r border-gray-800 overflow-y-auto">
      <div className="flex items-center gap-2.5 px-6 py-5 border-b border-gray-800 shrink-0">
        <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
          <TrendingUp className="h-4 w-4 text-white" />
        </div>
        <div>
          <span className="font-bold text-white text-sm">Finora</span>
          <p className="text-[10px] text-gray-500 leading-none mt-0.5">NSE · BSE Predictor</p>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-5">
        {NAV_GROUPS.map((group) => (
          <div key={group.label}>
            <p className="text-[10px] font-semibold text-gray-600 uppercase tracking-widest px-3 mb-1.5">{group.label}</p>
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const active = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-150",
                      active
                        ? "bg-indigo-600 text-white font-medium"
                        : "text-gray-400 hover:text-white hover:bg-gray-800"
                    )}
                  >
                    <item.icon className="h-4 w-4 shrink-0" />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="px-3 pb-4 border-t border-gray-800 pt-4 shrink-0">
        <Link
          href="/settings"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-gray-800 transition-all"
        >
          <Settings className="h-4 w-4" />
          Settings
        </Link>
        <div className="mt-3 mx-3 p-3 rounded-lg bg-indigo-950 border border-indigo-900">
          <p className="text-xs font-medium text-indigo-300">AI Predictions</p>
          <p className="text-[11px] text-indigo-400 mt-1 leading-relaxed">
            LSTM model runs in-browser via TensorFlow.js. No data leaves your device.
          </p>
        </div>
      </div>
    </aside>
  );
}

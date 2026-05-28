"use client";

import { useEffect, useState, useCallback } from "react";
import { Bell, Plus, Trash2, BellRing, Check } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatCurrency, cn } from "@/lib/utils";
import {
  PriceAlert, Notification, loadAlerts, saveAlerts,
  loadNotifications, saveNotifications, checkAlerts,
} from "@/lib/alerts";
import { POPULAR_STOCKS } from "@/lib/constants";

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<PriceAlert[]>([]);
  const [notifs, setNotifs] = useState<Notification[]>([]);
  const [form, setForm] = useState({ symbol: "", type: "above" as PriceAlert["type"], value: "" });
  const [showForm, setShowForm] = useState(false);
  const [suggestions, setSuggestions] = useState<{ symbol: string; name: string }[]>([]);

  useEffect(() => {
    setAlerts(loadAlerts());
    setNotifs(loadNotifications());
  }, []);

  const pollPrices = useCallback(async () => {
    const activeAlerts = alerts.filter((a) => !a.triggered);
    if (!activeAlerts.length) return;
    const syms = [...new Set(activeAlerts.map((a) => a.symbol))];
    const results = await Promise.allSettled(
      syms.map((s) => fetch(`/api/stock/quote?symbol=${s}`).then((r) => r.json()))
    );
    const prices: Record<string, number> = {};
    results.forEach((r, i) => {
      if (r.status === "fulfilled") prices[syms[i]] = r.value.price;
    });
    const { updated, fired } = checkAlerts(alerts, prices);
    if (fired.length) {
      const newNotifs: Notification[] = fired.map((a) => ({
        id: Date.now().toString() + a.symbol,
        title: `Alert: ${a.symbol}`,
        message: `${a.symbol} is now ${a.type === "above" ? "above" : "below"} ${formatCurrency(a.value)}`,
        type: "alert",
        read: false,
        createdAt: new Date().toISOString(),
      }));
      const allNotifs = [...newNotifs, ...notifs];
      setNotifs(allNotifs);
      saveNotifications(allNotifs);
      setAlerts(updated);
      saveAlerts(updated);
    }
  }, [alerts, notifs]);

  useEffect(() => {
    const id = setInterval(pollPrices, 30000);
    return () => clearInterval(id);
  }, [pollPrices]);

  function addAlert() {
    if (!form.symbol || !form.value) return;
    const known = POPULAR_STOCKS.find((s) => s.symbol === form.symbol.toUpperCase());
    const alert: PriceAlert = {
      id: Date.now().toString(),
      symbol: form.symbol.toUpperCase(),
      name: known?.name ?? form.symbol.toUpperCase(),
      type: form.type,
      value: parseFloat(form.value),
      triggered: false,
      createdAt: new Date().toISOString(),
    };
    const updated = [...alerts, alert];
    setAlerts(updated);
    saveAlerts(updated);
    setForm({ symbol: "", type: "above", value: "" });
    setShowForm(false);
  }

  function deleteAlert(id: string) {
    const updated = alerts.filter((a) => a.id !== id);
    setAlerts(updated);
    saveAlerts(updated);
  }

  function markAllRead() {
    const updated = notifs.map((n) => ({ ...n, read: true }));
    setNotifs(updated);
    saveNotifications(updated);
  }

  function clearNotifs() {
    setNotifs([]);
    saveNotifications([]);
  }

  const unread = notifs.filter((n) => !n.read).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Price Alerts</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Get notified when stocks hit your target price</p>
        </div>
        <Button onClick={() => setShowForm((v) => !v)}>
          <Plus className="h-4 w-4" /> New Alert
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader><CardTitle>Create Alert</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="relative">
                <Input
                  placeholder="Symbol (e.g. RELIANCE)"
                  value={form.symbol}
                  onChange={(e) => {
                    const q = e.target.value.toUpperCase();
                    setForm((f) => ({ ...f, symbol: q }));
                    setSuggestions(q ? POPULAR_STOCKS.filter((s) => s.symbol.startsWith(q)).slice(0, 4) : []);
                  }}
                />
                {suggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 z-20 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg mt-1 shadow-lg">
                    {suggestions.map((s) => (
                      <button key={s.symbol} onClick={() => { setForm((f) => ({ ...f, symbol: s.symbol })); setSuggestions([]); }}
                        className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-800">
                        <span className="font-mono font-bold">{s.symbol}</span>
                        <span className="text-gray-500 ml-2 text-xs">{s.name}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <select
                value={form.type}
                onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as PriceAlert["type"] }))}
                className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
              >
                <option value="above">Price goes above</option>
                <option value="below">Price goes below</option>
              </select>
              <Input type="number" placeholder="Target Price (₹)" value={form.value} onChange={(e) => setForm((f) => ({ ...f, value: e.target.value }))} />
              <Button onClick={addAlert}>Set Alert</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Active Alerts */}
        <Card>
          <CardHeader>
            <CardTitle>Active Alerts ({alerts.filter((a) => !a.triggered).length})</CardTitle>
            <Bell className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent className="pt-0">
            {alerts.length === 0 ? (
              <p className="text-sm text-gray-500 py-8 text-center">No alerts set yet.</p>
            ) : (
              <div className="space-y-2">
                {alerts.map((a) => (
                  <div key={a.id} className={cn(
                    "flex items-center justify-between px-4 py-3 rounded-xl border",
                    a.triggered
                      ? "border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/30"
                      : "border-gray-200 dark:border-gray-800"
                  )}>
                    <div className="flex items-center gap-3">
                      {a.triggered
                        ? <Check className="h-4 w-4 text-emerald-500" />
                        : <BellRing className="h-4 w-4 text-amber-500" />}
                      <div>
                        <p className="font-mono font-bold text-sm text-gray-900 dark:text-white">{a.symbol}</p>
                        <p className="text-xs text-gray-500">
                          {a.type === "above" ? "↑ Above" : "↓ Below"} {formatCurrency(a.value)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {a.triggered && <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">TRIGGERED</span>}
                      <Button size="sm" variant="ghost" onClick={() => deleteAlert(a.id)}>
                        <Trash2 className="h-3.5 w-3.5 text-red-400" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Notification Center */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <CardTitle>Notifications</CardTitle>
              {unread > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-red-500 text-white text-[10px] font-bold">{unread}</span>
              )}
            </div>
            <div className="flex gap-2">
              {unread > 0 && <Button size="sm" variant="ghost" onClick={markAllRead}>Mark all read</Button>}
              {notifs.length > 0 && <Button size="sm" variant="ghost" onClick={clearNotifs}>Clear</Button>}
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            {notifs.length === 0 ? (
              <p className="text-sm text-gray-500 py-8 text-center">No notifications yet.</p>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {notifs.map((n) => (
                  <div key={n.id} className={cn(
                    "px-4 py-3 rounded-xl border",
                    !n.read ? "border-indigo-200 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-950/30" : "border-gray-200 dark:border-gray-800"
                  )}>
                    <div className="flex items-center justify-between mb-0.5">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">{n.title}</p>
                      {!n.read && <span className="w-2 h-2 rounded-full bg-indigo-500" />}
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400">{n.message}</p>
                    <p className="text-[10px] text-gray-400 mt-1">{new Date(n.createdAt).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

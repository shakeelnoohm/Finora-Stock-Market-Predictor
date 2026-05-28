export type AlertType = "above" | "below" | "rsi_above" | "rsi_below";

export interface PriceAlert {
  id: string;
  symbol: string;
  name: string;
  type: AlertType;
  value: number;
  triggered: boolean;
  createdAt: string;
  triggeredAt?: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: "alert" | "signal" | "info";
  read: boolean;
  createdAt: string;
}

export function loadAlerts(): PriceAlert[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem("price_alerts") ?? "[]"); } catch { return []; }
}

export function saveAlerts(alerts: PriceAlert[]) {
  localStorage.setItem("price_alerts", JSON.stringify(alerts));
}

export function loadNotifications(): Notification[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem("notifications") ?? "[]"); } catch { return []; }
}

export function saveNotifications(notifs: Notification[]) {
  localStorage.setItem("notifications", JSON.stringify(notifs.slice(0, 50)));
}

export function checkAlerts(
  alerts: PriceAlert[],
  prices: Record<string, number>
): { updated: PriceAlert[]; fired: PriceAlert[] } {
  const fired: PriceAlert[] = [];
  const updated = alerts.map((a) => {
    if (a.triggered) return a;
    const price = prices[a.symbol];
    if (price === undefined) return a;
    const hit =
      (a.type === "above" && price >= a.value) ||
      (a.type === "below" && price <= a.value);
    if (hit) {
      fired.push(a);
      return { ...a, triggered: true, triggeredAt: new Date().toISOString() };
    }
    return a;
  });
  return { updated, fired };
}

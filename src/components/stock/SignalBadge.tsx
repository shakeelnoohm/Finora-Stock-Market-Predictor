import { cn } from "@/lib/utils";
import type { StockScore } from "@/lib/indicators";

interface SignalBadgeProps {
  signal: StockScore["signal"];
  size?: "sm" | "md" | "lg";
  className?: string;
}

const CONFIG: Record<StockScore["signal"], { label: string; className: string }> = {
  "Strong Buy": {
    label: "Strong Buy",
    className: "bg-emerald-500 text-white",
  },
  Buy: {
    label: "Buy",
    className: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200",
  },
  Hold: {
    label: "Hold",
    className: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200",
  },
  Sell: {
    label: "Sell",
    className: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  },
  "Strong Sell": {
    label: "Strong Sell",
    className: "bg-red-600 text-white",
  },
};

export function SignalBadge({ signal, size = "md", className }: SignalBadgeProps) {
  const cfg = CONFIG[signal];
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center font-bold rounded-full",
        size === "sm" && "px-2 py-0.5 text-[10px]",
        size === "md" && "px-3 py-1 text-xs",
        size === "lg" && "px-4 py-1.5 text-sm",
        cfg.className,
        className
      )}
    >
      {cfg.label}
    </span>
  );
}

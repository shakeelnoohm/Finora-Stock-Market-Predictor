import { cn } from "@/lib/utils";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "positive" | "negative" | "neutral" | "outline";
  className?: string;
}

export function Badge({ children, variant = "default", className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold",
        variant === "default" && "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200",
        variant === "positive" && "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200",
        variant === "negative" && "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
        variant === "neutral" && "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
        variant === "outline" && "border border-current bg-transparent",
        className
      )}
    >
      {children}
    </span>
  );
}

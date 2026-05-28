import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes, forwardRef } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "ghost" | "destructive" | "secondary";
  size?: "sm" | "md" | "lg" | "icon";
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "md", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center rounded-lg font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 disabled:opacity-50 disabled:pointer-events-none",
          variant === "default" &&
            "bg-indigo-600 text-white hover:bg-indigo-700 active:bg-indigo-800",
          variant === "outline" &&
            "border border-gray-300 dark:border-gray-700 bg-transparent hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300",
          variant === "ghost" &&
            "bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300",
          variant === "destructive" &&
            "bg-red-600 text-white hover:bg-red-700",
          variant === "secondary" &&
            "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700",
          size === "sm" && "h-8 px-3 text-sm gap-1.5",
          size === "md" && "h-10 px-4 text-sm gap-2",
          size === "lg" && "h-12 px-6 text-base gap-2",
          size === "icon" && "h-9 w-9",
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

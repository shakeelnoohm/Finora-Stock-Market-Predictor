"use client";

import { Bell, Moon, Sun } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { StockSearch } from "@/components/stock/StockSearch";
import { useRouter } from "next/navigation";

export function Header() {
  const [dark, setDark] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (dark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [dark]);

  function handleSelect(symbol: string) {
    router.push(`/predict?symbol=${symbol}`);
  }

  return (
    <header className="h-16 flex items-center gap-4 px-6 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 shrink-0">
      <StockSearch onSelect={handleSelect} className="flex-1 max-w-md" />
      <div className="flex items-center gap-2 ml-auto">
        <Button variant="ghost" size="icon" onClick={() => setDark((d) => !d)}>
          {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>
        <Button variant="ghost" size="icon">
          <Bell className="h-4 w-4" />
        </Button>
        <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs font-bold select-none">
          F
        </div>
      </div>
    </header>
  );
}

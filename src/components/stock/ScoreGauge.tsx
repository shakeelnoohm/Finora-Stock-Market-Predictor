"use client";

import { cn } from "@/lib/utils";

interface ScoreGaugeProps {
  score: number;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  className?: string;
}

export function ScoreGauge({ score, size = "md", showLabel = true, className }: ScoreGaugeProps) {
  const color =
    score >= 70 ? "#22c55e" :
    score >= 55 ? "#86efac" :
    score >= 40 ? "#f59e0b" :
    score >= 25 ? "#f97316" : "#ef4444";

  const r = size === "lg" ? 44 : size === "md" ? 32 : 22;
  const stroke = size === "lg" ? 6 : size === "md" ? 5 : 4;
  const svgSize = (r + stroke) * 2;
  const circumference = 2 * Math.PI * r;
  const dash = (score / 100) * circumference;
  const fontSize = size === "lg" ? 16 : size === "md" ? 12 : 9;

  return (
    <div className={cn("flex flex-col items-center gap-1", className)}>
      <svg width={svgSize} height={svgSize} viewBox={`0 0 ${svgSize} ${svgSize}`} className="-rotate-90">
        <circle
          cx={svgSize / 2}
          cy={svgSize / 2}
          r={r}
          fill="none"
          stroke="currentColor"
          strokeWidth={stroke}
          className="text-gray-200 dark:text-gray-800"
        />
        <circle
          cx={svgSize / 2}
          cy={svgSize / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${dash} ${circumference - dash}`}
          style={{ transition: "stroke-dasharray 0.6s ease" }}
        />
        <text
          x={svgSize / 2}
          y={svgSize / 2}
          textAnchor="middle"
          dominantBaseline="central"
          className="rotate-90 fill-gray-900 dark:fill-white font-bold"
          fontSize={fontSize}
          style={{ transform: `rotate(90deg)`, transformOrigin: `${svgSize / 2}px ${svgSize / 2}px` }}
        >
          {Math.round(score)}
        </text>
      </svg>
      {showLabel && (
        <span className="text-[10px] text-gray-500 dark:text-gray-400 font-medium">Score</span>
      )}
    </div>
  );
}

import { NextRequest, NextResponse } from "next/server";
import { generateHistoricalData } from "@/lib/mockData";
import { fetchYahooHistory } from "@/lib/yahoo";
import type { TimeRange } from "@/lib/types";

const RANGE_DAYS: Record<TimeRange, number> = {
  "1D": 1,
  "1W": 7,
  "1M": 30,
  "3M": 90,
  "6M": 180,
  "1Y": 365,
  "5Y": 1825,
};

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const symbol = searchParams.get("symbol")?.toUpperCase();
  const range = (searchParams.get("range") as TimeRange) ?? "1M";

  if (!symbol) {
    return NextResponse.json({ error: "Symbol is required" }, { status: 400 });
  }

  // 1. Try Yahoo Finance (live, no API key needed)
  const yahooData = await fetchYahooHistory(symbol, range);
  if (yahooData && yahooData.length > 0) {
    return NextResponse.json(yahooData);
  }

  // 2. Fallback to mock data
  const days = RANGE_DAYS[range] ?? 30;
  const data = generateHistoricalData(symbol, days);
  return NextResponse.json(data);
}

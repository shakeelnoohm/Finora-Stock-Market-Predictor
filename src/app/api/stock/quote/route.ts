import { NextRequest, NextResponse } from "next/server";
import { generateQuote } from "@/lib/mockData";
import { POPULAR_STOCKS } from "@/lib/constants";
import { fetchYahooQuote } from "@/lib/yahoo";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const symbol = searchParams.get("symbol")?.toUpperCase();

  if (!symbol) {
    return NextResponse.json({ error: "Symbol is required" }, { status: 400 });
  }

  // 1. Try Yahoo Finance (live, no API key needed)
  const yahooQuote = await fetchYahooQuote(symbol);
  if (yahooQuote) {
    return NextResponse.json({ ...yahooQuote, source: "yahoo" });
  }

  // 2. Fallback to mock data
  const known = POPULAR_STOCKS.find((s) => s.symbol === symbol);
  const quote = generateQuote(symbol, known?.name ?? symbol);
  return NextResponse.json({ ...quote, source: "mock" });
}

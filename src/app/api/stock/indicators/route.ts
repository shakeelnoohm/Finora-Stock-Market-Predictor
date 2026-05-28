import { NextRequest, NextResponse } from "next/server";
import { generateHistoricalData, generateQuote } from "@/lib/mockData";
import { scoreStock } from "@/lib/indicators";
import { POPULAR_STOCKS } from "@/lib/constants";
import { fetchYahooHistory, fetchYahooQuote } from "@/lib/yahoo";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const symbol = searchParams.get("symbol")?.toUpperCase();
  if (!symbol) return NextResponse.json({ error: "Symbol required" }, { status: 400 });

  const known = POPULAR_STOCKS.find((s) => s.symbol === symbol);
  const name = known?.name ?? symbol;

  const [yahooHistory, yahooQuote] = await Promise.all([
    fetchYahooHistory(symbol, "3M"),
    fetchYahooQuote(symbol),
  ]);

  const history = (yahooHistory && yahooHistory.length > 10) ? yahooHistory : generateHistoricalData(symbol, 90);
  const changePercent = yahooQuote?.changePercent ?? generateQuote(symbol, name).changePercent;

  const result = scoreStock(symbol, name, history, changePercent);
  return NextResponse.json({ ...result, source: yahooQuote ? "yahoo" : "mock" });
}

import { NextResponse } from "next/server";
import { POPULAR_STOCKS } from "@/lib/constants";
import { generateHistoricalData, generateQuote } from "@/lib/mockData";
import { scanPatterns } from "@/lib/scanner";
import { fetchYahooHistory, fetchYahooQuote } from "@/lib/yahoo";

export async function GET() {
  const results = await Promise.all(
    POPULAR_STOCKS.map(async ({ symbol, name }) => {
      try {
        const [yahooHistory, yahooQuote] = await Promise.all([
          fetchYahooHistory(symbol, "3M"),
          fetchYahooQuote(symbol),
        ]);
        const history = (yahooHistory && yahooHistory.length > 10)
          ? yahooHistory
          : generateHistoricalData(symbol, 60);
        const quote = yahooQuote ?? generateQuote(symbol, name);
        const scan = scanPatterns(history, symbol, name);
        return { ...scan, changePercent: quote.changePercent, price: quote.price };
      } catch {
        const history = generateHistoricalData(symbol, 60);
        const quote = generateQuote(symbol, name);
        const scan = scanPatterns(history, symbol, name);
        return { ...scan, changePercent: quote.changePercent, price: quote.price };
      }
    })
  );
  return NextResponse.json(results);
}

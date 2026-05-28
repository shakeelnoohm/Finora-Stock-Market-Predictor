import { NextResponse } from "next/server";
import { POPULAR_STOCKS } from "@/lib/constants";
import { generateHistoricalData, generateQuote } from "@/lib/mockData";
import { scoreStock } from "@/lib/indicators";
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
          : generateHistoricalData(symbol, 90);
        const changePercent = yahooQuote?.changePercent ?? generateQuote(symbol, name).changePercent;
        const scored = scoreStock(symbol, name, history, changePercent);
        if (yahooQuote) {
          scored.price = yahooQuote.price;
          scored.changePercent = yahooQuote.changePercent;
        }
        return scored;
      } catch {
        return null;
      }
    })
  );

  const scored = results
    .filter(Boolean)
    .sort((a, b) => b!.score - a!.score);

  return NextResponse.json(scored);
}

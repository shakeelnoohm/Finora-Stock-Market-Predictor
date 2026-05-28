import { NextRequest, NextResponse } from "next/server";
import { POPULAR_STOCKS } from "@/lib/constants";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("q")?.toUpperCase() ?? "";

  if (!query || query.length < 1) {
    return NextResponse.json([]);
  }

  const apiKey = process.env.ALPHA_VANTAGE_API_KEY;

  if (apiKey && apiKey !== "demo") {
    try {
      const url = `https://www.alphavantage.co/query?function=SYMBOL_SEARCH&keywords=${query}&apikey=${apiKey}`;
      const res = await fetch(url, { next: { revalidate: 300 } });
      const data = await res.json();
      if (data.bestMatches?.length) {
        return NextResponse.json(
          data.bestMatches.slice(0, 8).map((m: Record<string, string>) => ({
            symbol: m["1. symbol"],
            name: m["2. name"],
          }))
        );
      }
    } catch {
      // fall through
    }
  }

  const results = POPULAR_STOCKS.filter(
    (s) => s.symbol.includes(query) || s.name.toUpperCase().includes(query)
  ).slice(0, 6);

  return NextResponse.json(results);
}

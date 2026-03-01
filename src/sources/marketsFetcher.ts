import { MARKET_INDICES, TECH_STOCKS } from "../config/sources";
import { getLogger } from "../logger";

const log = getLogger("markets");

export interface IndexQuote {
    name: string;
    symbol: string;
    price: number;
    previousClose: number;
    change: number;
    changePercent: number;
    category: "index" | "tech";
}

async function fetchQuote(symbol: string, name: string, category: "index" | "tech"): Promise<IndexQuote | null> {
    try {
        const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=1d&range=5d`;
        const res = await fetch(url);
        const data = await res.json();

        const result = data?.chart?.result?.[0];
        if (!result) {
            log.warn({ symbol }, "No chart data");
            return null;
        }

        const meta = result.meta ?? {};
        const quote = result.indicators?.quote?.[0];
        const price = meta.regularMarketPrice ?? quote?.close?.[quote.close.length - 1] ?? 0;
        const previousClose = meta.previousClose ?? meta.chartPreviousClose ?? price;

        const change = price - previousClose;
        const changePercent = previousClose !== 0 ? (change / previousClose) * 100 : 0;

        return { name, symbol, price, previousClose, change, changePercent, category };
    } catch (err) {
        log.warn({ symbol, err: err instanceof Error ? err.message : String(err) }, "Failed to fetch quote");
        return null;
    }
}

export async function fetchMarketIndices(): Promise<IndexQuote[]> {
    const results: IndexQuote[] = [];

    for (const { symbol, name } of MARKET_INDICES) {
        const q = await fetchQuote(symbol, name, "index");
        if (q) results.push(q);
    }
    for (const { symbol, name } of TECH_STOCKS) {
        const q = await fetchQuote(symbol, name, "tech");
        if (q) results.push(q);
    }

    log.debug({ indices: results.filter((r) => r.category === "index").length, tech: results.filter((r) => r.category === "tech").length }, "Markets fetched");
    return results;
}

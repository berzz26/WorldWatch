import { MARKET_INDICES } from "../config/sources";
import { getLogger } from "../logger";

const log = getLogger("markets");

export interface IndexQuote {
    name: string;
    symbol: string;
    price: number;
    previousClose: number;
    change: number;
    changePercent: number;
}

export async function fetchMarketIndices(): Promise<IndexQuote[]> {
    const results: IndexQuote[] = [];

    for (const { symbol, name } of MARKET_INDICES) {
        try {
            const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=1d&range=5d`;
            const res = await fetch(url);
            const data = await res.json();

            const result = data?.chart?.result?.[0];
            if (!result) {
                log.warn({ symbol }, "No chart data");
                continue;
            }

            const meta = result.meta ?? {};
            const quote = result.indicators?.quote?.[0];
            const price = meta.regularMarketPrice ?? quote?.close?.[quote.close.length - 1] ?? 0;
            const previousClose = meta.previousClose ?? meta.chartPreviousClose ?? price;

            const change = price - previousClose;
            const changePercent = previousClose !== 0 ? (change / previousClose) * 100 : 0;

            results.push({
                name,
                symbol,
                price,
                previousClose,
                change,
                changePercent,
            });
        } catch (err) {
            log.warn({ symbol, err: err instanceof Error ? err.message : String(err) }, "Failed to fetch index");
        }
    }

    log.debug({ fetched: results.length }, "Markets fetched");
    return results;
}

import { fetchReuters } from "../sources/reuters";
import { fetchRSS } from "../sources/rssFetcher";
import { RSS_SOURCES } from "../config/sources";
import type { EventItem } from "../types/event";
import { getLogger } from "../logger";

const log = getLogger("aggregator");

export async function aggregate(): Promise<EventItem[]> {
    const reuters = await fetchReuters();
    const rssResults = await Promise.all(
        RSS_SOURCES.map(url => fetchRSS(url))
    );
    const rssFlattened = rssResults.flat();
    const all = [...reuters, ...rssFlattened];
    log.info({ reuters: reuters.length, rss: rssFlattened.length, total: all.length }, "Aggregated");
    return all;
}
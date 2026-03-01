import Parser from "rss-parser";
import type { EventItem } from "../types/event";
import { getLogger } from "../logger";

const log = getLogger("rss");
const parser = new Parser();

export async function fetchRSS(url: string): Promise<EventItem[]> {
    try {
        const feed = await parser.parseURL(url);
        const items = feed.items.map(item => ({
            title: item.title || "",
            link: item.link || "",
            source: url
        }));
        log.debug({ url, count: items.length }, "RSS fetched");
        return items;
    } catch (err) {
        log.warn({ url, err: err instanceof Error ? err.message : String(err) }, "RSS fetch failed");
        return [];
    }
}
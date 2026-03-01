import Parser from "rss-parser";
import type { EventItem } from "../types/event";

const parser = new Parser();
export async function fetchRSS(url: string): Promise<EventItem[]> {
    try {
        const feed = await parser.parseURL(url);

        return feed.items.map(item => ({
            title: item.title || "",
            link: item.link || "",
            source: url
        }));
    } catch (err) {
        console.error("RSS failed for:", url);
        return [];
    }
}
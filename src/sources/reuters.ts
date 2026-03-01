import * as cheerio from "cheerio";
import type { EventItem } from "../types/event";
import { REUTERS_WORLD } from "../config/sources";
import { getLogger } from "../logger";

const log = getLogger("reuters");

export async function fetchReuters(): Promise<EventItem[]> {
    const res = await fetch(REUTERS_WORLD);
    const html = await res.text();
    const $ = cheerio.load(html);

    const articles: EventItem[] = [];

    $("a[data-testid='Heading']").each((_, el) => {
        const title = $(el).text();
        const link = "https://www.reuters.com" + $(el).attr("href");

        articles.push({
            title,
            link,
            source: "Reuters"
        });
    });

    const result = articles.slice(0, 10);
    log.debug({ count: result.length }, "Reuters fetched");
    return result;
}
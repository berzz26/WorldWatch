import type{ EventItem } from "../types/event";

export function dedupe(events: EventItem[], seen: string[]) {
    return events.filter(e => !seen.includes(e.link));
}
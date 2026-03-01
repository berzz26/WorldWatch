export function formatForAI(events: any[]) {
    return events
        .map(e => `Title: ${e.title}\nSource: ${e.source}\nLink: ${e.link}\n`)
        .join("\n");
}
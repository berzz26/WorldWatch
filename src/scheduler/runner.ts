import { aggregate } from "../core/aggregator";
import { dedupe } from "../core/deduplicator";
import { formatEmail } from "../core/formatter";
import { summarizeWithGemini } from "../ai/geminiClient";
import { sendMail } from "../delivery/mailer";
import { loadState, saveState } from "../storage/stateManager";
import { MAIL_INTERVAL } from "../config/setting";
import { getLogger } from "../logger";

const log = getLogger("runner");

async function run() {
    log.info("Run started");
    const state = loadState();

    const events = await aggregate();
    const fresh = dedupe(events, state.seen);

    if (fresh.length === 0) {
        log.info("No new events, skipping mail");
        return;
    }

    log.info({ total: events.length, fresh: fresh.length }, "Events aggregated");
    const aiInput = fresh
        .map(e => `- [${e.source}] ${e.title} (${e.link})`)
        .join("\n");

    const structured = await summarizeWithGemini(aiInput);

    const emailBody = formatEmail(structured);

    // Append sources section with unique links
    const uniqueByLink = new Map<string, typeof fresh[number]>();
    for (const e of fresh) {
        if (!uniqueByLink.has(e.link)) uniqueByLink.set(e.link, e);
    }
    const sourcesList = Array.from(uniqueByLink.values())
        .map(e => `- [${e.source}] ${e.link}`)
        .join("\n");

    const emailWithSources =
        emailBody +
        "\n\nSources:\n" +
        (sourcesList || "No sources available");

    await sendMail(emailWithSources);

    state.seen.push(...fresh.map(e => e.link));
    saveState(state);
    log.info("Run completed");
}

export function start() {
    run().catch(err => log.error({ err: err instanceof Error ? err.message : String(err) }, "Run failed"));
    setInterval(() => run().catch(err => log.error({ err: err instanceof Error ? err.message : String(err) }, "Run failed")), MAIL_INTERVAL);
    log.info({ intervalMs: MAIL_INTERVAL }, "Scheduler started");
}
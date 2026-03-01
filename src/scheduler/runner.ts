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
    const formatted = formatEmail(fresh);

    const structured = await summarizeWithGemini(formatted);

    const emailBody = formatEmail(structured);

    await sendMail(emailBody);

    state.seen.push(...fresh.map(e => e.link));
    saveState(state);
    log.info("Run completed");
}

export function start() {
    run().catch(err => log.error({ err: err instanceof Error ? err.message : String(err) }, "Run failed"));
    setInterval(() => run().catch(err => log.error({ err: err instanceof Error ? err.message : String(err) }, "Run failed")), MAIL_INTERVAL);
    log.info({ intervalMs: MAIL_INTERVAL }, "Scheduler started");
}
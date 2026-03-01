import { aggregate } from "../core/aggregator";
import { dedupe } from "../core/deduplicator";
import { formatForAI } from "../core/formatter";
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
    const formatted = formatForAI(fresh);

    const summary = await summarizeWithGemini(formatted);

    await sendMail(summary);

    state.seen.push(...fresh.map(e => e.link));
    saveState(state);
    log.info("Run completed");
}

export function start() {
    run().catch(err => log.error({ err: err instanceof Error ? err.message : String(err) }, "Run failed"));
    setInterval(() => run().catch(err => log.error({ err: err instanceof Error ? err.message : String(err) }, "Run failed")), MAIL_INTERVAL);
    log.info({ intervalMs: MAIL_INTERVAL }, "Scheduler started");
}
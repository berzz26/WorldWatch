import { aggregate } from "../core/aggregator";
import { dedupe } from "../core/deduplicator";
import { formatForAI } from "../core/formatter";
import { summarizeWithGemini } from "../ai/geminiClient";
import { sendMail } from "../delivery/mailer";
import { loadState, saveState } from "../storage/stateManager";
import { MAIL_INTERVAL } from "../config/setting";

async function run() {
    const state = loadState();

    const events = await aggregate();
    const fresh = dedupe(events, state.seen);

    if (fresh.length === 0) return;

    const formatted = formatForAI(fresh);

    const summary = await summarizeWithGemini(formatted);

    await sendMail(summary);

    state.seen.push(...fresh.map(e => e.link));
    saveState(state);
}

export function start() {
    run();
    setInterval(run, MAIL_INTERVAL);
}
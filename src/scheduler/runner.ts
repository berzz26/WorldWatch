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

    // Append HTML sources section with unique links
    const uniqueByLink = new Map<string, typeof fresh[number]>();
    for (const e of fresh) {
        if (!uniqueByLink.has(e.link)) uniqueByLink.set(e.link, e);
    }
    const sourcesItems = Array.from(uniqueByLink.values())
        .map(
            e =>
                `<li style="margin:4px 0;font-size:13px;color:#333;">
                   <strong>${e.source}</strong>:
                   <a href="${e.link}" style="color:#1565c0;text-decoration:none;">${e.link}</a>
                 </li>`
        )
        .join("");

    const sourcesSection = `
      <div style="max-width:640px;margin:0 auto;">
        <div style="margin-top:16px;padding:12px 16px 20px 16px;">
          <h3 style="margin:0 0 8px 0;font-size:15px;font-weight:600;color:#222;">Sources</h3>
          <ul style="margin:0;padding-left:18px;list-style:disc;">
            ${sourcesItems || '<li style="font-size:13px;color:#666;">No sources available</li>'}
          </ul>
        </div>
      </div>
    `;

    const emailWithSources = emailBody + sourcesSection;

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
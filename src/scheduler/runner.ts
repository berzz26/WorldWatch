import { aggregate } from "../core/aggregator";
import { dedupe } from "../core/deduplicator";
import { formatEmail } from "../core/formatter";
import { summarizeWithGemini } from "../ai/geminiClient";
import { sendMail } from "../delivery/mailer";
import { fetchMarketIndices } from "../sources/marketsFetcher";
import { loadState, saveState } from "../storage/stateManager";
import { CRON_SCHEDULE } from "../config/setting";
import { getLogger } from "../logger";
import axios from "axios";
import cron from "node-cron";
import * as fs from "fs";

const log = getLogger("runner");

export async function run() {
    log.info("Run started");
    const state = loadState();

    const events = await aggregate();
    const fresh = dedupe(events, state.seen);

    if (fresh.length === 0) {
        log.info("No new events, skipping mail");
        return;
    }

    log.info({ total: events.length, fresh: fresh.length }, "Events aggregated");

    // Cap events sent to Gemini when very high to avoid response truncation
    const MAX_EVENTS_FOR_AI = 2000;
    const eventsForAi = fresh.length > MAX_EVENTS_FOR_AI ? fresh.slice(0, MAX_EVENTS_FOR_AI) : fresh;
    if (fresh.length > MAX_EVENTS_FOR_AI) {
        log.info({ capped: MAX_EVENTS_FOR_AI, original: fresh.length }, "Capped events for AI");
    }

    const structured = await summarizeWithGemini(eventsForAi);

    // Write down the raw response from gemini
    fs.writeFileSync("2gemini_raw_response.txt", JSON.stringify(structured, null, 2));

    // No capped basically the events to a txt file
    const allEventsText = fresh
        .map(
            (e, idx) =>
                `${idx + 1}. [${e.source}] ${e.title}\nURL: ${e.link}`
        )
        .join("\n\n");
    fs.writeFileSync("2uncapped_events.txt", allEventsText);

    const indices = await fetchMarketIndices();
    const emailBody = formatEmail(structured, indices);



    //replace with internal route to send

    const textFallback = emailBody
        .replace(/<[^>]+>/g, " ")
        .replace(/\s+/g, " ")
        .trim();

    const MAILER_URL = Bun.env.MAILER_URL!;
    const INTERNAL_TOKEN = Bun.env.INTERNAL_TOKEN!;
    let res;
    try {
        res = await axios.post(
            `${MAILER_URL}/api/v1/internal/mailer`,
            {
                text: textFallback,
                html: emailBody,
            },
            {
                headers: {
                    "x-internal-token": INTERNAL_TOKEN,
                },
            }
        );  // await sendMail(emailBody);
    } catch (err) {
        if (axios.isAxiosError(err)) {
            log.error({
                status: err.response?.status,
                errorData: err.response?.data,
                message: err.message
            }, "Mailer API returned an error");
        }
        throw err;
    }

    state.seen.push(...fresh.map(e => e.link));
    saveState(state);
    log.info("Run completed");
}

run() 
import { GEMINI_MODEL, GEMINI_URL } from "../config/gemini";
import { getLogger } from "../logger";
import * as fs from "fs";

const log = getLogger("gemini");

const HIGH_EVENT_THRESHOLD = 2000;

export async function summarizeWithGemini(events: any[]) {
    const CHUNK_SIZE = 100;
    const allResults: any[] = [];

    // Process chunks sequentially
    for (let i = 0; i < events.length; i += CHUNK_SIZE) {
        const chunk = events.slice(i, i + CHUNK_SIZE);
        log.info({ chunkIndex: Math.floor(i / CHUNK_SIZE) + 1, totalChunks: Math.ceil(events.length / CHUNK_SIZE), size: chunk.length }, "Processing Gemini chunk");

        const aiInput = chunk
            .map((e, idx) => `${i + idx + 1}. [${e.source}] ${e.title}\nURL: ${e.link}`)
            .join("\n\n");

        let chunkParsed = null;
        let retries = 3;

        while (retries > 0) {
            try {
               chunkParsed = await processGeminiChunk(aiInput, chunk.length);
               break; // Success
            } catch (err: any) {
               if (err.message && err.message.includes("429")) {
                   log.warn("Rate limited by Gemini (429). Waiting 35 seconds before retrying...");
                   await new Promise(resolve => setTimeout(resolve, 35000));
                   retries--;
               } else {
                   throw err;
               }
            }
        }

        if (chunkParsed) {
            allResults.push(chunkParsed);
            // Save progress of each chunk to avoid losing data on unrecoverable crash
            fs.writeFileSync("partial_gemini_chunks.json", JSON.stringify(allResults, null, 2));
        } else {
            throw new Error(`Failed to process chunk ${Math.floor(i / CHUNK_SIZE) + 1} after retries`);
        }
        
        // Delay between chunks to avoid hitting 15 Requests Per Minute or 1M Tokens/Min limits
        if (i + CHUNK_SIZE < events.length) {
            log.info("Waiting 10 seconds before next chunk...");
            await new Promise(resolve => setTimeout(resolve, 10000));
        }
    }

    return mergeGeminiResults(allResults);
}

function mergeGeminiResults(results: any[]) {
    if (results.length === 0) return { summary: "No summary generated.", regions: [] };

    const mergedSummary = results.map(r => r.summary).filter(Boolean).join("\n\n");
    const mergedRegionsMap = new Map<string, any>();

    for (const res of results) {
        if (!Array.isArray(res.regions)) continue;
        for (const region of res.regions) {
            if (!region.name) continue;
            
            const existing = mergedRegionsMap.get(region.name);
            if (existing) {
                existing.events.push(...(region.events || []));
                existing.critical = existing.critical || region.critical;
            } else {
                mergedRegionsMap.set(region.name, {
                    name: region.name,
                    critical: region.critical,
                    events: region.events ? [...region.events] : []
                });
            }
        }
    }

    return {
        summary: mergedSummary,
        regions: Array.from(mergedRegionsMap.values())
    };
}

async function processGeminiChunk(content: string, eventCount: number) {
    const isHighVolume = eventCount > HIGH_EVENT_THRESHOLD;

    const formatHint = isHighVolume
        ? `
MANY EVENTS (${eventCount}) - use COMPACT output to avoid truncation:
- "brief" must be a ONE-LINER (max 10 words), e.g. "Company reports 30% earnings drop."
- Include only the 20-25 most important events total. Drop lower-priority items.
- Summary: 1-2 short sentences only.`
        : `
FEW EVENTS (${eventCount}) - use full briefs:
- "brief": 1-2 sentence explanation per event.`;

    const prompt = `
You are a geopolitical intelligence analyst.

Analyze the events below and return ONLY valid JSON.

Format strictly as:

{
  "summary": "2-3 sentence high level overview",
  "regions": [
    {
      "name": "Region Name",
      "critical": true/false,
      "events": [
        {
          "title": "...",
          "severity": "LOW | MEDIUM | HIGH",
          "brief": "1-2 sentence or one-liner",
          "url": "https://example.com/original-article"
        }
      ]
    }
  ]
}

Mark a region as critical if it contains escalations, military conflict,
major economic disruption, or geopolitical instability.

Always include at least one region with "name": "India" in the regions array.
If none of the events relate to India, return an India region with an empty
events array and a brief note such as "No major India updates today".

Include a region with "name": "Markets & Finance" for financial, economic,
stock market, and business news. If no such events exist, omit this region.

Include a region with "name": "Tech & AI" for software, tech companies, AI,
ML, startups, and tech industry news. If no such events exist, omit this region.

For every event, always include a \"url\" field that exactly matches the source
URL for that event (do not modify, shorten, or replace it).
${formatHint}

Events:
${content}
`;

    log.debug({ contentLength: content.length }, "Calling Gemini");
    const response = await fetch(
        `${GEMINI_URL}${GEMINI_MODEL}:generateContent?key=${Bun.env.GEMINI_API_KEY}`,
        {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: {
                    maxOutputTokens: 150000,
                    temperature: 0.3
                }
            }),
            signal: AbortSignal.timeout(600000)
        }
    );

    const data: any = await response.json();

    if (!response.ok) {
        log.error({ status: response.status, data }, "Gemini API error");
        throw new Error(data?.error?.message ?? `Gemini API ${response.status}`);
    }

    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) {
        log.error({ data }, "Gemini response missing text");
        throw new Error("Invalid Gemini response");
    }

    const cleaned = text.replace(/```json|```/g, "").trim();

    const tryParse = (str: string) => {
        try {
            return JSON.parse(str);
        } catch {
            return null;
        }
    };

    let parsed = tryParse(cleaned);
    if (parsed) {
        log.info(
            {
                rawLength: text.length,
                summaryLength: parsed.summary?.length ?? 0,
                regions: Array.isArray(parsed.regions) ? parsed.regions.length : 0,
            },
            "Gemini summary parsed"
        );
        return parsed;
    }

    log.warn(
        { rawLength: text.length, snippet: text.slice(-200) },
        "JSON parse failed, likely truncated - retrying once"
    );
    // Retry once in case of transient truncation
    const retryResponse = await fetch(
        `${GEMINI_URL}${GEMINI_MODEL}:generateContent?key=${Bun.env.GEMINI_API_KEY}`,
        {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: {
                    maxOutputTokens: 16384,
                    temperature: 0.3
                }
            }),
            signal: AbortSignal.timeout(600000)
        }
    );
    const retryData: any = await retryResponse.json();
    const retryText = retryData.candidates?.[0]?.content?.parts?.[0]?.text;
    if (retryText) {
        parsed = tryParse(retryText.replace(/```json|```/g, "").trim());
        if (parsed) {
            log.info("Retry succeeded");
            return parsed;
        }
    }

    log.error(
        { text, err: "Unterminated string or invalid JSON" },
        "Failed to parse JSON from Gemini"
    );
    throw new Error("Gemini returned invalid JSON");
}
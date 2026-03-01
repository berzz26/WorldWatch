import { GEMINI_MODEL, GEMINI_URL } from "../config/gemini";
import { getLogger } from "../logger";

const log = getLogger("gemini");

export async function summarizeWithGemini(content: string) {
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
          "brief": "1-2 sentence explanation"
        }
      ]
    }
  ]
}

Mark a region as critical if it contains escalations, military conflict,
major economic disruption, or geopolitical instability.

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
                contents: [{ parts: [{ text: prompt }] }]
            })
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

    try {
        const parsed = JSON.parse(cleaned);
        log.info(
            {
                rawLength: text.length,
                summaryLength: parsed.summary?.length ?? 0,
                regions: Array.isArray(parsed.regions) ? parsed.regions.length : 0,
            },
            "Gemini summary parsed"
        );
        return parsed;
    } catch (err) {
        log.error(
            { text, err: err instanceof Error ? err.message : String(err) },
            "Failed to parse JSON from Gemini"
        );
        throw new Error("Gemini returned invalid JSON");
    }
}
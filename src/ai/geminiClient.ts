import { GEMINI_MODEL, GEMINI_URL } from "../config/gemini";
import { getLogger } from "../logger";

const log = getLogger("gemini");

export async function summarizeWithGemini(content: string) {
    const prompt = `
You are a geopolitical intelligence analyst.

Summarize the following global events clearly.
Group by region.
Highlight critical escalations.
Be concise but informative.

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
    log.info({ summaryLength: text.length }, "Gemini summary done");
    return text;
}
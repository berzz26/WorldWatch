import { GEMINI_MODEL, GEMINI_URL } from "../config/gemini";

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

    return data.candidates[0].content.parts[0].text;
}
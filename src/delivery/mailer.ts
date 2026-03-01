import nodemailer from "nodemailer";
import { getLogger } from "../logger";

const log = getLogger("mailer");

export async function sendMail(body: string) {
    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: Bun.env.EMAIL_USER,
            pass: Bun.env.EMAIL_PASS
        }
    });

    const recipients = (Bun.env.TO_EMAIL ?? "")
        .split(",")
        .map((e) => e.trim())
        .filter(Boolean);

    if (recipients.length === 0) {
        log.error("TO_EMAIL is empty or missing");
        throw new Error("TO_EMAIL is empty or missing");
    }

    // Simple text fallback by stripping HTML tags
    const textFallback = body.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();

    try {
        await transporter.sendMail({
            from: Bun.env.FROM_EMAIL,
            to: recipients,
            subject: "🌍 Global Intelligence Update",
            text: textFallback,
            html: body
        });
        log.info({ to: recipients, count: recipients.length, length: body.length }, "Mail sent");
    } catch (err) {
        log.error({ to: recipients, err: err instanceof Error ? err.message : String(err) }, "Mail send failed");
        throw err;
    }
}
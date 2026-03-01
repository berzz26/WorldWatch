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

    // Very simple text fallback by stripping HTML tags
    const textFallback = body.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();

    try {
        await transporter.sendMail({
            from: Bun.env.FROM_EMAIL,
            to: Bun.env.TO_EMAIL,
            subject: "🌍 Global Intelligence Update",
            text: textFallback,
            html: body
        });
        log.info({ to: Bun.env.TO_EMAIL, length: body.length }, "Mail sent");
    } catch (err) {
        log.error({ to: Bun.env.TO_EMAIL, err: err instanceof Error ? err.message : String(err) }, "Mail send failed");
        throw err;
    }
}
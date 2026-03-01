import nodemailer from "nodemailer";
import { getLogger } from "../logger";

const log = getLogger("mailer");

async function getRecipients(): Promise<string[]> {
  try {
    const file = Bun.file("src/delivery/recipients.json");
    const recipients = await file.json();

    if (!Array.isArray(recipients)) {
      throw new Error("recipients.json must contain an array");
    }

    return recipients
      .map((e: string) => e.trim())
      .filter(Boolean);
  } catch (err) {
    log.error(
      { err: err instanceof Error ? err.message : String(err) },
      "Failed to load recipients.json"
    );
    throw err;
  }
}

export async function sendMail(body: string) {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: Bun.env.EMAIL_USER,
      pass: Bun.env.EMAIL_PASS,
    },
  });

  const recipients = await getRecipients();

  if (recipients.length === 0) {
    log.error("No recipients found in recipients.json");
    throw new Error("No recipients found");
  }

  const textFallback = body
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  try {
    await transporter.sendMail({
      from: Bun.env.FROM_EMAIL,
      to: recipients,
      subject: "🌍 Global Intelligence Update",
      text: textFallback,
      html: body,
    });

    log.info(
      { to: recipients, count: recipients.length, length: body.length },
      "Mail sent"
    );
  } catch (err) {
    log.error(
      { to: recipients, err: err instanceof Error ? err.message : String(err) },
      "Mail send failed"
    );
    throw err;
  }
}
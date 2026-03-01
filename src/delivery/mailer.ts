import nodemailer from "nodemailer";

export async function sendMail(summary: string) {
    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: Bun.env.EMAIL_USER,
            pass: Bun.env.EMAIL_PASS
        }
    });

    await transporter.sendMail({
        from: Bun.env.FROM_EMAIL,
        to: Bun.env.TO_EMAIL,
        subject: "🌍 Global Intelligence Update",
        text: summary
    });
}
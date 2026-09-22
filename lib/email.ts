import "server-only";
import nodemailer from "nodemailer";
import type { UserStatus } from "@/lib/types";

function getTransport() {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) return null;
  const port = Number(SMTP_PORT ?? 587);
  return nodemailer.createTransport({
    host: SMTP_HOST,
    port,
    secure: port === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });
}

/**
 * Notifies a user that their application was approved or rejected.
 * In dev (no SMTP configured) it logs the email to the console so the flow
 * still works end-to-end without a mail provider.
 */
export async function sendStatusEmail(
  to: string,
  name: string,
  status: Extract<UserStatus, "approved" | "rejected">,
  reason?: string | null,
): Promise<void> {
  const from = process.env.EMAIL_FROM ?? "no-reply@example.com";
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  const subject =
    status === "approved"
      ? "Your account has been approved 🎉"
      : "Update on your application";

  const body =
    status === "approved"
      ? `Hi ${name},\n\nGood news — your account has been approved. ` +
        `You can now sign in and get started:\n${appUrl}/login\n\n— The team`
      : `Hi ${name},\n\nThanks for applying. Unfortunately your application ` +
        `was not approved at this time.` +
        (reason ? `\n\nReason: ${reason}` : "") +
        `\n\n— The team`;

  const transport = getTransport();
  if (!transport) {
    console.log(
      `\n[email:dev] (no SMTP configured)\nTo: ${to}\nSubject: ${subject}\n${body}\n`,
    );
    return;
  }

  await transport.sendMail({ from, to, subject, text: body });
}

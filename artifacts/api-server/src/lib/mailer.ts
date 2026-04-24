const RESEND_API = "https://api.resend.com/emails";
const FROM_DEFAULT = "ScanAR <onboarding@resend.dev>";

interface SendArgs {
  to: string;
  subject: string;
  html: string;
  text: string;
}

export async function sendMail({ to, subject, html, text }: SendArgs): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error("RESEND_API_KEY is not configured");
  }

  const from = process.env.MAIL_FROM ?? FROM_DEFAULT;

  const res = await fetch(RESEND_API, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({ from, to, subject, html, text }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Resend API error ${res.status}: ${body || res.statusText}`);
  }
}

export function buildVerificationEmail(email: string, link: string): { subject: string; html: string; text: string } {
  const subject = "Verify your ScanAR account";

  const text = [
    `Welcome to ScanAR!`,
    ``,
    `Please verify your email address by visiting the link below:`,
    link,
    ``,
    `This link expires in 24 hours.`,
    ``,
    `If you did not create a ScanAR account, you can safely ignore this email.`,
  ].join("\n");

  const html = `<!doctype html>
<html>
  <body style="margin:0;padding:0;background:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#0f172a;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#ffffff;border:1px solid #e2e8f0;border-radius:16px;overflow:hidden;">
            <tr>
              <td style="padding:32px 32px 24px 32px;">
                <div style="display:inline-block;background:#84cc16;color:#ffffff;width:36px;height:36px;border-radius:8px;text-align:center;line-height:36px;font-weight:700;">S</div>
                <h1 style="margin:20px 0 8px 0;font-size:22px;font-weight:800;color:#0f172a;">Verify your email</h1>
                <p style="margin:0 0 24px 0;font-size:15px;line-height:1.55;color:#475569;">
                  Welcome to ScanAR! Please confirm your email address (<strong>${escapeHtml(email)}</strong>) to activate your account.
                </p>
                <a href="${escapeAttr(link)}"
                   style="display:inline-block;background:#65a30d;color:#ffffff;text-decoration:none;padding:12px 22px;border-radius:10px;font-weight:600;font-size:15px;">
                  Verify email address
                </a>
                <p style="margin:24px 0 0 0;font-size:13px;color:#64748b;">
                  Or copy &amp; paste this URL into your browser:<br>
                  <span style="word-break:break-all;color:#475569;">${escapeHtml(link)}</span>
                </p>
                <hr style="border:none;border-top:1px solid #e2e8f0;margin:28px 0;">
                <p style="margin:0;font-size:12px;color:#94a3b8;">
                  This link expires in 24 hours. If you did not create a ScanAR account, you can safely ignore this email.
                </p>
              </td>
            </tr>
          </table>
          <p style="margin:16px 0 0 0;font-size:12px;color:#94a3b8;">&copy; ${new Date().getFullYear()} ScanAR Platform</p>
        </td>
      </tr>
    </table>
  </body>
</html>`;

  return { subject, html, text };
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) =>
    c === "&" ? "&amp;" :
    c === "<" ? "&lt;" :
    c === ">" ? "&gt;" :
    c === '"' ? "&quot;" : "&#39;"
  );
}

function escapeAttr(s: string): string {
  return escapeHtml(s);
}

export function getAppBaseUrl(req: { get: (h: string) => string | undefined; protocol: string }): string {
  const explicit = process.env.APP_URL;
  if (explicit) return explicit.replace(/\/$/, "");

  const replitDomain = process.env.REPLIT_DEV_DOMAIN;
  if (replitDomain) return `https://${replitDomain}`;

  const host = req.get("host");
  return host ? `${req.protocol}://${host}` : "http://localhost:5000";
}

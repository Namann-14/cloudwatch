import { Resend } from 'resend';

function buildHtmlEmail(summary: string): string {
  // Convert markdown-style **bold** to <strong> for email rendering
  const formattedSummary = summary
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n\n/g, '</p><p>')
    .replace(/\n/g, '<br/>');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Sales Insight Report – CloudWatch</title>
</head>
<body style="margin:0;padding:0;background:#f4f4f7;font-family:Arial,Helvetica,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f7;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
          <!-- Header -->
          <tr>
            <td style="background:#0f172a;padding:28px 36px;">
              <h1 style="margin:0;color:#ffffff;font-size:22px;letter-spacing:0.5px;">
                CloudWatch
              </h1>
              <p style="margin:4px 0 0;color:#94a3b8;font-size:13px;">
                Sales Insight Automator
              </p>
            </td>
          </tr>
          <!-- Title bar -->
          <tr>
            <td style="background:#6366f1;padding:14px 36px;">
              <h2 style="margin:0;color:#ffffff;font-size:16px;font-weight:600;">
                AI-Generated Executive Sales Summary
              </h2>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:32px 36px;color:#1e293b;font-size:15px;line-height:1.7;">
              <p>${formattedSummary}</p>
            </td>
          </tr>
          <!-- Divider -->
          <tr>
            <td style="padding:0 36px;">
              <hr style="border:none;border-top:1px solid #e2e8f0;"/>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding:20px 36px 28px;text-align:center;color:#94a3b8;font-size:12px;">
              <p style="margin:0;">
                Generated on ${new Date().toUTCString()} by
                <strong style="color:#6366f1;">Sales Insight Automator</strong>
              </p>
              <p style="margin:4px 0 0;">
                This report was generated automatically. Please verify key figures before acting on them.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export async function sendSummaryEmail(
  recipientEmail: string,
  summary: string,
): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error('RESEND_API_KEY is not configured.');
  }

  const resend = new Resend(apiKey);
  const from = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';

  const { error } = await resend.emails.send({
    from: `CloudWatch – Sales Insights <${from}>`,
    to: [recipientEmail],
    subject: `Your AI Sales Summary – ${new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`,
    html: buildHtmlEmail(summary),
    text: summary,
  });

  if (error) {
    throw new Error(`Email delivery failed: ${error.message}`);
  }
}

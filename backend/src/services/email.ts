import emailjs from '@emailjs/nodejs';

export async function sendSummaryEmail(
  recipientEmail: string,
  summary: string,
): Promise<void> {
  const serviceId = process.env.EMAILJS_SERVICE_ID;
  const templateId = process.env.EMAILJS_TEMPLATE_ID;
  const publicKey = process.env.EMAILJS_PUBLIC_KEY;
  const privateKey = process.env.EMAILJS_PRIVATE_KEY;

  if (!serviceId || !templateId || !publicKey || !privateKey) {
    throw new Error('EmailJS credentials are not fully configured.');
  }

  const monthYear = new Date().toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  // Convert markdown **bold** to plain text for EmailJS template
  const plainSummary = summary.replace(/\*\*(.+?)\*\*/g, '$1');

  const response = await emailjs.send(
    serviceId,
    templateId,
    {
      to_email: recipientEmail,
      summary: plainSummary,
      month_year: monthYear,
    },
    {
      publicKey,
      privateKey,
    },
  );

  if (response.status !== 200) {
    throw new Error(`Email delivery failed: ${response.text}`);
  }
}

import nodemailer from 'nodemailer';

interface SendPasswordResetEmailParams {
  to: string;
  name: string;
  resetUrl: string;
  expiresInMinutes?: number;
}

export function isEmailConfigured(): boolean {
  return Boolean(
    process.env.RESEND_API_KEY ||
    (process.env.SMTP_HOST && (process.env.SMTP_PASS || process.env.SMTP_PASSWORD)) ||
    (process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD)
  );
}

/**
 * Creates and caches the Nodemailer transporter instance if SMTP credentials are provided.
 */
function getEmailTransporter() {
  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT || '587', 10);
  const secure = process.env.SMTP_SECURE === 'true' || port === 465;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS || process.env.SMTP_PASSWORD;

  if (host && user && pass) {
    return nodemailer.createTransport({
      host,
      port,
      secure,
      auth: { user, pass },
    });
  }

  // Gmail-specific convenience configuration
  const gmailUser = process.env.GMAIL_USER || (user?.includes('@gmail.com') ? user : undefined);
  const gmailPass = process.env.GMAIL_APP_PASSWORD || pass;
  if (gmailUser && gmailPass) {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: gmailUser,
        pass: gmailPass,
      },
    });
  }

  return null;
}

/**
 * Generates the responsive branded HTML email template for password reset
 */
function generatePasswordResetHtml({
  name,
  resetUrl,
  expiresInMinutes = 60,
}: {
  name: string;
  resetUrl: string;
  expiresInMinutes?: number;
}): string {
  const storeName = process.env.NEXT_PUBLIC_STORE_NAME || 'Trust Computer-Moulvibazar';
  const storeLocation =
    process.env.NEXT_PUBLIC_LOCATION || 'T.S Plaza (2nd Floor), Kusumbagh, Moulvibazar, Bangladesh';
  const storePhone = process.env.NEXT_PUBLIC_PHONE || '01753-765372';

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Password Reset Request</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; padding: 30px 15px;">
    <tr>
      <td align="center">
        <!-- Main Card -->
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 560px; background-color: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.06); border: 1px solid #e2e8f0;">
          
          <!-- Header Banner -->
          <tr>
            <td style="background: linear-gradient(135deg, #1e2b6e 0%, #2A3B97 50%, #0084d6 100%); padding: 36px 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 800; letter-spacing: -0.5px;">
                ${storeName}
              </h1>
              <p style="margin: 6px 0 0 0; color: #e0f2fe; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">
                “Your Trust, Our Technology”
              </p>
            </td>
          </tr>

          <!-- Body Content -->
          <tr>
            <td style="padding: 36px 30px;">
              <h2 style="margin: 0 0 16px 0; color: #0f172a; font-size: 20px; font-weight: 700;">
                Password Reset Request
              </h2>
              
              <p style="margin: 0 0 16px 0; font-size: 14px; line-height: 22px; color: #475569;">
                Hello <strong>${name}</strong>,
              </p>
              
              <p style="margin: 0 0 24px 0; font-size: 14px; line-height: 22px; color: #475569;">
                We received a request to reset the password for your account at <strong>${storeName}</strong>. Please click the button below to choose a new, secure password:
              </p>

              <!-- CTA Button -->
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin: 28px 0;">
                <tr>
                  <td align="center">
                    <a href="${resetUrl}" target="_blank" rel="noopener noreferrer" style="display: inline-block; background-color: #2A3B97; color: #ffffff; text-decoration: none; font-size: 14px; font-weight: 700; padding: 14px 32px; border-radius: 12px; box-shadow: 0 4px 12px rgba(42, 59, 151, 0.35);">
                      Reset Your Password
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Notice Box -->
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f1f5f9; border-radius: 12px; margin: 24px 0;">
                <tr>
                  <td style="padding: 16px; font-size: 12px; line-height: 18px; color: #64748b;">
                    <strong>Security Notice:</strong>
                    <ul style="margin: 6px 0 0 0; padding-left: 18px;">
                      <li>This link will expire in <strong>${expiresInMinutes} minutes</strong>.</li>
                      <li>This link can only be used once.</li>
                      <li>If you did not request this password reset, please disregard this email or contact support immediately. Your password remains safe and unchanged.</li>
                    </ul>
                  </td>
                </tr>
              </table>

              <!-- Direct URL Fallback -->
              <p style="margin: 20px 0 6px 0; font-size: 12px; color: #94a3b8;">
                If the button above does not work, copy and paste this URL into your browser:
              </p>
              <p style="margin: 0; font-size: 11px; word-break: break-all; color: #0084d6;">
                <a href="${resetUrl}" style="color: #0084d6; text-decoration: underline;">${resetUrl}</a>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 24px 30px; text-align: center;">
              <p style="margin: 0 0 6px 0; font-size: 12px; font-weight: 600; color: #475569;">
                ${storeName}
              </p>
              <p style="margin: 0 0 6px 0; font-size: 11px; color: #94a3b8;">
                ${storeLocation} | Contact: ${storePhone}
              </p>
              <p style="margin: 0; font-size: 10px; color: #cbd5e1;">
                &copy; ${new Date().getFullYear()} ${storeName}. All rights reserved.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

/**
 * Sends a password reset email to the specified user.
 * If SMTP credentials are not configured, it simulates delivery by logging the link clearly in the console.
 */
export async function sendPasswordResetEmail({
  to,
  name,
  resetUrl,
  expiresInMinutes = 60,
}: SendPasswordResetEmailParams): Promise<{
  success: boolean;
  simulated?: boolean;
  messageId?: string;
  error?: string;
}> {
  const storeName = process.env.NEXT_PUBLIC_STORE_NAME || 'Trust Computer-Moulvibazar';
  const fromEmail = process.env.SMTP_FROM || process.env.SMTP_USER || 'no-reply@trustcomputermb.com';
  const formattedFrom = `"${storeName}" <${fromEmail}>`;

  const html = generatePasswordResetHtml({ name, resetUrl, expiresInMinutes });
  const text = `
Password Reset Request for ${name}

You requested a password reset for your ${storeName} account.
Please visit the link below to set a new password:
${resetUrl}

This link is valid for ${expiresInMinutes} minutes and can only be used once.

If you did not request a password reset, please ignore this email.
Store: ${storeName}
Contact: ${process.env.NEXT_PUBLIC_PHONE || '01753-765372'}
`.trim();

  // 1. Resend API support (ideal for Vercel serverless deployments)
  const resendApiKey = process.env.RESEND_API_KEY;
  if (resendApiKey) {
    try {
      const resendFrom = process.env.RESEND_FROM || `"${storeName}" <onboarding@resend.dev>`;
      const resendRes = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: resendFrom,
          to: [to],
          subject: `Reset Your Password - ${storeName}`,
          html,
          text,
        }),
      });

      const resendData = await resendRes.json();
      if (resendRes.ok) {
        console.log(`[PASSWORD RESET] Email sent via Resend to ${to}, ID: ${resendData.id}`);
        return {
          success: true,
          simulated: false,
          messageId: resendData.id,
        };
      } else {
        console.error('[PASSWORD RESET] Resend API error:', resendData);
        return {
          success: false,
          error: resendData.message || 'Resend email delivery failed.',
        };
      }
    } catch (resendErr: any) {
      console.error('[PASSWORD RESET] Resend dispatch error:', resendErr);
      return {
        success: false,
        error: resendErr.message || 'Resend service connection failed.',
      };
    }
  }

  // 2. Nodemailer SMTP support (Gmail App Password, custom SMTP)
  const transporter = getEmailTransporter();

  if (!transporter) {
    console.log('\n======================================================');
    console.log(' [PASSWORD RESET EMAIL - LOCAL/DEV SIMULATION]');
    console.log(` To: ${to} (${name})`);
    console.log(` Subject: Password Reset Request - ${storeName}`);
    console.log(` Reset Link: ${resetUrl}`);
    console.log(' Note: To send real emails, configure Gmail SMTP (SMTP_USER, SMTP_PASS) or RESEND_API_KEY in .env & Vercel.');
    console.log('======================================================\n');

    return {
      success: true,
      simulated: true,
    };
  }

  try {
    const info = await transporter.sendMail({
      from: formattedFrom,
      to,
      subject: `Reset Your Password - ${storeName}`,
      text,
      html,
    });

    console.log(`[PASSWORD RESET] Email sent successfully to ${to}, Message ID: ${info.messageId}`);
    return {
      success: true,
      simulated: false,
      messageId: info.messageId,
    };
  } catch (err: any) {
    console.error('[PASSWORD RESET] SMTP send error:', err);
    // If SMTP fails, log the fallback URL so testing or recovery can still proceed
    console.warn(`[PASSWORD RESET FALLBACK] Reset URL was: ${resetUrl}`);
    return {
      success: false,
      error: err.message || 'Failed to dispatch password reset email via SMTP.',
    };
  }
}

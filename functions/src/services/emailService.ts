/**
 * Email Service using Resend
 * Handles all email sending with custom templates
 */

import { Resend } from 'resend';
import { logger } from 'firebase-functions/v2';

// Initialize Resend
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const resend = RESEND_API_KEY ? new Resend(RESEND_API_KEY) : null;

if (!RESEND_API_KEY) {
  logger.warn('RESEND_API_KEY not set - email sending will be skipped');
}

interface MagicLinkEmailData {
  to: string;
  borrowerName?: string;
  magicLink: string;
  expiresInHours: number;
  loanNumber?: string;
}

interface WelcomeEmailData {
  to: string;
  firstName?: string;
  lastName?: string;
  magicLink?: string;
  expiresInHours?: number;
}

/**
 * Send Magic Link Email
 */
export async function sendMagicLinkEmail(data: MagicLinkEmailData): Promise<boolean> {
  if (!resend || !RESEND_API_KEY) {
    logger.warn('Resend not configured - skipping email send');
    return false;
  }

  try {
    const { to, borrowerName, magicLink, expiresInHours, loanNumber } = data;

    // Get configuration
    const fromEmail = process.env.RESEND_FROM_EMAIL || 'noreply@mybox.com';
    const fromName = process.env.RESEND_FROM_NAME || 'MyBox File Management';
    const companyName = process.env.COMPANY_NAME || 'MyBox';

    const result = await resend.emails.send({
      from: `${fromName} <${fromEmail}>`,
      to: [to],
      subject: loanNumber
        ? `Access Your Documents for Loan #${loanNumber}`
        : 'Access Your Document Portal',
      html: generateMagicLinkEmailHTML({
        borrowerName: borrowerName || to.split('@')[0],
        magicLink,
        expiresInHours,
        loanNumber,
        companyName,
      }),
      text: generateMagicLinkEmailText({
        borrowerName: borrowerName || to.split('@')[0],
        magicLink,
        expiresInHours,
        loanNumber,
        companyName,
      }),
    });

    logger.info('Magic link email sent successfully', { to, loanNumber, emailId: result.data?.id });
    return true;
  } catch (error: any) {
    logger.error('Failed to send magic link email', {
      error: error.message,
      to: data.to,
    });
    throw error;
  }
}

/**
 * Send Welcome Email (for new users)
 */
export async function sendWelcomeEmail(data: WelcomeEmailData): Promise<boolean> {
  if (!resend || !RESEND_API_KEY) {
    logger.warn('Resend not configured - skipping email send');
    return false;
  }

  try {
    const { to, firstName, lastName, magicLink, expiresInHours } = data;

    const fromEmail = process.env.RESEND_FROM_EMAIL || 'noreply@mybox.com';
    const fromName = process.env.RESEND_FROM_NAME || 'MyBox File Management';
    const companyName = process.env.COMPANY_NAME || 'MyBox';

    const userName = firstName && lastName ? `${firstName} ${lastName}` : firstName || to.split('@')[0];

    const result = await resend.emails.send({
      from: `${fromName} <${fromEmail}>`,
      to: [to],
      subject: `Welcome to ${companyName}`,
      html: generateWelcomeEmailHTML({
        userName,
        magicLink,
        expiresInHours,
        companyName,
      }),
      text: generateWelcomeEmailText({
        userName,
        magicLink,
        expiresInHours,
        companyName,
      }),
    });

    logger.info('Welcome email sent successfully', { to, emailId: result.data?.id });
    return true;
  } catch (error: any) {
    logger.error('Failed to send welcome email', {
      error: error.message,
      to: data.to,
    });
    throw error;
  }
}

/**
 * Generate Magic Link Email HTML
 */
function generateMagicLinkEmailHTML(data: {
  borrowerName: string;
  magicLink: string;
  expiresInHours: number;
  loanNumber?: string;
  companyName: string;
}): string {
  const { borrowerName, magicLink, expiresInHours, loanNumber, companyName } = data;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Access Your Documents</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f6f6f8;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f6f6f8; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 20px; text-align: center; background: linear-gradient(135deg, #135bec 0%, #1a4db8 100%); border-radius: 12px 12px 0 0;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">${companyName}</h1>
              <p style="margin: 8px 0 0; color: #e3f2fd; font-size: 16px;">Document Portal Access</p>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <p style="margin: 0 0 20px; color: #333333; font-size: 16px; line-height: 1.6;">
                Hello <strong>${borrowerName}</strong>,
              </p>

              ${loanNumber ? `
              <p style="margin: 0 0 20px; color: #333333; font-size: 16px; line-height: 1.6;">
                You've been granted access to upload and view documents for <strong>Loan #${loanNumber}</strong>.
              </p>
              ` : `
              <p style="margin: 0 0 20px; color: #333333; font-size: 16px; line-height: 1.6;">
                You've been granted access to our secure document portal.
              </p>
              `}

              <p style="margin: 0 0 30px; color: #333333; font-size: 16px; line-height: 1.6;">
                Click the button below to access your documents. This link is valid for <strong>${expiresInHours} hours</strong>.
              </p>

              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <a href="${magicLink}"
                       style="display: inline-block; padding: 16px 40px; background-color: #135bec; color: #ffffff; text-decoration: none; border-radius: 8px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 12px rgba(19, 91, 236, 0.3);">
                      Access My Documents
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin: 30px 0 0; color: #666666; font-size: 14px; line-height: 1.6;">
                If the button doesn't work, copy and paste this link into your browser:
              </p>
              <p style="margin: 8px 0 0; padding: 12px; background-color: #f6f6f8; border-radius: 6px; color: #135bec; font-size: 12px; word-break: break-all;">
                ${magicLink}
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 20px 40px; background-color: #f6f6f8; border-radius: 0 0 12px 12px; text-align: center;">
              <p style="margin: 0; color: #666666; font-size: 12px; line-height: 1.6;">
                This link expires in ${expiresInHours} hours. If you didn't request this, please ignore this email.
              </p>
              <p style="margin: 12px 0 0; color: #999999; font-size: 11px;">
                © ${new Date().getFullYear()} ${companyName}. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

/**
 * Generate Magic Link Email Plain Text
 */
function generateMagicLinkEmailText(data: {
  borrowerName: string;
  magicLink: string;
  expiresInHours: number;
  loanNumber?: string;
  companyName: string;
}): string {
  const { borrowerName, magicLink, expiresInHours, loanNumber, companyName } = data;

  return `
Hello ${borrowerName},

${loanNumber
  ? `You've been granted access to upload and view documents for Loan #${loanNumber}.`
  : `You've been granted access to our secure document portal.`
}

Click this link to access your documents (valid for ${expiresInHours} hours):

${magicLink}

If you didn't request this, please ignore this email.

© ${new Date().getFullYear()} ${companyName}. All rights reserved.
  `.trim();
}

/**
 * Generate Welcome Email HTML
 */
function generateWelcomeEmailHTML(data: {
  userName: string;
  magicLink?: string;
  expiresInHours?: number;
  companyName: string;
}): string {
  const { userName, magicLink, expiresInHours, companyName } = data;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to ${companyName}</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f6f6f8;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f6f6f8; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 20px; text-align: center; background: linear-gradient(135deg, #135bec 0%, #1a4db8 100%); border-radius: 12px 12px 0 0;">
              <h1 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: 700;">🎉 Welcome!</h1>
              <p style="margin: 8px 0 0; color: #e3f2fd; font-size: 18px;">You're all set to get started</p>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <p style="margin: 0 0 20px; color: #333333; font-size: 16px; line-height: 1.6;">
                Hello <strong>${userName}</strong>,
              </p>

              <p style="margin: 0 0 20px; color: #333333; font-size: 16px; line-height: 1.6;">
                Welcome to <strong>${companyName}</strong>! Your account has been created successfully.
              </p>

              ${magicLink ? `
              <p style="margin: 0 0 30px; color: #333333; font-size: 16px; line-height: 1.6;">
                To get started, click the button below to access your account. This link is valid for <strong>${expiresInHours} hours</strong>.
              </p>

              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <a href="${magicLink}"
                       style="display: inline-block; padding: 16px 40px; background-color: #135bec; color: #ffffff; text-decoration: none; border-radius: 8px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 12px rgba(19, 91, 236, 0.3);">
                      Access My Account
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin: 30px 0 0; color: #666666; font-size: 14px; line-height: 1.6;">
                If the button doesn't work, copy and paste this link into your browser:
              </p>
              <p style="margin: 8px 0 0; padding: 12px; background-color: #f6f6f8; border-radius: 6px; color: #135bec; font-size: 12px; word-break: break-all;">
                ${magicLink}
              </p>
              ` : `
              <p style="margin: 0 0 20px; color: #333333; font-size: 16px; line-height: 1.6;">
                Your administrator will send you access instructions shortly.
              </p>
              `}

              <div style="margin-top: 40px; padding: 20px; background-color: #f0f7ff; border-left: 4px solid #135bec; border-radius: 6px;">
                <p style="margin: 0 0 12px; color: #135bec; font-size: 14px; font-weight: 600;">
                  What you can do:
                </p>
                <ul style="margin: 0; padding-left: 20px; color: #333333; font-size: 14px; line-height: 1.8;">
                  <li>Upload and manage your documents securely</li>
                  <li>Access your files anytime, anywhere</li>
                  <li>Share documents with authorized parties</li>
                  <li>Track document status in real-time</li>
                </ul>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 20px 40px; background-color: #f6f6f8; border-radius: 0 0 12px 12px; text-align: center;">
              ${magicLink ? `
              <p style="margin: 0; color: #666666; font-size: 12px; line-height: 1.6;">
                This link expires in ${expiresInHours} hours. If you didn't request this, please contact support.
              </p>
              ` : ''}
              <p style="margin: 12px 0 0; color: #999999; font-size: 11px;">
                © ${new Date().getFullYear()} ${companyName}. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

/**
 * Generate Welcome Email Plain Text
 */
function generateWelcomeEmailText(data: {
  userName: string;
  magicLink?: string;
  expiresInHours?: number;
  companyName: string;
}): string {
  const { userName, magicLink, expiresInHours, companyName } = data;

  return `
Welcome to ${companyName}!

Hello ${userName},

Your account has been created successfully.

${magicLink ? `
To get started, click this link to access your account (valid for ${expiresInHours} hours):

${magicLink}

What you can do:
- Upload and manage your documents securely
- Access your files anytime, anywhere
- Share documents with authorized parties
- Track document status in real-time
` : `
Your administrator will send you access instructions shortly.
`}

© ${new Date().getFullYear()} ${companyName}. All rights reserved.
  `.trim();
}

import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

function getBaseUrl() {
  return process.env.APP_URL ?? 'http://localhost:3000';
}

export async function sendPasswordResetEmail(email: string, token: string) {
  const resetUrl = `${getBaseUrl()}/reset-password?token=${token}`;

  await resend.emails.send({
    from: 'onboarding@resend.dev',
    to: email,
    subject: 'Reset your DevStash password',
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
        <h2 style="margin: 0 0 8px;">Reset your password</h2>
        <p style="color: #6b7280; margin: 0 0 24px;">
          Click the button below to set a new password. This link expires in 1 hour.
        </p>
        <a href="${resetUrl}"
           style="display: inline-block; background: #3b82f6; color: #fff; text-decoration: none;
                  padding: 12px 24px; border-radius: 6px; font-weight: 600;">
          Reset password
        </a>
        <p style="color: #9ca3af; font-size: 12px; margin: 24px 0 0;">
          If you didn&apos;t request a password reset, you can safely ignore this email.
        </p>
      </div>
    `,
  });
}

export async function sendVerificationEmail(email: string, token: string) {
  const verifyUrl = `${getBaseUrl()}/verify-email?token=${token}`;

  await resend.emails.send({
    from: 'onboarding@resend.dev',
    to: email,
    subject: 'Verify your DevStash email',
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
        <h2 style="margin: 0 0 8px;">Verify your email</h2>
        <p style="color: #6b7280; margin: 0 0 24px;">
          Click the button below to verify your DevStash account. This link expires in 24 hours.
        </p>
        <a href="${verifyUrl}"
           style="display: inline-block; background: #3b82f6; color: #fff; text-decoration: none;
                  padding: 12px 24px; border-radius: 6px; font-weight: 600;">
          Verify email
        </a>
        <p style="color: #9ca3af; font-size: 12px; margin: 24px 0 0;">
          If you didn&apos;t create a DevStash account, you can safely ignore this email.
        </p>
      </div>
    `,
  });
}

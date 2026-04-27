import { NextRequest, NextResponse } from 'next/server';
import { randomBytes } from 'crypto';
import { prisma } from '@/lib/prisma';
import { sendVerificationEmail } from '@/lib/email';
import { checkRateLimit, getIP, limiters } from '@/lib/rate-limit';

export async function POST(req: NextRequest) {
  const ip = getIP(req.headers);
  const body = await req.json().catch(() => ({})) as { email?: string };
  const email = body.email?.trim().toLowerCase();

  if (!email) {
    return NextResponse.json({ error: 'Email is required.' }, { status: 400 });
  }

  const rl = await checkRateLimit(limiters.resendVerification, `${ip}:${email}`);
  if (rl.limited) {
    return NextResponse.json(
      { error: `Too many attempts. Please try again in ${rl.retryAfterSeconds} seconds.` },
      { status: 429, headers: { 'Retry-After': String(rl.retryAfterSeconds) } },
    );
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (user && !user.emailVerified) {
    await prisma.verificationToken.deleteMany({ where: { identifier: email } });
    const token = randomBytes(32).toString('hex');
    await prisma.verificationToken.create({
      data: {
        identifier: email,
        token,
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
    });
    await sendVerificationEmail(email, token);
  }

  return NextResponse.json({ success: true });
}

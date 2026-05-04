import { randomBytes } from 'crypto';
import { prisma } from '@/lib/prisma';

export async function createVerificationToken(identifier: string, ttlMs: number): Promise<string> {
  const token = randomBytes(32).toString('hex');
  await prisma.verificationToken.create({
    data: {
      identifier,
      token,
      expires: new Date(Date.now() + ttlMs),
    },
  });
  return token;
}

import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  if (!token) {
    redirect('/sign-in?error=invalid_token');
  }

  const record = await prisma.verificationToken.findUnique({
    where: { token },
  });

  if (!record) {
    redirect('/sign-in?error=invalid_token');
  }

  if (record.expires < new Date()) {
    await prisma.verificationToken.delete({ where: { token } });
    redirect('/sign-in?error=token_expired');
  }

  await prisma.$transaction([
    prisma.user.update({
      where: { email: record.identifier },
      data: { emailVerified: new Date() },
    }),
    prisma.verificationToken.delete({ where: { token } }),
  ]);

  redirect('/sign-in?verified=1');
}

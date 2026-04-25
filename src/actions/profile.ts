'use server';

import { redirect } from 'next/navigation';
import { auth, signOut } from '@/auth';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function changePasswordAction(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) redirect('/sign-in');

  const currentPassword = formData.get('currentPassword') as string;
  const newPassword = formData.get('newPassword') as string;
  const confirmPassword = formData.get('confirmPassword') as string;

  if (!currentPassword || !newPassword || !confirmPassword) {
    redirect('/profile?error=required');
  }
  if (newPassword !== confirmPassword) {
    redirect('/profile?error=mismatch');
  }
  if (newPassword.length < 8) {
    redirect('/profile?error=short');
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { password: true },
  });

  if (!user?.password) {
    redirect('/profile?error=no_password');
  }

  const valid = await bcrypt.compare(currentPassword, user.password);
  if (!valid) {
    redirect('/profile?error=wrong_password');
  }

  const hashed = await bcrypt.hash(newPassword, 12);
  await prisma.user.update({
    where: { id: session.user.id },
    data: { password: hashed },
  });

  redirect('/profile?success=password');
}

export async function deleteAccountAction() {
  const session = await auth();
  if (!session?.user?.id) redirect('/sign-in');

  await prisma.user.delete({ where: { id: session.user.id } });
  await signOut({ redirectTo: '/sign-in' });
}

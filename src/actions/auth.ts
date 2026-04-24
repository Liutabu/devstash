'use server';

import { redirect } from 'next/navigation';
import { AuthError, CredentialsSignin } from 'next-auth';
import { signIn, signOut } from '@/auth';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { randomBytes } from 'crypto';
import { sendVerificationEmail } from '@/lib/email';

export async function signInWithGitHub() {
  await signIn('github', { redirectTo: '/dashboard' });
}

export async function signInWithCredentials(formData: FormData) {
  try {
    await signIn('credentials', {
      email: formData.get('email'),
      password: formData.get('password'),
      redirectTo: '/dashboard',
    });
  } catch (error) {
    if (error instanceof CredentialsSignin && error.code === 'unverified') {
      redirect('/sign-in?error=unverified');
    }
    if (error instanceof AuthError) {
      redirect('/sign-in?error=invalid');
    }
    throw error;
  }
}

export async function registerAction(formData: FormData) {
  const name = (formData.get('name') as string)?.trim();
  const email = (formData.get('email') as string)?.trim().toLowerCase();
  const password = formData.get('password') as string;
  const confirmPassword = formData.get('confirmPassword') as string;

  if (!name || !email || !password || !confirmPassword) {
    redirect('/register?error=required');
  }
  if (password !== confirmPassword) {
    redirect('/register?error=mismatch');
  }
  if (password.length < 8) {
    redirect('/register?error=short');
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    redirect('/register?error=exists');
  }

  const hashed = await bcrypt.hash(password, 12);
  await prisma.user.create({ data: { name, email, password: hashed } });

  const token = randomBytes(32).toString('hex');
  await prisma.verificationToken.create({
    data: {
      identifier: email,
      token,
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
    },
  });

  await sendVerificationEmail(email, token);

  redirect(`/check-email?email=${encodeURIComponent(email)}`);
}

export async function signOutAction() {
  await signOut({ redirectTo: '/sign-in' });
}

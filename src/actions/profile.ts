'use server';

import { redirect } from 'next/navigation';
import { z } from 'zod';
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
    redirect('/settings?error=required');
  }
  if (newPassword !== confirmPassword) {
    redirect('/settings?error=mismatch');
  }
  if (newPassword.length < 8) {
    redirect('/settings?error=short');
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { password: true },
  });

  if (!user?.password) {
    redirect('/settings?error=no_password');
  }

  const valid = await bcrypt.compare(currentPassword, user.password);
  if (!valid) {
    redirect('/settings?error=wrong_password');
  }

  const hashed = await bcrypt.hash(newPassword, 12);
  await prisma.user.update({
    where: { id: session.user.id },
    data: { password: hashed },
  });

  redirect('/settings?success=password');
}

export async function deleteAccountAction() {
  const session = await auth();
  if (!session?.user?.id) redirect('/sign-in');

  await prisma.user.delete({ where: { id: session.user.id } });
  await signOut({ redirectTo: '/sign-in' });
}

const EditorPreferencesSchema = z.object({
  fontSize: z.number().int().min(10).max(24),
  tabSize: z.number().int().min(1).max(8),
  wordWrap: z.boolean(),
  minimap: z.boolean(),
  theme: z.enum(['vs-dark', 'monokai', 'github-dark']),
});

export async function updateEditorPreferencesAction(
  input: z.infer<typeof EditorPreferencesSchema>,
): Promise<{ success: boolean; error?: string }> {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: 'Unauthorized' };

  const parsed = EditorPreferencesSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: 'Invalid preferences' };

  await prisma.user.update({
    where: { id: session.user.id },
    data: { editorPreferences: parsed.data },
  });

  return { success: true };
}

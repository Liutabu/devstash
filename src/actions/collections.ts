'use server';

import { z } from 'zod';
import { auth } from '@/auth';
import { createCollection } from '@/lib/db/collections';
import type { CollectionDetail } from '@/lib/db/collections';

const CreateCollectionSchema = z.object({
  name: z.string().trim().min(1, 'Name is required'),
  description: z.preprocess((v) => (v == null || v === '' ? null : v), z.string().nullable()).optional(),
});

type CreateCollectionInput = z.infer<typeof CreateCollectionSchema>;

type CreateCollectionResult =
  | { success: true; data: CollectionDetail }
  | { success: false; error: string | Record<string, string[] | undefined> };

export async function createCollectionAction(
  data: CreateCollectionInput,
): Promise<CreateCollectionResult> {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: 'Unauthorized' };

  const parsed = CreateCollectionSchema.safeParse(data);
  if (!parsed.success) return { success: false, error: parsed.error.flatten().fieldErrors };

  try {
    const collection = await createCollection(session.user.id, parsed.data);
    return { success: true, data: collection };
  } catch {
    return { success: false, error: 'Failed to create collection' };
  }
}

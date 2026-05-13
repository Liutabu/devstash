'use server';

import { z } from 'zod';
import { auth } from '@/auth';
import { createCollection, updateCollection, deleteCollection, toggleCollectionFavorite } from '@/lib/db/collections';
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

const UpdateCollectionSchema = z.object({
  id: z.string().min(1),
  name: z.string().trim().min(1, 'Name is required'),
  description: z.string().optional(),
});

type UpdateCollectionResult =
  | { success: true; data: CollectionDetail }
  | { success: false; error: string | Record<string, string[] | undefined> };

export async function updateCollectionAction(
  data: z.infer<typeof UpdateCollectionSchema>,
): Promise<UpdateCollectionResult> {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: 'Unauthorized' };

  const parsed = UpdateCollectionSchema.safeParse(data);
  if (!parsed.success) return { success: false, error: parsed.error.flatten().fieldErrors };

  const description = parsed.data.description === '' ? null : (parsed.data.description ?? null);

  try {
    const collection = await updateCollection(parsed.data.id, session.user.id, {
      name: parsed.data.name,
      description,
    });
    if (!collection) return { success: false, error: 'Collection not found' };
    return { success: true, data: collection };
  } catch {
    return { success: false, error: 'Failed to update collection' };
  }
}

type DeleteCollectionResult = { success: true } | { success: false; error: string };

export async function deleteCollectionAction(id: string): Promise<DeleteCollectionResult> {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: 'Unauthorized' };

  try {
    const deleted = await deleteCollection(id, session.user.id);
    if (!deleted) return { success: false, error: 'Collection not found' };
    return { success: true };
  } catch {
    return { success: false, error: 'Failed to delete collection' };
  }
}

type ToggleCollectionFavoriteResult =
  | { success: true; data: { isFavorite: boolean } }
  | { success: false; error: string };

export async function toggleCollectionFavoriteAction(
  collectionId: string,
): Promise<ToggleCollectionFavoriteResult> {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: 'Unauthorized' };

  try {
    const isFavorite = await toggleCollectionFavorite(collectionId, session.user.id);
    if (isFavorite === null) return { success: false, error: 'Collection not found' };
    return { success: true, data: { isFavorite } };
  } catch {
    return { success: false, error: 'Failed to update favorite' };
  }
}

'use server';

import { z } from 'zod';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { createItem, updateItem, deleteItem, toggleItemFavorite } from '@/lib/db/items';
import type { ItemDetail } from '@/lib/db/items';

const UpdateItemSchema = z.object({
  title: z.string().trim().min(1, 'Title is required'),
  description: z.string().nullable().optional(),
  content: z.string().nullable().optional(),
  url: z.preprocess(
    (v) => (v === '' ? null : v),
    z.string().url('Must be a valid URL').nullable().optional(),
  ),
  language: z.preprocess(
    (v) => (v === '' ? null : v),
    z.string().nullable().optional(),
  ),
  tags: z.array(z.string().trim().min(1)),
  collectionIds: z.array(z.string()).optional().default([]),
});

type UpdateItemInput = z.infer<typeof UpdateItemSchema>;

const CreateItemSchema = z.object({
  title: z.string().trim().min(1, 'Title is required'),
  description: z.preprocess((v) => (v === '' ? null : v), z.string().nullable().optional()),
  content: z.preprocess((v) => (v === '' ? null : v), z.string().nullable().optional()),
  url: z.preprocess(
    (v) => (v === '' ? null : v),
    z.string().nullable().optional(),
  ),
  fileUrl: z.preprocess((v) => (v === '' ? null : v), z.string().nullable().optional()),
  fileName: z.preprocess((v) => (v === '' ? null : v), z.string().nullable().optional()),
  fileSize: z.number().nullable().optional(),
  language: z.preprocess((v) => (v === '' ? null : v), z.string().nullable().optional()),
  tags: z.array(z.string().trim().min(1)),
  itemTypeId: z.string().min(1, 'Item type is required'),
  contentType: z.enum(['text', 'url', 'file']),
  collectionIds: z.array(z.string()).optional().default([]),
}).refine(
  (data) => data.contentType !== 'url' || !!data.url,
  { message: 'URL is required', path: ['url'] },
).refine(
  (data) => data.contentType !== 'file' || !!data.fileUrl,
  { message: 'File is required', path: ['fileUrl'] },
);

type CreateItemInput = z.infer<typeof CreateItemSchema>;

type CreateItemResult =
  | { success: true; data: ItemDetail }
  | { success: false; error: string | Record<string, string[] | undefined> };

export async function createItemAction(data: CreateItemInput): Promise<CreateItemResult> {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: 'Unauthorized' };

  const parsed = CreateItemSchema.safeParse(data);
  if (!parsed.success) return { success: false, error: parsed.error.flatten().fieldErrors };

  if (parsed.data.fileUrl && !parsed.data.fileUrl.startsWith(`uploads/${session.user.id}/`)) {
    return { success: false, error: 'Invalid file reference' };
  }

  const itemType = await prisma.itemType.findFirst({
    where: { id: parsed.data.itemTypeId, OR: [{ isSystem: true }, { userId: session.user.id }] },
  });
  if (!itemType) return { success: false, error: 'Invalid item type' };

  const created = await createItem(session.user.id, {
    ...parsed.data,
    contentType: parsed.data.contentType as 'text' | 'url' | 'file',
    collectionIds: parsed.data.collectionIds,
  });

  return { success: true, data: created };
}

type UpdateItemResult =
  | { success: true; data: ItemDetail }
  | { success: false; error: string | Record<string, string[] | undefined> };

export async function updateItemAction(
  itemId: string,
  data: UpdateItemInput,
): Promise<UpdateItemResult> {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: 'Unauthorized' };

  const parsed = UpdateItemSchema.safeParse(data);
  if (!parsed.success) return { success: false, error: parsed.error.flatten().fieldErrors };

  const updated = await updateItem(itemId, session.user.id, {
    ...parsed.data,
    collectionIds: parsed.data.collectionIds,
  });
  if (!updated) return { success: false, error: 'Item not found' };

  return { success: true, data: updated };
}

type DeleteItemResult = { success: true } | { success: false; error: string };

export async function deleteItemAction(itemId: string): Promise<DeleteItemResult> {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: 'Unauthorized' };

  const deleted = await deleteItem(itemId, session.user.id);
  if (!deleted) return { success: false, error: 'Item not found' };

  return { success: true };
}

type ToggleItemFavoriteResult =
  | { success: true; data: { isFavorite: boolean } }
  | { success: false; error: string };

export async function toggleItemFavoriteAction(itemId: string): Promise<ToggleItemFavoriteResult> {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: 'Unauthorized' };

  const isFavorite = await toggleItemFavorite(itemId, session.user.id);
  if (isFavorite === null) return { success: false, error: 'Item not found' };

  return { success: true, data: { isFavorite } };
}

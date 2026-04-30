'use server';

import { z } from 'zod';
import { auth } from '@/auth';
import { updateItem, deleteItem } from '@/lib/db/items';
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
});

type UpdateItemInput = z.infer<typeof UpdateItemSchema>;

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

  const updated = await updateItem(itemId, session.user.id, parsed.data);
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

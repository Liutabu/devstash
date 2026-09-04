'use server';

import { z } from 'zod';
import { auth } from '@/auth';
import { openai, AI_MODEL } from '@/lib/openai';
import { getUserLimits } from '@/lib/limits';
import { checkRateLimit, limiters } from '@/lib/rate-limit';
import {
  AUTO_TAG_INSTRUCTIONS,
  buildAutoTagInput,
  parseTagSuggestions,
} from '@/lib/ai/tags';

const AutoTagSchema = z.object({
  title: z.string().trim().min(1, 'Title is required'),
  content: z.preprocess((v) => (v == null ? '' : v), z.string()),
});

type AutoTagInput = z.infer<typeof AutoTagSchema>;

type AutoTagResult =
  | { success: true; data: { tags: string[] } }
  | { success: false; error: string };

export async function generateAutoTags(data: AutoTagInput): Promise<AutoTagResult> {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: 'Unauthorized' };

  const parsed = AutoTagSchema.safeParse(data);
  if (!parsed.success) return { success: false, error: 'Add a title before suggesting tags.' };

  const limits = await getUserLimits(session.user.id);
  if (!limits.canUseAi) return { success: false, error: 'AI features require Pro.' };

  const rateLimit = await checkRateLimit(limiters.ai, session.user.id);
  if (rateLimit.limited) {
    return { success: false, error: 'AI request limit reached. Try again later.' };
  }

  try {
    const response = await openai.responses.create({
      model: AI_MODEL,
      instructions: AUTO_TAG_INSTRUCTIONS,
      input: buildAutoTagInput(parsed.data.title, parsed.data.content),
      text: { format: { type: 'json_object' } },
      store: false,
    });

    const tags = parseTagSuggestions(response.output_text);
    if (tags.length === 0) {
      return { success: false, error: 'No tags could be suggested for this item.' };
    }

    return { success: true, data: { tags } };
  } catch (error) {
    console.error('generateAutoTags failed', { userId: session.user.id, error });
    return { success: false, error: 'Could not generate tags right now. Try again.' };
  }
}

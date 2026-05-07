import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/auth', () => ({
  auth: vi.fn(),
}));

vi.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      update: vi.fn(),
    },
  },
}));

import { updateEditorPreferencesAction } from './profile';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

const mockAuth = vi.mocked(auth);
const mockUpdate = vi.mocked(prisma.user.update);

const validPreferences = {
  fontSize: 14,
  tabSize: 2,
  wordWrap: true,
  minimap: false,
  theme: 'vs-dark' as const,
};

beforeEach(() => {
  vi.resetAllMocks();
});

describe('updateEditorPreferencesAction', () => {
  it('returns unauthorized when no session', async () => {
    mockAuth.mockResolvedValue(null as never);
    const result = await updateEditorPreferencesAction(validPreferences);
    expect(result).toEqual({ success: false, error: 'Unauthorized' });
    expect(mockUpdate).not.toHaveBeenCalled();
  });

  it('returns error for invalid fontSize', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'user-1' } } as never);
    const result = await updateEditorPreferencesAction({ ...validPreferences, fontSize: 999 });
    expect(result).toEqual({ success: false, error: 'Invalid preferences' });
    expect(mockUpdate).not.toHaveBeenCalled();
  });

  it('returns error for invalid theme', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'user-1' } } as never);
    const result = await updateEditorPreferencesAction({
      ...validPreferences,
      theme: 'unknown-theme' as never,
    });
    expect(result).toEqual({ success: false, error: 'Invalid preferences' });
    expect(mockUpdate).not.toHaveBeenCalled();
  });

  it('saves preferences and returns success', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'user-1' } } as never);
    mockUpdate.mockResolvedValue({} as never);

    const result = await updateEditorPreferencesAction(validPreferences);

    expect(result).toEqual({ success: true });
    expect(mockUpdate).toHaveBeenCalledWith({
      where: { id: 'user-1' },
      data: { editorPreferences: validPreferences },
    });
  });

  it('saves monokai theme correctly', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'user-1' } } as never);
    mockUpdate.mockResolvedValue({} as never);

    const prefs = { ...validPreferences, theme: 'monokai' as const };
    const result = await updateEditorPreferencesAction(prefs);

    expect(result).toEqual({ success: true });
    expect(mockUpdate).toHaveBeenCalledWith({
      where: { id: 'user-1' },
      data: { editorPreferences: prefs },
    });
  });

  it('saves github-dark theme correctly', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'user-1' } } as never);
    mockUpdate.mockResolvedValue({} as never);

    const prefs = { ...validPreferences, theme: 'github-dark' as const, minimap: true };
    const result = await updateEditorPreferencesAction(prefs);

    expect(result).toEqual({ success: true });
  });
});

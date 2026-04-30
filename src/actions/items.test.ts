import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/auth', () => ({
  auth: vi.fn(),
}));

vi.mock('@/lib/db/items', () => ({
  updateItem: vi.fn(),
}));

import { updateItemAction } from './items';
import { auth } from '@/auth';
import { updateItem } from '@/lib/db/items';

const mockAuth = vi.mocked(auth);
const mockUpdateItem = vi.mocked(updateItem);

const validInput = {
  title: 'Test Title',
  description: 'A description',
  content: 'console.log("hi")',
  url: null,
  language: 'typescript',
  tags: ['react', 'hooks'],
};

const mockDetail = {
  id: 'item-1',
  title: 'Test Title',
  description: 'A description',
  content: 'console.log("hi")',
  url: null,
  language: 'typescript',
  contentType: 'text',
  isFavorite: false,
  isPinned: false,
  tags: ['react', 'hooks'],
  itemType: { id: 'type-1', name: 'Snippet', color: '#3b82f6', icon: 'Code' },
  collections: [],
  createdAt: new Date('2026-01-01'),
  updatedAt: new Date('2026-01-02'),
};

beforeEach(() => {
  vi.resetAllMocks();
});

describe('updateItemAction', () => {
  it('returns unauthorized when no session', async () => {
    mockAuth.mockResolvedValue(null);
    const result = await updateItemAction('item-1', validInput);
    expect(result).toEqual({ success: false, error: 'Unauthorized' });
    expect(mockUpdateItem).not.toHaveBeenCalled();
  });

  it('returns unauthorized when session has no user id', async () => {
    mockAuth.mockResolvedValue({ user: {} } as never);
    const result = await updateItemAction('item-1', validInput);
    expect(result).toEqual({ success: false, error: 'Unauthorized' });
  });

  it('returns validation error when title is empty', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'user-1' } } as never);
    const result = await updateItemAction('item-1', { ...validInput, title: '   ' });
    expect(result.success).toBe(false);
    expect(mockUpdateItem).not.toHaveBeenCalled();
  });

  it('returns validation error for invalid URL', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'user-1' } } as never);
    const result = await updateItemAction('item-1', { ...validInput, url: 'not-a-url' });
    expect(result.success).toBe(false);
    expect(mockUpdateItem).not.toHaveBeenCalled();
  });

  it('returns item not found when updateItem returns null', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'user-1' } } as never);
    mockUpdateItem.mockResolvedValue(null);
    const result = await updateItemAction('item-1', validInput);
    expect(result).toEqual({ success: false, error: 'Item not found' });
  });

  it('returns updated item on success', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'user-1' } } as never);
    mockUpdateItem.mockResolvedValue(mockDetail);
    const result = await updateItemAction('item-1', validInput);
    expect(result).toEqual({ success: true, data: mockDetail });
    expect(mockUpdateItem).toHaveBeenCalledWith('item-1', 'user-1', expect.objectContaining({
      title: 'Test Title',
      tags: ['react', 'hooks'],
    }));
  });

  it('converts empty string url to null before validation', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'user-1' } } as never);
    mockUpdateItem.mockResolvedValue(mockDetail);
    const result = await updateItemAction('item-1', { ...validInput, url: '' });
    expect(result.success).toBe(true);
    expect(mockUpdateItem).toHaveBeenCalledWith('item-1', 'user-1', expect.objectContaining({ url: null }));
  });

  it('converts empty string language to null', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'user-1' } } as never);
    mockUpdateItem.mockResolvedValue(mockDetail);
    await updateItemAction('item-1', { ...validInput, language: '' });
    expect(mockUpdateItem).toHaveBeenCalledWith('item-1', 'user-1', expect.objectContaining({ language: null }));
  });
});

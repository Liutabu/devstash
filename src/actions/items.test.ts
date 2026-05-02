import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/auth', () => ({
  auth: vi.fn(),
}));

vi.mock('@/lib/db/items', () => ({
  createItem: vi.fn(),
  updateItem: vi.fn(),
  deleteItem: vi.fn(),
}));

import { createItemAction, updateItemAction, deleteItemAction } from './items';
import { auth } from '@/auth';
import { createItem, updateItem, deleteItem } from '@/lib/db/items';

const mockAuth = vi.mocked(auth);
const mockCreateItem = vi.mocked(createItem);
const mockUpdateItem = vi.mocked(updateItem);
const mockDeleteItem = vi.mocked(deleteItem);

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
  fileUrl: null,
  fileName: null,
  fileSize: null,
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

const validCreateInput = {
  title: 'New Snippet',
  description: null,
  content: 'console.log("hello")',
  url: null,
  fileUrl: null,
  fileName: null,
  fileSize: null,
  language: 'typescript',
  tags: ['js'],
  itemTypeId: 'type-1',
  contentType: 'text' as const,
};

describe('createItemAction', () => {
  it('returns unauthorized when no session', async () => {
    mockAuth.mockResolvedValue(null as never);
    const result = await createItemAction(validCreateInput);
    expect(result).toEqual({ success: false, error: 'Unauthorized' });
    expect(mockCreateItem).not.toHaveBeenCalled();
  });

  it('returns validation error when title is empty', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'user-1' } } as never);
    const result = await createItemAction({ ...validCreateInput, title: '  ' });
    expect(result.success).toBe(false);
    expect(mockCreateItem).not.toHaveBeenCalled();
  });

  it('returns validation error when link type has no url', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'user-1' } } as never);
    const result = await createItemAction({
      ...validCreateInput,
      contentType: 'url',
      url: null,
    });
    expect(result.success).toBe(false);
    expect(mockCreateItem).not.toHaveBeenCalled();
  });

  it('returns validation error when itemTypeId is empty', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'user-1' } } as never);
    const result = await createItemAction({ ...validCreateInput, itemTypeId: '' });
    expect(result.success).toBe(false);
    expect(mockCreateItem).not.toHaveBeenCalled();
  });

  it('returns created item on success', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'user-1' } } as never);
    mockCreateItem.mockResolvedValue(mockDetail);
    const result = await createItemAction(validCreateInput);
    expect(result).toEqual({ success: true, data: mockDetail });
    expect(mockCreateItem).toHaveBeenCalledWith('user-1', expect.objectContaining({
      title: 'New Snippet',
      itemTypeId: 'type-1',
      contentType: 'text',
    }));
  });

  it('accepts url type with valid url', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'user-1' } } as never);
    mockCreateItem.mockResolvedValue(mockDetail);
    const result = await createItemAction({
      ...validCreateInput,
      contentType: 'url',
      url: 'https://example.com',
    });
    expect(result.success).toBe(true);
  });

  it('returns validation error when file type has no fileUrl', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'user-1' } } as never);
    const result = await createItemAction({
      ...validCreateInput,
      contentType: 'file',
      fileUrl: null,
    });
    expect(result.success).toBe(false);
    expect(mockCreateItem).not.toHaveBeenCalled();
  });

  it('accepts file type with valid fileUrl', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'user-1' } } as never);
    mockCreateItem.mockResolvedValue(mockDetail);
    const result = await createItemAction({
      ...validCreateInput,
      contentType: 'file',
      fileUrl: 'uploads/user-1/abc123.pdf',
      fileName: 'notes.pdf',
      fileSize: 12345,
    });
    expect(result.success).toBe(true);
    expect(mockCreateItem).toHaveBeenCalledWith('user-1', expect.objectContaining({
      contentType: 'file',
      fileUrl: 'uploads/user-1/abc123.pdf',
      fileName: 'notes.pdf',
      fileSize: 12345,
    }));
  });
});

describe('updateItemAction', () => {
  it('returns unauthorized when no session', async () => {
    mockAuth.mockResolvedValue(null as never);
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

describe('deleteItemAction', () => {
  it('returns unauthorized when no session', async () => {
    mockAuth.mockResolvedValue(null as never);
    const result = await deleteItemAction('item-1');
    expect(result).toEqual({ success: false, error: 'Unauthorized' });
    expect(mockDeleteItem).not.toHaveBeenCalled();
  });

  it('returns item not found when deleteItem returns false', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'user-1' } } as never);
    mockDeleteItem.mockResolvedValue(false);
    const result = await deleteItemAction('item-1');
    expect(result).toEqual({ success: false, error: 'Item not found' });
  });

  it('returns success when deleteItem returns true', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'user-1' } } as never);
    mockDeleteItem.mockResolvedValue(true);
    const result = await deleteItemAction('item-1');
    expect(result).toEqual({ success: true });
    expect(mockDeleteItem).toHaveBeenCalledWith('item-1', 'user-1');
  });
});

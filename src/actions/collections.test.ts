import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/auth', () => ({
  auth: vi.fn(),
}));

vi.mock('@/lib/db/collections', () => ({
  createCollection: vi.fn(),
  updateCollection: vi.fn(),
  deleteCollection: vi.fn(),
  toggleCollectionFavorite: vi.fn(),
}));

vi.mock('@/lib/limits', () => ({
  getUserLimits: vi.fn(),
}));

import { createCollectionAction, updateCollectionAction, deleteCollectionAction, toggleCollectionFavoriteAction } from './collections';
import { auth } from '@/auth';
import { createCollection, updateCollection, deleteCollection, toggleCollectionFavorite } from '@/lib/db/collections';
import { getUserLimits } from '@/lib/limits';

const mockAuth = vi.mocked(auth);
const mockCreateCollection = vi.mocked(createCollection);
const mockUpdateCollection = vi.mocked(updateCollection);
const mockDeleteCollection = vi.mocked(deleteCollection);
const mockToggleCollectionFavorite = vi.mocked(toggleCollectionFavorite);
const mockGetUserLimits = vi.mocked(getUserLimits);

const ALLOW_ALL_LIMITS = {
  isPro: false,
  itemCount: 0,
  collectionCount: 0,
  canCreateItem: true,
  canCreateCollection: true,
  canUseProType: true,
};

const mockCollectionDetail = {
  id: 'col-1',
  name: 'My Collection',
  description: 'A description',
  isFavorite: false,
  createdAt: new Date('2026-01-01'),
  updatedAt: new Date('2026-01-01'),
};

beforeEach(() => {
  vi.resetAllMocks();
  mockGetUserLimits.mockResolvedValue(ALLOW_ALL_LIMITS);
});

describe('createCollectionAction', () => {
  it('returns unauthorized when no session', async () => {
    mockAuth.mockResolvedValue(null as never);
    const result = await createCollectionAction({ name: 'Test' });
    expect(result).toEqual({ success: false, error: 'Unauthorized' });
    expect(mockCreateCollection).not.toHaveBeenCalled();
  });

  it('returns validation error when name is empty', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'user-1' } } as never);
    const result = await createCollectionAction({ name: '   ' });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(typeof result.error).toBe('object');
    }
    expect(mockCreateCollection).not.toHaveBeenCalled();
  });

  it('returns success and collection data on valid input', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'user-1' } } as never);
    mockCreateCollection.mockResolvedValue(mockCollectionDetail);
    const result = await createCollectionAction({ name: 'My Collection', description: 'A description' });
    expect(result).toEqual({ success: true, data: mockCollectionDetail });
    expect(mockCreateCollection).toHaveBeenCalledWith('user-1', {
      name: 'My Collection',
      description: 'A description',
    });
  });

  it('coerces empty description string to null', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'user-1' } } as never);
    mockCreateCollection.mockResolvedValue({ ...mockCollectionDetail, description: null });
    await createCollectionAction({ name: 'My Collection', description: '' });
    expect(mockCreateCollection).toHaveBeenCalledWith('user-1', {
      name: 'My Collection',
      description: null,
    });
  });

  it('returns error when db throws', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'user-1' } } as never);
    mockCreateCollection.mockRejectedValue(new Error('DB error'));
    const result = await createCollectionAction({ name: 'My Collection', description: null });
    expect(result).toEqual({ success: false, error: 'Failed to create collection' });
  });
});

describe('updateCollectionAction', () => {
  it('returns unauthorized when no session', async () => {
    mockAuth.mockResolvedValue(null as never);
    const result = await updateCollectionAction({ id: 'col-1', name: 'Updated' });
    expect(result).toEqual({ success: false, error: 'Unauthorized' });
    expect(mockUpdateCollection).not.toHaveBeenCalled();
  });

  it('returns validation error when name is empty', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'user-1' } } as never);
    const result = await updateCollectionAction({ id: 'col-1', name: '   ' });
    expect(result.success).toBe(false);
    if (!result.success) expect(typeof result.error).toBe('object');
    expect(mockUpdateCollection).not.toHaveBeenCalled();
  });

  it('returns not found when updateCollection returns null', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'user-1' } } as never);
    mockUpdateCollection.mockResolvedValue(null as never);
    const result = await updateCollectionAction({ id: 'col-1', name: 'Updated' });
    expect(result).toEqual({ success: false, error: 'Collection not found' });
  });

  it('returns success with updated data', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'user-1' } } as never);
    mockUpdateCollection.mockResolvedValue(mockCollectionDetail);
    const result = await updateCollectionAction({ id: 'col-1', name: 'Updated', description: 'New desc' });
    expect(result).toEqual({ success: true, data: mockCollectionDetail });
    expect(mockUpdateCollection).toHaveBeenCalledWith('col-1', 'user-1', {
      name: 'Updated',
      description: 'New desc',
    });
  });

  it('coerces empty description string to null', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'user-1' } } as never);
    mockUpdateCollection.mockResolvedValue(mockCollectionDetail);
    await updateCollectionAction({ id: 'col-1', name: 'Updated', description: '' });
    expect(mockUpdateCollection).toHaveBeenCalledWith('col-1', 'user-1', {
      name: 'Updated',
      description: null,
    });
  });
});

describe('deleteCollectionAction', () => {
  it('returns unauthorized when no session', async () => {
    mockAuth.mockResolvedValue(null as never);
    const result = await deleteCollectionAction('col-1');
    expect(result).toEqual({ success: false, error: 'Unauthorized' });
    expect(mockDeleteCollection).not.toHaveBeenCalled();
  });

  it('returns not found when deleteCollection returns false', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'user-1' } } as never);
    mockDeleteCollection.mockResolvedValue(false);
    const result = await deleteCollectionAction('col-1');
    expect(result).toEqual({ success: false, error: 'Collection not found' });
  });

  it('returns success when collection is deleted', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'user-1' } } as never);
    mockDeleteCollection.mockResolvedValue(true);
    const result = await deleteCollectionAction('col-1');
    expect(result).toEqual({ success: true });
    expect(mockDeleteCollection).toHaveBeenCalledWith('col-1', 'user-1');
  });
});

describe('toggleCollectionFavoriteAction', () => {
  it('returns unauthorized when no session', async () => {
    mockAuth.mockResolvedValue(null as never);
    const result = await toggleCollectionFavoriteAction('col-1');
    expect(result).toEqual({ success: false, error: 'Unauthorized' });
    expect(mockToggleCollectionFavorite).not.toHaveBeenCalled();
  });

  it('returns not found when toggleCollectionFavorite returns null', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'user-1' } } as never);
    mockToggleCollectionFavorite.mockResolvedValue(null);
    const result = await toggleCollectionFavoriteAction('col-1');
    expect(result).toEqual({ success: false, error: 'Collection not found' });
  });

  it('returns success with new isFavorite value', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'user-1' } } as never);
    mockToggleCollectionFavorite.mockResolvedValue(true);
    const result = await toggleCollectionFavoriteAction('col-1');
    expect(result).toEqual({ success: true, data: { isFavorite: true } });
    expect(mockToggleCollectionFavorite).toHaveBeenCalledWith('col-1', 'user-1');
  });
});

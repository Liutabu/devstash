import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/auth', () => ({
  auth: vi.fn(),
}));

vi.mock('@/lib/db/collections', () => ({
  createCollection: vi.fn(),
}));

import { createCollectionAction } from './collections';
import { auth } from '@/auth';
import { createCollection } from '@/lib/db/collections';

const mockAuth = vi.mocked(auth);
const mockCreateCollection = vi.mocked(createCollection);

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

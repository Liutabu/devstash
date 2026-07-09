import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/auth', () => ({
  auth: vi.fn(),
}));

vi.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
  },
}));

vi.mock('@/lib/stripe', () => ({
  stripe: {
    customers: { create: vi.fn() },
    checkout: { sessions: { create: vi.fn() } },
    billingPortal: { sessions: { create: vi.fn() } },
  },
  STRIPE_PRICE_IDS: {
    monthly: 'price_monthly_test',
    yearly: 'price_yearly_test',
  },
}));

import { createCheckoutSessionAction, createPortalSessionAction } from './billing';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { stripe } from '@/lib/stripe';
import { redirect } from 'next/navigation';

const mockAuth = vi.mocked(auth);
const mockFindUnique = vi.mocked(prisma.user.findUnique);
const mockUserUpdate = vi.mocked(prisma.user.update);
const mockCustomersCreate = vi.mocked(stripe.customers.create);
const mockCheckoutCreate = vi.mocked(stripe.checkout.sessions.create);
const mockPortalCreate = vi.mocked(stripe.billingPortal.sessions.create);
const mockRedirect = vi.mocked(redirect);

beforeEach(() => {
  vi.resetAllMocks();
  mockRedirect.mockImplementation(((url: string) => {
    throw new Error(`__REDIRECT__:${url}`);
  }) as never);
});

function authedSession(overrides: Partial<{ id: string; email: string | null; name: string | null }> = {}) {
  return {
    user: {
      id: overrides.id ?? 'user-1',
      email: overrides.email === undefined ? 'user@example.com' : overrides.email,
      name: overrides.name === undefined ? 'Test User' : overrides.name,
    },
  } as never;
}

describe('createCheckoutSessionAction', () => {
  it('redirects to /sign-in when unauthenticated', async () => {
    mockAuth.mockResolvedValue(null as never);
    await expect(createCheckoutSessionAction('monthly')).rejects.toThrow('__REDIRECT__:/sign-in');
    expect(mockCheckoutCreate).not.toHaveBeenCalled();
  });

  it('redirects to /sign-in when session has no email', async () => {
    mockAuth.mockResolvedValue(authedSession({ email: null }));
    await expect(createCheckoutSessionAction('monthly')).rejects.toThrow('__REDIRECT__:/sign-in');
    expect(mockCustomersCreate).not.toHaveBeenCalled();
  });

  it('reuses existing stripeCustomerId without creating a customer', async () => {
    mockAuth.mockResolvedValue(authedSession());
    mockFindUnique.mockResolvedValue({ stripeCustomerId: 'cus_existing' } as never);
    mockCheckoutCreate.mockResolvedValue({ url: 'https://checkout.example/abc' } as never);

    await expect(createCheckoutSessionAction('monthly')).rejects.toThrow('__REDIRECT__:https://checkout.example/abc');

    expect(mockCustomersCreate).not.toHaveBeenCalled();
    expect(mockCheckoutCreate).toHaveBeenCalledWith(expect.objectContaining({
      customer: 'cus_existing',
    }));
  });

  it('creates a customer when no stripeCustomerId, persists id', async () => {
    mockAuth.mockResolvedValue(authedSession());
    mockFindUnique.mockResolvedValue({ stripeCustomerId: null } as never);
    mockCustomersCreate.mockResolvedValue({ id: 'cus_new' } as never);
    mockCheckoutCreate.mockResolvedValue({ url: 'https://checkout.example/x' } as never);

    await expect(createCheckoutSessionAction('monthly')).rejects.toThrow('__REDIRECT__:');

    expect(mockCustomersCreate).toHaveBeenCalledWith({
      email: 'user@example.com',
      name: 'Test User',
      metadata: { userId: 'user-1' },
    });
    expect(mockUserUpdate).toHaveBeenCalledWith({
      where: { id: 'user-1' },
      data: { stripeCustomerId: 'cus_new' },
    });
  });

  it('uses monthly price id for interval=monthly with required metadata', async () => {
    mockAuth.mockResolvedValue(authedSession());
    mockFindUnique.mockResolvedValue({ stripeCustomerId: 'cus_x' } as never);
    mockCheckoutCreate.mockResolvedValue({ url: 'https://checkout.example/m' } as never);

    await expect(createCheckoutSessionAction('monthly')).rejects.toThrow('__REDIRECT__:');

    expect(mockCheckoutCreate).toHaveBeenCalledWith(expect.objectContaining({
      mode: 'subscription',
      customer: 'cus_x',
      line_items: [{ price: 'price_monthly_test', quantity: 1 }],
      allow_promotion_codes: true,
      metadata: { userId: 'user-1' },
      subscription_data: { metadata: { userId: 'user-1' } },
    }));
  });

  it('uses yearly price id for interval=yearly', async () => {
    mockAuth.mockResolvedValue(authedSession());
    mockFindUnique.mockResolvedValue({ stripeCustomerId: 'cus_x' } as never);
    mockCheckoutCreate.mockResolvedValue({ url: 'https://checkout.example/y' } as never);

    await expect(createCheckoutSessionAction('yearly')).rejects.toThrow('__REDIRECT__:');

    expect(mockCheckoutCreate).toHaveBeenCalledWith(expect.objectContaining({
      line_items: [{ price: 'price_yearly_test', quantity: 1 }],
    }));
  });

  it('redirects to /settings?upgrade=error when Stripe returns no url', async () => {
    mockAuth.mockResolvedValue(authedSession());
    mockFindUnique.mockResolvedValue({ stripeCustomerId: 'cus_x' } as never);
    mockCheckoutCreate.mockResolvedValue({ url: null } as never);

    await expect(createCheckoutSessionAction('monthly')).rejects.toThrow('__REDIRECT__:/settings?upgrade=error');
  });

  it('redirects to checkout.url on success', async () => {
    mockAuth.mockResolvedValue(authedSession());
    mockFindUnique.mockResolvedValue({ stripeCustomerId: 'cus_x' } as never);
    mockCheckoutCreate.mockResolvedValue({ url: 'https://checkout.example/success' } as never);

    await expect(createCheckoutSessionAction('monthly')).rejects.toThrow('__REDIRECT__:https://checkout.example/success');
  });
});

describe('createPortalSessionAction', () => {
  it('redirects to /sign-in when unauthenticated', async () => {
    mockAuth.mockResolvedValue(null as never);
    await expect(createPortalSessionAction()).rejects.toThrow('__REDIRECT__:/sign-in');
    expect(mockPortalCreate).not.toHaveBeenCalled();
  });

  it('redirects to /settings?upgrade=no_customer when no stripeCustomerId', async () => {
    mockAuth.mockResolvedValue(authedSession());
    mockFindUnique.mockResolvedValue({ stripeCustomerId: null } as never);

    await expect(createPortalSessionAction()).rejects.toThrow('__REDIRECT__:/settings?upgrade=no_customer');
    expect(mockPortalCreate).not.toHaveBeenCalled();
  });

  it('creates portal session with correct customer and return_url', async () => {
    process.env.APP_URL = 'http://localhost:3000';
    mockAuth.mockResolvedValue(authedSession());
    mockFindUnique.mockResolvedValue({ stripeCustomerId: 'cus_x' } as never);
    mockPortalCreate.mockResolvedValue({ url: 'https://portal.example/abc' } as never);

    await expect(createPortalSessionAction()).rejects.toThrow('__REDIRECT__:https://portal.example/abc');

    expect(mockPortalCreate).toHaveBeenCalledWith({
      customer: 'cus_x',
      return_url: 'http://localhost:3000/settings',
    });
  });
});

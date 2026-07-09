'use server';

import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { stripe, STRIPE_PRICE_IDS, type BillingInterval } from '@/lib/stripe';

async function getOrCreateCustomer(userId: string, email: string, name: string | null) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { stripeCustomerId: true },
  });
  if (user?.stripeCustomerId) return user.stripeCustomerId;

  const customer = await stripe.customers.create({
    email,
    name: name ?? undefined,
    metadata: { userId },
  });
  await prisma.user.update({
    where: { id: userId },
    data: { stripeCustomerId: customer.id },
  });
  return customer.id;
}

export async function createCheckoutSessionAction(interval: BillingInterval) {
  const session = await auth();
  if (!session?.user?.id || !session.user.email) redirect('/sign-in');

  const customerId = await getOrCreateCustomer(
    session.user.id,
    session.user.email,
    session.user.name ?? null,
  );

  const checkout = await stripe.checkout.sessions.create({
    mode: 'subscription',
    customer: customerId,
    line_items: [{ price: STRIPE_PRICE_IDS[interval], quantity: 1 }],
    allow_promotion_codes: true,
    success_url: `${process.env.APP_URL}/settings?upgrade=success`,
    cancel_url: `${process.env.APP_URL}/settings?upgrade=cancelled`,
    metadata: { userId: session.user.id },
    subscription_data: {
      metadata: { userId: session.user.id },
    },
  });

  if (!checkout.url) {
    redirect('/settings?upgrade=error');
  }
  redirect(checkout.url);
}

export async function createPortalSessionAction() {
  const session = await auth();
  if (!session?.user?.id) redirect('/sign-in');

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { stripeCustomerId: true },
  });
  if (!user?.stripeCustomerId) redirect('/settings?upgrade=no_customer');

  const portal = await stripe.billingPortal.sessions.create({
    customer: user.stripeCustomerId,
    return_url: `${process.env.APP_URL}/settings`,
  });
  redirect(portal.url);
}

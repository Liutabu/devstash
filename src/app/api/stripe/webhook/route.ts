import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { stripe } from '@/lib/stripe';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  const sig = req.headers.get('stripe-signature');
  const secret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!sig || !secret) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
  }

  const rawBody = await req.text();
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, secret);
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Invalid signature';
    return NextResponse.json({ error: msg }, { status: 400 });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const cs = event.data.object as Stripe.Checkout.Session;
        const userId = cs.metadata?.userId;
        const customerId = typeof cs.customer === 'string' ? cs.customer : cs.customer?.id;
        const subscriptionId =
          typeof cs.subscription === 'string' ? cs.subscription : cs.subscription?.id;
        if (!userId || !customerId) break;
        await prisma.user.update({
          where: { id: userId },
          data: {
            isPro: true,
            stripeCustomerId: customerId,
            stripeSubscriptionId: subscriptionId ?? null,
          },
        });
        break;
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const sub = event.data.object as Stripe.Subscription;
        const customerId = typeof sub.customer === 'string' ? sub.customer : sub.customer.id;
        const userId = sub.metadata?.userId;
        const item = sub.items.data[0];
        const interval = item?.price.recurring?.interval ?? null;
        const isActive = sub.status === 'active' || sub.status === 'trialing';
        const periodEndSeconds = (item as unknown as { current_period_end?: number } | undefined)
          ?.current_period_end;

        const data = {
          isPro: isActive,
          stripeSubscriptionId: sub.id,
          subscriptionStatus: sub.status,
          subscriptionPeriodEnd: periodEndSeconds ? new Date(periodEndSeconds * 1000) : null,
          subscriptionCancelAtEnd: sub.cancel_at_period_end,
          subscriptionInterval: interval,
        };

        if (userId) {
          await prisma.user.update({ where: { id: userId }, data });
        } else {
          await prisma.user.updateMany({
            where: { stripeCustomerId: customerId },
            data,
          });
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription;
        const customerId = typeof sub.customer === 'string' ? sub.customer : sub.customer.id;
        const userId = sub.metadata?.userId;

        const data = {
          isPro: false,
          subscriptionStatus: 'canceled',
          subscriptionCancelAtEnd: false,
          stripeSubscriptionId: null,
        };

        if (userId) {
          await prisma.user.update({ where: { id: userId }, data });
        } else {
          await prisma.user.updateMany({
            where: { stripeCustomerId: customerId },
            data,
          });
        }
        break;
      }

      case 'invoice.payment_failed': {
        const inv = event.data.object as Stripe.Invoice;
        const customerId = typeof inv.customer === 'string' ? inv.customer : inv.customer?.id;
        if (!customerId) break;
        await prisma.user.updateMany({
          where: { stripeCustomerId: customerId },
          data: { subscriptionStatus: 'past_due' },
        });
        break;
      }
    }
  } catch (err) {
    console.error('[stripe webhook] handler error', err);
    return NextResponse.json({ error: 'Handler error' }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}

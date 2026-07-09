import Stripe from 'stripe';

let _stripe: Stripe | null = null;

function getStripe(): Stripe {
  if (_stripe) return _stripe;
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error('Missing STRIPE_SECRET_KEY');
  _stripe = new Stripe(key, {
    apiVersion: '2026-05-27.dahlia',
    typescript: true,
  });
  return _stripe;
}

export const stripe = new Proxy({} as Stripe, {
  get(_target, prop) {
    return Reflect.get(getStripe(), prop, getStripe());
  },
});

export const STRIPE_PRICE_IDS = {
  monthly: process.env.STRIPE_PRICE_ID_MONTHLY!,
  yearly: process.env.STRIPE_PRICE_ID_YEARLY!,
} as const;

export type BillingInterval = keyof typeof STRIPE_PRICE_IDS;

import Stripe from "stripe";
import type { Request, Response } from "express";

let stripeClient: Stripe | null = null;

/**
 * Lazily initialize the Stripe client to prevent crashes if STRIPE_SECRET_KEY is absent at startup.
 */
export function getStripe(): Stripe {
  if (!stripeClient) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) {
      throw new Error("STRIPE_SECRET_KEY environment variable is required. Please set it in your Settings.");
    }
    stripeClient = new Stripe(key, {
      appInfo: {
        name: "AlistWebs",
        version: "1.0.0",
        url: "https://alistwebs.com",
      },
    });
  }
  return stripeClient;
}

/**
 * Check if the Stripe secret key is configured.
 */
export function isStripeConfigured(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY);
}

/**
 * Subscription Plan identifiers and their environment variable mappings.
 */
export interface StripePriceConfig {
  monthly: string;
  biannual: string;
  yearly: string;
  defaultPriceId: string;
}

/**
 * Reads configured subscription price IDs from .env / process.env.
 */
export function getStripePriceIds(): StripePriceConfig {
  const monthly = process.env.STRIPE_MONTHLY_PRICE_ID || "";
  const biannual = process.env.STRIPE_BIANNUAL_PRICE_ID || "";
  const yearly = process.env.STRIPE_YEARLY_PRICE_ID || "";
  const defaultPriceId = monthly || biannual || yearly || process.env.STRIPE_PRICE_ID || "";

  return {
    monthly,
    biannual,
    yearly,
    defaultPriceId,
  };
}

/**
 * Resolves the matching Stripe Price ID from .env based on tier name or returns the explicit price ID.
 */
export function getPriceIdForTier(tier?: string): string {
  const prices = getStripePriceIds();
  const normalized = (tier || "monthly").toLowerCase().trim();

  if (normalized === "monthly" || normalized === "creator" || normalized === "starter") {
    return prices.monthly || prices.defaultPriceId;
  }
  if (normalized === "biannual" || normalized === "biannually" || normalized === "semiannual" || normalized === "pro") {
    return prices.biannual || prices.defaultPriceId;
  }
  if (normalized === "yearly" || normalized === "annual" || normalized === "annually" || normalized === "sovereign" || normalized === "enterprise") {
    return prices.yearly || prices.defaultPriceId;
  }

  // If caller already passed a Stripe price object ID (e.g. price_1Ou8...)
  if (tier && tier.startsWith("price_")) {
    return tier;
  }

  return prices.defaultPriceId;
}

export interface CreateCheckoutSessionOptions {
  tier?: "monthly" | "biannual" | "yearly" | "annual" | string;
  priceId?: string;
  customerEmail?: string;
  customerId?: string;
  successUrl?: string;
  cancelUrl?: string;
  clientReferenceId?: string;
  metadata?: Record<string, string>;
  trialDays?: number;
  domainUpsell?: {
    domain: string;
    priceUsd?: number;
  };
}

/**
 * Creates a Stripe Checkout Session for subscription billing using price IDs from .env.
 */
export async function createSubscriptionCheckoutSession(
  options: CreateCheckoutSessionOptions = {}
): Promise<Stripe.Checkout.Session> {
  const stripe = getStripe();

  // Resolve Price ID: explicit option takes priority, then lookup from .env based on tier
  const explicitOrEnvPriceId = options.priceId || getPriceIdForTier(options.tier);

  const origin = process.env.APP_URL || "http://localhost:3000";
  const successUrl =
    options.successUrl || `${origin}/dashboard?session_id={CHECKOUT_SESSION_ID}&checkout_success=true`;
  const cancelUrl = options.cancelUrl || `${origin}/#pricing`;

  const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [];

  if (explicitOrEnvPriceId) {
    lineItems.push({
      price: explicitOrEnvPriceId,
      quantity: 1,
    });
  } else {
    // Dynamic fallback when specific Stripe dashboard price IDs are not configured
    const tier = (options.tier || "monthly").toLowerCase();
    const isYearly = tier === "yearly" || tier === "annual" || tier === "annually" || tier === "sovereign";
    const isBiannual = tier === "biannual" || tier === "biannually" || tier === "semiannual";

    const amountCents = isYearly ? 39700 : isBiannual ? 23400 : 4700;
    const interval: "month" | "year" = isYearly ? "year" : "month";
    const intervalCount = isBiannual ? 6 : undefined;
    const name = isYearly
      ? "AlistWebs Annual Sovereign"
      : isBiannual
      ? "AlistWebs Bi-Annual Pro"
      : "AlistWebs Monthly Creator";

    lineItems.push({
      price_data: {
        currency: "usd",
        product_data: {
          name,
          description: `AlistWebs sovereign creator platform - ${tier} plan`,
          metadata: {
            tier,
            platform: "alistwebs",
          },
        },
        unit_amount: amountCents,
        recurring: {
          interval,
          ...(intervalCount ? { interval_count: intervalCount } : {}),
        },
      },
      quantity: 1,
    });
  }

  // Add optional Domain Registration Upsell line item
  if (options.domainUpsell?.domain) {
    const domainPriceCents = Math.round((options.domainUpsell.priceUsd || 12.0) * 100);
    lineItems.push({
      price_data: {
        currency: "usd",
        product_data: {
          name: `Custom Domain Registration: ${options.domainUpsell.domain}`,
          description: "1-year registration via Cloudflare Registrar with WHOIS privacy & automated DNSSEC",
          metadata: {
            domain: options.domainUpsell.domain,
            type: "domain_registration_upsell",
            platform: "alistwebs",
          },
        },
        unit_amount: domainPriceCents,
        recurring: {
          interval: "year",
        },
      },
      quantity: 1,
    });
  }

  // Find or create customer if email is provided
  let customerId = options.customerId;
  if (!customerId && options.customerEmail) {
    const existing = await stripe.customers.list({
      email: options.customerEmail,
      limit: 1,
    });
    if (existing.data.length > 0) {
      customerId = existing.data[0].id;
    }
  }

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    payment_method_types: ["card"],
    line_items: lineItems,
    customer: customerId,
    customer_email: customerId ? undefined : options.customerEmail,
    client_reference_id: options.clientReferenceId,
    subscription_data: {
      trial_period_days: options.trialDays,
      metadata: {
        tier: options.tier || "starter",
        priceId: explicitOrEnvPriceId || "",
        domain_upsell: options.domainUpsell?.domain || "",
        ...(options.metadata || {}),
      },
    },
    metadata: {
      tier: options.tier || "starter",
      priceId: explicitOrEnvPriceId || "",
      customerEmail: options.customerEmail || "",
      domain_upsell: options.domainUpsell?.domain || "",
      domain_upsell_price: options.domainUpsell?.priceUsd ? String(options.domainUpsell.priceUsd) : "",
      ...(options.metadata || {}),
    },
    success_url: successUrl,
    cancel_url: cancelUrl,
    allow_promotion_codes: true,
    billing_address_collection: "auto",
  });

  return session;
}

/**
 * Express route handler for initiating the subscription checkout session.
 * Reads tier / priceId and user details from the request body and initiates the checkout session.
 */
export async function createCheckoutSessionHandler(req: Request, res: Response): Promise<void> {
  try {
    if (!isStripeConfigured()) {
      res.status(400).json({
        error: "Stripe API key is not configured.",
        needsKey: true,
        message:
          "Please configure STRIPE_SECRET_KEY in your environment variables via Settings to activate live Stripe payments.",
      });
      return;
    }

    const { tier, priceId, customerEmail, successUrl, cancelUrl, domainUpsell, trialDays, metadata } = req.body || {};
    const origin = req.headers.origin || process.env.APP_URL || `http://localhost:3000`;

    const session = await createSubscriptionCheckoutSession({
      tier: tier || "starter",
      priceId: priceId?.startsWith("price_") ? priceId : undefined,
      customerEmail,
      successUrl: successUrl || `${origin}/dashboard?session_id={CHECKOUT_SESSION_ID}&checkout_success=true`,
      cancelUrl: cancelUrl || `${origin}/#pricing`,
      domainUpsell: domainUpsell?.domain
        ? {
            domain: domainUpsell.domain,
            priceUsd: domainUpsell.priceUsd ? Number(domainUpsell.priceUsd) : 12.0,
          }
        : undefined,
      trialDays: trialDays ? Number(trialDays) : undefined,
      metadata,
    });

    res.json({
      success: true,
      url: session.url,
      sessionId: session.id,
      priceId: session.metadata?.priceId || undefined,
      tier: session.metadata?.tier || tier || "starter",
    });
  } catch (err: unknown) {
    console.error("Error creating subscription checkout session:", err);
    const message = err instanceof Error ? err.message : "Failed to create checkout session";
    res.status(500).json({ success: false, error: message });
  }
}

// Default export for convenience
export default {
  getStripe,
  isStripeConfigured,
  getStripePriceIds,
  getPriceIdForTier,
  createSubscriptionCheckoutSession,
  createCheckoutSessionHandler,
};

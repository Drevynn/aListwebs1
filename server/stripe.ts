import Stripe from "stripe";
import { createRegistrarRegistration } from "./registrar";

let stripeClient: Stripe | null = null;

// Recorded checkout session events for real-time verification and polling
export interface CheckoutCompletedRecord {
  id: string;
  sessionId: string;
  customerId: string | null;
  customerEmail: string | null;
  amountTotal: number | null;
  currency: string | null;
  paymentStatus: string;
  status: string | null;
  timestamp: string;
  metadata: Record<string, string>;
  snapshot: Stripe.Checkout.Session;
}

export const recordedCompletedSessions: CheckoutCompletedRecord[] = [];

export function getStripe(): Stripe {
  if (!stripeClient) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) {
      throw new Error("STRIPE_SECRET_KEY environment variable is required. Please set it in your Settings.");
    }
    // Blueprint rule: Leave the API version argument empty when initializing the Stripe client
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

export function isStripeConfigured(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY);
}

export interface PlanConfig {
  id: string;
  name: string;
  amountCents: number;
  currency: string;
  interval: "month" | "year";
  intervalCount?: number;
  priceIdEnvVar?: string;
  description: string;
}

export const PLANS: Record<string, PlanConfig> = {
  monthly: {
    id: "monthly",
    name: "AlistWebs Monthly Creator",
    amountCents: 4700,
    currency: "usd",
    interval: "month",
    intervalCount: 1,
    priceIdEnvVar: "STRIPE_MONTHLY_PRICE_ID",
    description: "Full monthly creator suite with custom domains, lossless audio, showreels, and priority queue.",
  },
  starter: {
    id: "monthly",
    name: "AlistWebs Monthly Creator",
    amountCents: 4700,
    currency: "usd",
    interval: "month",
    intervalCount: 1,
    priceIdEnvVar: "STRIPE_MONTHLY_PRICE_ID",
    description: "Full monthly creator suite with custom domains, lossless audio, showreels, and priority queue.",
  },
  biannual: {
    id: "biannual",
    name: "AlistWebs Bi-Annual Pro",
    amountCents: 23400,
    currency: "usd",
    interval: "month",
    intervalCount: 6,
    priceIdEnvVar: "STRIPE_BIANNUAL_PRICE_ID",
    description: "Billed every 6 months. Save 17% compared to monthly. Ideal for active release cycles and production teams.",
  },
  biannually: {
    id: "biannual",
    name: "AlistWebs Bi-Annual Pro",
    amountCents: 23400,
    currency: "usd",
    interval: "month",
    intervalCount: 6,
    priceIdEnvVar: "STRIPE_BIANNUAL_PRICE_ID",
    description: "Billed every 6 months. Save 17% compared to monthly. Ideal for active release cycles and production teams.",
  },
  yearly: {
    id: "yearly",
    name: "AlistWebs Annual Sovereign",
    amountCents: 39700,
    currency: "usd",
    interval: "year",
    intervalCount: 1,
    priceIdEnvVar: "STRIPE_YEARLY_PRICE_ID",
    description: "Annual sovereign billing with 30% savings (~$33.08/mo) and guaranteed full Google Cloud infrastructure coverage.",
  },
  annual: {
    id: "yearly",
    name: "AlistWebs Annual Sovereign",
    amountCents: 39700,
    currency: "usd",
    interval: "year",
    intervalCount: 1,
    priceIdEnvVar: "STRIPE_YEARLY_PRICE_ID",
    description: "Annual sovereign billing with 30% savings (~$33.08/mo) and guaranteed full Google Cloud infrastructure coverage.",
  },
  annually: {
    id: "yearly",
    name: "AlistWebs Annual Sovereign",
    amountCents: 39700,
    currency: "usd",
    interval: "year",
    intervalCount: 1,
    priceIdEnvVar: "STRIPE_YEARLY_PRICE_ID",
    description: "Annual sovereign billing with 30% savings (~$33.08/mo) and guaranteed full Google Cloud infrastructure coverage.",
  },
};

/**
 * Creates a product with an eligible tax code in Stripe using the 2026-02-25.preview header.
 * Corresponds to blueprint: create-subscription-product-request / create-one-time-product-request
 */
export async function createProduct({
  name = "Basic subscription",
  description = "A basic subscription to our service",
  tax_code = "txcd_10103100",
  unit_amount = 1000,
  currency = "usd",
  recurring = { interval: "month" },
  metadata = {},
}: {
  name?: string;
  description?: string;
  tax_code?: string;
  unit_amount?: number;
  currency?: string;
  recurring?: { interval: "month" | "year" } | null;
  metadata?: Record<string, string>;
} = {}): Promise<Stripe.Product> {
  const stripe = getStripe();

  const defaultPriceData: Stripe.ProductCreateParams.DefaultPriceData = {
    unit_amount,
    currency,
    ...(recurring ? { recurring: { interval: recurring.interval } } : {}),
  };

  const product = await stripe.products.create(
    {
      name,
      description,
      tax_code,
      default_price_data: defaultPriceData,
      metadata: {
        ...metadata,
        blueprint: "managed_payments",
      },
    },
    {
      headers: {
        "stripe-version": "2026-02-25.preview",
      },
    }
  );

  return product;
}

/**
 * Creates a Stripe Checkout Session with managed_payments[enabled] = true
 * and headers { 'stripe-version': '2026-02-25.preview' }.
 * Corresponds to blueprint: create-checkout-session-request
 */
export async function createManagedCheckoutSession({
  priceId,
  productId,
  customerEmail,
  successUrl,
  cancelUrl,
  mode,
}: {
  priceId?: string;
  productId?: string;
  customerEmail?: string;
  successUrl: string;
  cancelUrl: string;
  mode?: "subscription" | "payment";
}): Promise<Stripe.Checkout.Session> {
  const stripe = getStripe();

  let customerId: string | undefined = undefined;
  if (customerEmail) {
    const customer = await getOrCreateCustomer(customerEmail);
    customerId = customer.id;
  }

  // Auto-detect mode if priceId provided
  let resolvedMode: "subscription" | "payment" = mode || "subscription";
  if (priceId && !mode) {
    try {
      const price = await stripe.prices.retrieve(priceId);
      resolvedMode = price.recurring ? "subscription" : "payment";
    } catch {
      resolvedMode = mode || "subscription";
    }
  }

  const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = priceId
    ? [{ price: priceId, quantity: 1 }]
    : [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: "Basic subscription",
              description: "A basic subscription to our service",
              tax_code: "txcd_10103100",
            },
            unit_amount: 1000,
            ...(resolvedMode === "subscription" ? { recurring: { interval: "month" } } : {}),
          },
          quantity: 1,
        },
      ];

  const sessionParams: Stripe.Checkout.SessionCreateParams & {
    managed_payments?: { enabled: boolean };
  } = {
    mode: resolvedMode,
    payment_method_types: ["card"],
    line_items: lineItems,
    customer: customerId,
    customer_email: customerId ? undefined : customerEmail,
    success_url: successUrl,
    cancel_url: cancelUrl,
    managed_payments: {
      enabled: true,
    },
    billing_address_collection: "auto",
    metadata: {
      productId: productId || "",
      priceId: priceId || "",
      integration: "managed_payments",
    },
  };

  const session = await stripe.checkout.sessions.create(
    sessionParams as unknown as Stripe.Checkout.SessionCreateParams,
    {
      headers: {
        "stripe-version": "2026-02-25.preview",
      },
    }
  );

  return session;
}

/**
 * Records checkout.session.completed event snapshot for monitoring
 */
export function recordCompletedSession(session: Stripe.Checkout.Session): CheckoutCompletedRecord {
  const record: CheckoutCompletedRecord = {
    id: `rec_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
    sessionId: session.id,
    customerId: typeof session.customer === "string" ? session.customer : session.customer?.id || null,
    customerEmail: session.customer_details?.email || session.customer_email || null,
    amountTotal: session.amount_total,
    currency: session.currency,
    paymentStatus: session.payment_status,
    status: session.status,
    timestamp: new Date().toISOString(),
    metadata: (session.metadata as Record<string, string>) || {},
    snapshot: session,
  };

  recordedCompletedSessions.unshift(record);
  if (recordedCompletedSessions.length > 50) {
    recordedCompletedSessions.pop();
  }

  // If a domain upsell was part of this completed checkout, trigger domain registration record
  if (session.metadata?.domain_upsell) {
    const domainName = session.metadata.domain_upsell;
    const email = session.customer_details?.email || session.customer_email || undefined;
    createRegistrarRegistration({
      domain_name: domainName,
      contact_email: email,
      stripe_session_id: session.id,
      privacy: true,
      auto_renew: true,
      years: 1,
    }).catch((err) => {
      console.warn("Failed to automatically record registrar registration upon checkout completion:", err);
    });
  }

  return record;
}

/**
 * Finds or creates a customer in Stripe by email
 */
export async function getOrCreateCustomer(email: string, name?: string): Promise<Stripe.Customer> {
  const stripe = getStripe();
  const existing = await stripe.customers.list({
    email,
    limit: 1,
  });

  if (existing.data.length > 0) {
    return existing.data[0];
  }

  return await stripe.customers.create({
    email,
    name: name || email.split("@")[0],
    metadata: {
      source: "AlistWebs AI Platform",
    },
  });
}

/**
 * Creates a Stripe Checkout Session for subscription billing with optional Domain Registration Upsell
 */
export async function createSubscriptionCheckoutSession({
  tier,
  priceId,
  customerEmail,
  successUrl,
  cancelUrl,
  domainUpsell,
}: {
  tier: string;
  priceId?: string;
  customerEmail?: string;
  successUrl: string;
  cancelUrl: string;
  domainUpsell?: {
    domain: string;
    priceUsd?: number;
  };
}): Promise<Stripe.Checkout.Session> {
  const stripe = getStripe();
  const normalizedTier = tier.toLowerCase();
  const plan = PLANS[normalizedTier] || PLANS.starter || PLANS.pro;

  let customerId: string | undefined = undefined;
  if (customerEmail) {
    const customer = await getOrCreateCustomer(customerEmail);
    customerId = customer.id;
  }

  // Check if an explicit Stripe Price ID is configured in env or provided directly
  const explicitPriceId = priceId || (plan.priceIdEnvVar ? process.env[plan.priceIdEnvVar] : undefined);

  const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [];

  if (explicitPriceId) {
    lineItems.push({
      price: explicitPriceId,
      quantity: 1,
    });
  } else {
    lineItems.push({
      price_data: {
        currency: plan.currency,
        product_data: {
          name: plan.name,
          description: plan.description,
          metadata: {
            tier: plan.id,
            platform: "alistwebs",
          },
        },
        unit_amount: plan.amountCents,
        recurring: {
          interval: plan.interval,
          ...(plan.intervalCount && plan.intervalCount > 1
            ? { interval_count: plan.intervalCount }
            : {}),
        },
      },
      quantity: 1,
    });
  }

  // Add Domain Registration Upsell line item if selected
  if (domainUpsell && domainUpsell.domain) {
    const domainPriceCents = Math.round((domainUpsell.priceUsd || 12.0) * 100);
    lineItems.push({
      price_data: {
        currency: "usd",
        product_data: {
          name: `Custom Domain Registration: ${domainUpsell.domain}`,
          description: `1-year registration via Cloudflare Registrar with WHOIS privacy & automated DNSSEC`,
          metadata: {
            domain: domainUpsell.domain,
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

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    payment_method_types: ["card"],
    line_items: lineItems,
    customer: customerId,
    customer_email: customerId ? undefined : customerEmail,
    success_url: successUrl,
    cancel_url: cancelUrl,
    allow_promotion_codes: true,
    billing_address_collection: "auto",
    subscription_data: {
      metadata: {
        tier: plan.id,
        tierName: plan.name,
        customerEmail: customerEmail || "",
        domain_upsell: domainUpsell?.domain || "",
      },
    },
    metadata: {
      tier: plan.id,
      customerEmail: customerEmail || "",
      domain_upsell: domainUpsell?.domain || "",
      domain_upsell_price: domainUpsell?.priceUsd ? String(domainUpsell.priceUsd) : "",
    },
  });

  return session;
}

/**
 * Creates a Stripe Customer Portal session for managing subscriptions, payment methods, and invoices
 */
export async function createBillingPortalSession({
  customerEmail,
  customerId,
  returnUrl,
}: {
  customerEmail?: string;
  customerId?: string;
  returnUrl: string;
}): Promise<Stripe.BillingPortal.Session> {
  const stripe = getStripe();
  let targetCustomerId = customerId;

  if (!targetCustomerId && customerEmail) {
    const customer = await getOrCreateCustomer(customerEmail);
    targetCustomerId = customer.id;
  }

  if (!targetCustomerId) {
    throw new Error("Customer identifier or email is required to access the billing portal.");
  }

  return await stripe.billingPortal.sessions.create({
    customer: targetCustomerId,
    return_url: returnUrl,
  });
}

/**
 * Retrieves invoices for a customer from Stripe
 */
export async function getCustomerInvoices({
  customerEmail,
  customerId,
  limit = 10,
}: {
  customerEmail?: string;
  customerId?: string;
  limit?: number;
}): Promise<Stripe.Invoice[]> {
  const stripe = getStripe();
  let targetCustomerId = customerId;

  if (!targetCustomerId && customerEmail) {
    const existing = await stripe.customers.list({ email: customerEmail, limit: 1 });
    if (existing.data.length > 0) {
      targetCustomerId = existing.data[0].id;
    }
  }

  if (!targetCustomerId) {
    return [];
  }

  const invoices = await stripe.invoices.list({
    customer: targetCustomerId,
    limit,
  });

  return invoices.data;
}

export interface AdminSubscriptionItem {
  id: string;
  customerId: string;
  customerEmail: string;
  customerName?: string;
  status: string;
  planId: string;
  planName: string;
  tier: string;
  interval: string;
  amountCents: number;
  currency: string;
  currentPeriodStart?: string;
  currentPeriodEnd?: string;
  cancelAtPeriodEnd: boolean;
  createdAt: string;
  domainUpsell?: string;
}

export interface AdminSubscriptionSummary {
  isConfigured: boolean;
  mrrCents: number;
  arrCents: number;
  totalSubscribers: number;
  activeSubscribers: number;
  trialingSubscribers: number;
  canceledSubscribers: number;
  tierCounts: {
    monthly: number;
    biannual: number;
    yearly: number;
    free: number;
  };
  subscriptions: AdminSubscriptionItem[];
  recentEvents: CheckoutCompletedRecord[];
}

/**
 * Aggregates live subscription data and revenue metrics for the Admin Panel
 */
export async function getAdminSubscriptionSummary(): Promise<AdminSubscriptionSummary> {
  const isConfigured = isStripeConfigured();
  const summary: AdminSubscriptionSummary = {
    isConfigured,
    mrrCents: 0,
    arrCents: 0,
    totalSubscribers: 0,
    activeSubscribers: 0,
    trialingSubscribers: 0,
    canceledSubscribers: 0,
    tierCounts: {
      monthly: 0,
      biannual: 0,
      yearly: 0,
      free: 0,
    },
    subscriptions: [],
    recentEvents: [...recordedCompletedSessions].reverse(),
  };

  if (isConfigured) {
    try {
      const stripe = getStripe();
      const list = await stripe.subscriptions.list({
        limit: 100,
        expand: ["data.customer"],
      });

      for (const sub of list.data) {
        summary.totalSubscribers++;
        const customer = typeof sub.customer === "object" && sub.customer && !("deleted" in sub.customer && sub.customer.deleted)
          ? (sub.customer as Stripe.Customer)
          : null;
        const email = customer?.email || (sub.metadata?.customer_email) || "subscriber@alistwebs.com";
        const name = customer?.name || sub.metadata?.customer_name || undefined;

        const price = sub.items.data[0]?.price;
        const amountCents = price?.unit_amount || 4700;
        const currency = price?.currency || "usd";
        const interval = price?.recurring?.interval || "month";
        const intervalCount = price?.recurring?.interval_count || 1;

        let tier = "monthly";
        let planName = "Monthly Creator";
        if (interval === "year") {
          tier = "yearly";
          planName = "Annual Sovereign";
        } else if (intervalCount === 6) {
          tier = "biannual";
          planName = "Bi-Annual Pro";
        }

        if (sub.status === "active") {
          summary.activeSubscribers++;
          if (tier === "yearly") {
            summary.tierCounts.yearly++;
            summary.mrrCents += Math.round(amountCents / 12);
          } else if (tier === "biannual") {
            summary.tierCounts.biannual++;
            summary.mrrCents += Math.round(amountCents / 6);
          } else {
            summary.tierCounts.monthly++;
            summary.mrrCents += amountCents;
          }
        } else if (sub.status === "trialing") {
          summary.trialingSubscribers++;
        } else if (sub.status === "canceled") {
          summary.canceledSubscribers++;
        }

        summary.subscriptions.push({
          id: sub.id,
          customerId: typeof sub.customer === "string" ? sub.customer : sub.customer.id,
          customerEmail: email,
          customerName: name,
          status: sub.status,
          planId: price?.id || tier,
          planName,
          tier,
          interval: intervalCount > 1 ? `${intervalCount} months` : interval,
          amountCents,
          currency,
          currentPeriodStart: new Date(sub.current_period_start * 1000).toISOString(),
          currentPeriodEnd: new Date(sub.current_period_end * 1000).toISOString(),
          cancelAtPeriodEnd: sub.cancel_at_period_end,
          createdAt: new Date(sub.created * 1000).toISOString(),
          domainUpsell: sub.metadata?.domain_registration || undefined,
        });
      }

      summary.arrCents = summary.mrrCents * 12;
      return summary;
    } catch (err) {
      console.warn("Could not query live Stripe subscriptions:", err);
    }
  }

  // If Stripe returned empty or not configured, fold in recordedCompletedSessions
  if (recordedCompletedSessions.length > 0) {
    for (const record of recordedCompletedSessions) {
      summary.totalSubscribers++;
      summary.activeSubscribers++;
      const tier = record.metadata?.tier || "monthly";
      const amount = record.amountTotal || (tier === "yearly" ? 39700 : tier === "biannual" ? 23400 : 4700);

      if (tier === "yearly") {
        summary.tierCounts.yearly++;
        summary.mrrCents += Math.round(amount / 12);
      } else if (tier === "biannual") {
        summary.tierCounts.biannual++;
        summary.mrrCents += Math.round(amount / 6);
      } else {
        summary.tierCounts.monthly++;
        summary.mrrCents += amount;
      }

      summary.subscriptions.push({
        id: record.sessionId,
        customerId: record.customerId || "cus_simulated",
        customerEmail: record.customerEmail || "creator@alistwebs.com",
        status: "active",
        planId: tier,
        planName: tier === "yearly" ? "Annual Sovereign" : tier === "biannual" ? "Bi-Annual Pro" : "Monthly Creator",
        tier,
        interval: tier === "yearly" ? "year" : tier === "biannual" ? "6 months" : "month",
        amountCents: amount,
        currency: record.currency || "usd",
        currentPeriodStart: record.timestamp,
        currentPeriodEnd: new Date(Date.now() + 30 * 86400000).toISOString(),
        cancelAtPeriodEnd: false,
        createdAt: record.timestamp,
        domainUpsell: record.domainUpsell,
      });
    }
  }

  summary.arrCents = summary.mrrCents * 12;
  return summary;
}


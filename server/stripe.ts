import Stripe from "stripe";

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
  interval: "week" | "month" | "year";
  priceIdEnvVar?: string;
  description: string;
}

export const PLANS: Record<string, PlanConfig> = {
  starter: {
    id: "starter",
    name: "AlistWebs Weekly Starter",
    amountCents: 777,
    currency: "usd",
    interval: "week",
    priceIdEnvVar: "STRIPE_STARTER_PRICE_ID",
    description: "Weekly flexible billing. Unlimited creator sites, custom domains, and AI builder.",
  },
  weekly: {
    id: "starter",
    name: "AlistWebs Weekly Starter",
    amountCents: 777,
    currency: "usd",
    interval: "week",
    priceIdEnvVar: "STRIPE_STARTER_PRICE_ID",
    description: "Weekly flexible billing. Unlimited creator sites, custom domains, and AI builder.",
  },
  monthly: {
    id: "monthly",
    name: "AlistWebs Monthly Creator",
    amountCents: 4700,
    currency: "usd",
    interval: "month",
    priceIdEnvVar: "STRIPE_MONTHLY_PRICE_ID",
    description: "Full monthly creator suite with custom domains, lossless audio, and priority queue.",
  },
  yearly: {
    id: "yearly",
    name: "AlistWebs Yearly Sovereign",
    amountCents: 39700,
    currency: "usd",
    interval: "year",
    priceIdEnvVar: "STRIPE_YEARLY_PRICE_ID",
    description: "Annual sovereign billing with ~30% savings and guaranteed full Google Cloud infrastructure coverage.",
  },
  professional: {
    id: "monthly",
    name: "AlistWebs Monthly Creator",
    amountCents: 4700,
    currency: "usd",
    interval: "month",
    priceIdEnvVar: "STRIPE_MONTHLY_PRICE_ID",
    description: "Full monthly creator suite with custom domains, lossless audio, and priority queue.",
  },
  agency: {
    id: "yearly",
    name: "AlistWebs Yearly Sovereign",
    amountCents: 39700,
    currency: "usd",
    interval: "year",
    priceIdEnvVar: "STRIPE_YEARLY_PRICE_ID",
    description: "Annual sovereign billing with ~30% savings and guaranteed full Google Cloud infrastructure coverage.",
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
 * Creates a Stripe Checkout Session for subscription billing
 */
export async function createSubscriptionCheckoutSession({
  tier,
  customerEmail,
  successUrl,
  cancelUrl,
}: {
  tier: string;
  customerEmail?: string;
  successUrl: string;
  cancelUrl: string;
}): Promise<Stripe.Checkout.Session> {
  const stripe = getStripe();
  const normalizedTier = tier.toLowerCase();
  const plan = PLANS[normalizedTier] || PLANS.starter || PLANS.pro;

  let customerId: string | undefined = undefined;
  if (customerEmail) {
    const customer = await getOrCreateCustomer(customerEmail);
    customerId = customer.id;
  }

  // Check if an explicit Stripe Price ID is configured in env
  const envPriceId = plan.priceIdEnvVar ? process.env[plan.priceIdEnvVar] : undefined;

  const lineItem: Stripe.Checkout.SessionCreateParams.LineItem = envPriceId
    ? {
        price: envPriceId,
        quantity: 1,
      }
    : {
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
          },
        },
        quantity: 1,
      };

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    payment_method_types: ["card"],
    line_items: [lineItem],
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
      },
    },
    metadata: {
      tier: plan.id,
      customerEmail: customerEmail || "",
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

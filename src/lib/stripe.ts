export interface StripeConfig {
  isConfigured: boolean;
  plans: Record<string, {
    id: string;
    name: string;
    amountCents: number;
    currency: string;
    interval: string;
    description: string;
  }>;
}

export interface StripeInvoice {
  id: string;
  number: string | null;
  amount_due: number;
  amount_paid: number;
  currency: string;
  status: string | null;
  created: number;
  hosted_invoice_url: string | null;
  invoice_pdf: string | null;
}

export async function getStripeConfig(): Promise<StripeConfig> {
  try {
    const res = await fetch("/api/stripe/config");
    if (!res.ok) throw new Error("Failed to load Stripe config");
    return await res.json();
  } catch (err) {
    console.error("Error fetching stripe config:", err);
    return { isConfigured: false, plans: {} };
  }
}

export async function startCheckoutSession(tier: string, customerEmail?: string): Promise<{ url?: string; error?: string; needsKey?: boolean }> {
  try {
    const res = await fetch("/api/stripe/create-checkout-session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tier,
        customerEmail,
        successUrl: `${window.location.origin}/dashboard?session_id={CHECKOUT_SESSION_ID}&checkout_success=true`,
        cancelUrl: `${window.location.origin}/#pricing`,
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      return {
        error: data.message || data.error || "Failed to initiate checkout",
        needsKey: data.needsKey,
      };
    }

    return { url: data.url };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Network error";
    return { error: msg };
  }
}

export async function openBillingPortal(customerEmail?: string): Promise<{ url?: string; error?: string; needsKey?: boolean }> {
  try {
    const res = await fetch("/api/stripe/create-portal-session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        customerEmail,
        returnUrl: window.location.href,
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      return {
        error: data.message || data.error || "Failed to open customer portal",
        needsKey: data.needsKey,
      };
    }

    return { url: data.url };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Network error";
    return { error: msg };
  }
}

export async function getInvoices(customerEmail?: string): Promise<StripeInvoice[]> {
  try {
    const url = customerEmail
      ? `/api/stripe/invoices?email=${encodeURIComponent(customerEmail)}`
      : `/api/stripe/invoices`;
    const res = await fetch(url);
    if (!res.ok) return [];
    const data = await res.json();
    return data.invoices || [];
  } catch (err) {
    console.error("Failed to load invoices:", err);
    return [];
  }
}

export interface ManagedProduct {
  id: string;
  name: string;
  description: string;
  tax_code: string;
  default_price: string;
  unit_amount: number;
  currency: string;
  recurring?: { interval: string } | null;
  raw?: Record<string, unknown>;
}

export interface ManagedCheckoutResponse {
  url?: string;
  sessionId?: string;
  error?: string;
  needsKey?: boolean;
}

export interface CompletedSessionEvent {
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
  snapshot?: Record<string, unknown>;
}

/**
 * Creates a digital product with eligible tax code according to blueprint
 * Path: /v1/products with stripe-version: 2026-02-25.preview
 */
export async function createStripeProduct(params: {
  name?: string;
  description?: string;
  tax_code?: string;
  unit_amount?: number;
  currency?: string;
  recurring?: { interval: "month" | "year" } | null;
  userId?: string;
}): Promise<{ success: boolean; product?: ManagedProduct; error?: string; needsKey?: boolean }> {
  try {
    const res = await fetch("/api/stripe/create-product", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: params.name || "Basic subscription",
        description: params.description || "A basic subscription to our service",
        tax_code: params.tax_code || "txcd_10103100",
        unit_amount: typeof params.unit_amount === "number" ? params.unit_amount : 1000,
        currency: params.currency || "usd",
        recurring: params.recurring !== undefined ? params.recurring : { interval: "month" },
        metadata: {
          user_id: params.userId || "",
        },
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      return {
        success: false,
        error: data.message || data.error || "Failed to create product",
        needsKey: data.needsKey,
      };
    }

    const createdProduct: ManagedProduct = {
      id: data.productId || data.product?.id,
      name: data.product?.name || params.name || "Basic subscription",
      description: data.product?.description || params.description || "A basic subscription to our service",
      tax_code: data.product?.tax_code || params.tax_code || "txcd_10103100",
      default_price: data.default_price || (typeof data.product?.default_price === "string" ? data.product.default_price : data.product?.default_price?.id) || "",
      unit_amount: params.unit_amount || 1000,
      currency: params.currency || "usd",
      recurring: params.recurring !== undefined ? params.recurring : { interval: "month" },
      raw: data.product,
    };

    return {
      success: true,
      product: createdProduct,
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Network error creating product";
    return { success: false, error: msg };
  }
}

/**
 * Creates Checkout Session with managed_payments[enabled] = true
 * using stripe-version: 2026-02-25.preview
 */
export async function createManagedCheckoutSession(params: {
  priceId?: string;
  productId?: string;
  customerEmail?: string;
  successUrl?: string;
  cancelUrl?: string;
  mode?: "subscription" | "payment";
}): Promise<ManagedCheckoutResponse> {
  try {
    const res = await fetch("/api/stripe/create-managed-checkout-session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        priceId: params.priceId,
        productId: params.productId,
        customerEmail: params.customerEmail,
        mode: params.mode,
        successUrl:
          params.successUrl ||
          `${window.location.origin}/dashboard?session_id={CHECKOUT_SESSION_ID}&checkout_success=true&managed=true`,
        cancelUrl: params.cancelUrl || `${window.location.origin}/`,
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      return {
        error: data.message || data.error || "Failed to create managed checkout session",
        needsKey: data.needsKey,
      };
    }

    return {
      url: data.url,
      sessionId: data.sessionId,
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Network error creating checkout session";
    return { error: msg };
  }
}

/**
 * Fetches recent completed checkout session events (monitoring checkout.session.completed)
 */
export async function getCompletedSessions(): Promise<CompletedSessionEvent[]> {
  try {
    const res = await fetch("/api/stripe/completed-sessions");
    if (!res.ok) return [];
    const data = await res.json();
    return data.sessions || [];
  } catch (err) {
    console.error("Error fetching completed sessions:", err);
    return [];
  }
}

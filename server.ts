import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import {
  isStripeConfigured,
  createSubscriptionCheckoutSession,
  createMailSubscriptionCheckoutSession,
  createBillingPortalSession,
  getCustomerInvoices,
  getStripe,
  PLANS,
  createProduct,
  createManagedCheckoutSession,
  recordCompletedSession,
  recordedCompletedSessions,
  getAdminSubscriptionSummary,
} from "./server/stripe";
import {
  ensureDefaultMailboxes,
  createCustomMailbox,
  sendDomainEmail,
  receiveInboundEmail,
  simulateInboundScenario,
  getDomainDnsStatus,
  generateDkimKey,
  verifyDomainDns,
  mailboxesStore,
  mailMessagesStore,
} from "./server/mail";
import { createCheckoutSessionHandler } from "./lib/stripe";
import {
  listRegistrarExtensions,
  getRegistrarExtension,
  checkDomainAvailability,
  createRegistrarRegistration,
  listRegistrarRegistrations,
  getRegistrarRegistration,
  updateRegistrarRegistration,
  getRegistrarRegistrationStatus,
  getRegistrarUpdateStatus,
} from "./server/registrar";
import { getStorageOverview } from "./server/storage";
import {
  HOLLYWOOD_GENIUS_SYSTEM_PROMPT,
  getHollywoodGeniusFallbackResponse,
} from "./server/hollywoodGenius";
import {
  DESIGN_CHAT_SYSTEM_PROMPT,
  getDesignChatFallbackResponse,
  ChatMessage,
} from "./server/designChat";

let aiClient: GoogleGenAI | null = null;
function getGenAI() {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      throw new Error("GEMINI_API_KEY is not configured in the environment variables.");
    }
    aiClient = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Configure JSON parser with raw body capture for Stripe Webhook signature verification
  interface CustomIncomingMessage extends express.Request {
    rawBody?: Buffer;
  }
  app.use(
    express.json({
      verify: (req: CustomIncomingMessage, _res, buf) => {
        req.rawBody = buf;
      },
    })
  );

  // Alist Mail - Sovereign Domain Email Endpoints
  // Legacy / simple send-mail compatibility
  app.post("/api/send-mail", async (req, res) => {
    try {
      const { subject, body, recipient, to, from, domain, userId, mailboxId } = req.body;
      const targetRecipient = (recipient || to || "").trim();
      if (!targetRecipient) {
        res.status(400).json({ error: "recipient (or to) is required" });
        return;
      }
      const targetDomain = domain || (from && from.includes("@") ? from.split("@")[1] : "alistwebs.com");
      const senderAddress = from || `contact@${targetDomain}`;
      const msg = sendDomainEmail({
        userId: userId || "user_default",
        from: senderAddress,
        to: targetRecipient,
        subject: subject || "(No Subject)",
        body: body || "",
        domain: targetDomain,
        mailboxId,
      });
      res.json({ status: "ok", message: msg });
    } catch (err: unknown) {
      console.error("Error in /api/send-mail:", err);
      const msg = err instanceof Error ? err.message : "Failed to send email";
      res.status(500).json({ error: msg });
    }
  });

  // Get user mailboxes for a domain
  app.get("/api/mail/mailboxes", async (req, res) => {
    try {
      const userId = (req.query.userId as string) || "user_default";
      const domain = ((req.query.domain as string) || "alistwebs.com").trim().toLowerCase();
      const mailboxes = ensureDefaultMailboxes(userId, domain);
      res.json({ mailboxes, domain });
    } catch (err: unknown) {
      console.error("Error getting mailboxes:", err);
      const msg = err instanceof Error ? err.message : "Failed to get mailboxes";
      res.status(500).json({ error: msg });
    }
  });

  // Create custom domain mailbox (e.g. merch@domain.com)
  app.post("/api/mail/mailboxes", async (req, res) => {
    try {
      const { userId = "user_default", domain = "alistwebs.com", prefix, displayName } = req.body;
      if (!prefix) {
        res.status(400).json({ error: "prefix is required (e.g. 'booking', 'contact', 'merch')" });
        return;
      }
      const mailbox = createCustomMailbox(userId, domain, prefix, displayName);
      res.json({ mailbox });
    } catch (err: unknown) {
      console.error("Error creating mailbox:", err);
      const msg = err instanceof Error ? err.message : "Failed to create mailbox";
      res.status(500).json({ error: msg });
    }
  });

  // Get messages for a domain or folder
  app.get("/api/mail/messages", async (req, res) => {
    try {
      const userId = (req.query.userId as string) || undefined;
      const domain = ((req.query.domain as string) || "").trim().toLowerCase();
      const folder = (req.query.folder as string) || "inbox";
      const mailboxId = (req.query.mailboxId as string) || undefined;

      // Seed default mailboxes and initial inbox if empty for this domain
      if (domain) {
        ensureDefaultMailboxes(userId || "user_default", domain);
      }

      let results = [...mailMessagesStore];
      if (domain) {
        results = results.filter((m) => m.domain.toLowerCase() === domain);
      }
      if (folder && folder !== "all") {
        if (folder === "starred") {
          results = results.filter((m) => m.isStarred);
        } else {
          results = results.filter((m) => m.folder === folder);
        }
      }
      if (mailboxId) {
        results = results.filter((m) => m.mailboxId === mailboxId);
      }

      // Sort newest first
      results.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      res.json({ messages: results });
    } catch (err: unknown) {
      console.error("Error fetching mail messages:", err);
      const msg = err instanceof Error ? err.message : "Failed to fetch messages";
      res.status(500).json({ error: msg });
    }
  });

  // Send an email from the user's custom domain
  app.post("/api/mail/send", async (req, res) => {
    try {
      const { userId = "user_default", from, to, subject, body, domain, mailboxId } = req.body;
      if (!from || !to) {
        res.status(400).json({ error: "from and to fields are required" });
        return;
      }
      const cleanDomain = domain || (from.includes("@") ? from.split("@")[1] : "alistwebs.com");
      const message = sendDomainEmail({
        userId,
        from,
        to,
        subject: subject || "(No Subject)",
        body: body || "",
        domain: cleanDomain,
        mailboxId,
      });
      res.json({ status: "sent", message });
    } catch (err: unknown) {
      console.error("Error sending domain email:", err);
      const msg = err instanceof Error ? err.message : "Failed to send email";
      res.status(500).json({ error: msg });
    }
  });

  // Inbound email receiver (webhook or external forwarder)
  app.post("/api/mail/inbound", async (req, res) => {
    try {
      const { userId = "user_default", from, fromName, to, subject, body, domain } = req.body;
      if (!from || !to) {
        res.status(400).json({ error: "from and to fields are required" });
        return;
      }
      const targetDomain = domain || (to.includes("@") ? to.split("@")[1] : "alistwebs.com");
      const message = receiveInboundEmail({
        userId,
        from,
        fromName,
        to,
        subject: subject || "(No Subject)",
        body: body || "",
        domain: targetDomain,
      });
      res.json({ status: "received", message });
    } catch (err: unknown) {
      console.error("Error receiving inbound email:", err);
      const msg = err instanceof Error ? err.message : "Failed to receive email";
      res.status(500).json({ error: msg });
    }
  });

  // Simulate incoming authentic industry email (for testing domain receiving capability)
  app.post("/api/mail/simulate-incoming", async (req, res) => {
    try {
      const { userId = "user_default", domain = "alistwebs.com", toAddress, scenario = "booking" } = req.body;
      const targetTo = toAddress || `booking@${domain}`;
      const message = simulateInboundScenario({
        userId,
        domain,
        toAddress: targetTo,
        scenario,
      });
      res.json({ status: "simulated", message });
    } catch (err: unknown) {
      console.error("Error simulating inbound email:", err);
      const msg = err instanceof Error ? err.message : "Failed to simulate email";
      res.status(500).json({ error: msg });
    }
  });

  // Check DNS, SPF, DKIM, DMARC records for custom domain email routing
  app.get("/api/mail/dns-status", async (req, res) => {
    try {
      const domain = ((req.query.domain as string) || "alistwebs.com").trim().toLowerCase();
      const dns = getDomainDnsStatus(domain);
      res.json(dns);
    } catch (err: unknown) {
      console.error("Error checking DNS status:", err);
      const msg = err instanceof Error ? err.message : "Failed to check DNS status";
      res.status(500).json({ error: msg });
    }
  });

  // Generate 2048-bit DKIM Keypair for custom domain email authentication
  app.post("/api/mail/generate-dkim", async (req, res) => {
    try {
      const domain = (req.body?.domain || req.query?.domain || "alistwebs.com").trim().toLowerCase();
      const dkim = generateDkimKey(domain);
      res.json({ success: true, dkim });
    } catch (err: unknown) {
      console.error("Error generating DKIM key:", err);
      const msg = err instanceof Error ? err.message : "Failed to generate DKIM key";
      res.status(500).json({ error: msg });
    }
  });

  // Verify domain DNS configuration & deliverability checklist
  app.all(["/api/mail/verify-domain", "/api/mail/verify"], async (req, res) => {
    try {
      const domain = (req.body?.domain || req.query?.domain || "alistwebs.com").trim().toLowerCase();
      const verification = verifyDomainDns(domain);
      res.json(verification);
    } catch (err: unknown) {
      console.error("Error verifying domain DNS:", err);
      const msg = err instanceof Error ? err.message : "Failed to verify domain DNS";
      res.status(500).json({ error: msg });
    }
  });

  // Patch message status (mark read/unread, star, move folder)
  app.patch("/api/mail/messages/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const { isRead, isStarred, folder } = req.body;
      const msg = mailMessagesStore.find((m) => m.id === id);
      if (!msg) {
        res.status(404).json({ error: "Message not found" });
        return;
      }
      if (typeof isRead === "boolean" && isRead !== msg.isRead) {
        if (msg.mailboxId) {
          const mb = mailboxesStore.find((m) => m.id === msg.mailboxId);
          if (mb) {
            mb.unreadCount = isRead ? Math.max(0, mb.unreadCount - 1) : mb.unreadCount + 1;
          }
        }
        msg.isRead = isRead;
      }
      if (typeof isStarred === "boolean") msg.isStarred = isStarred;
      if (folder && ["inbox", "sent", "drafts", "trash", "starred"].includes(folder)) {
        msg.folder = folder;
      }
      res.json({ status: "updated", message: msg });
    } catch (err: unknown) {
      console.error("Error updating message:", err);
      const msg = err instanceof Error ? err.message : "Failed to update message";
      res.status(500).json({ error: msg });
    }
  });

  // Delete message (moves to trash or removes)
  app.delete("/api/mail/messages/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const index = mailMessagesStore.findIndex((m) => m.id === id);
      if (index === -1) {
        res.status(404).json({ error: "Message not found" });
        return;
      }
      const msg = mailMessagesStore[index];
      if (msg.folder === "trash") {
        mailMessagesStore.splice(index, 1);
      } else {
        if (!msg.isRead && msg.mailboxId) {
          const mb = mailboxesStore.find((m) => m.id === msg.mailboxId);
          if (mb) mb.unreadCount = Math.max(0, mb.unreadCount - 1);
        }
        mailMessagesStore[index].folder = "trash";
      }
      res.json({ status: "deleted" });
    } catch (err: unknown) {
      console.error("Error deleting message:", err);
      const msg = err instanceof Error ? err.message : "Failed to delete message";
      res.status(500).json({ error: msg });
    }
  });

  // Storage Overview & Directory Stats API
  app.get("/api/storage/overview", async (_req, res) => {
    try {
      const data = await getStorageOverview();
      res.json(data);
    } catch (err: unknown) {
      console.error("Error generating storage overview:", err);
      const msg = err instanceof Error ? err.message : "Failed to load storage overview";
      res.status(500).json({ error: msg });
    }
  });

  // Stripe API routes
  app.get("/api/stripe/config", (_req, res) => {
    res.json({
      isConfigured: isStripeConfigured(),
      plans: PLANS,
    });
  });

  // Admin Subscriptions API - live Stripe & billing analytics (Protected)
  app.get("/api/admin/subscriptions", async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader) {
        res.status(401).json({ error: "Unauthorized: Missing administrative authorization header." });
        return;
      }
      const token = authHeader.replace(/^Bearer\s+/i, "").trim();
      let isAuthorizedAdmin = false;
      try {
        const parts = token.split(".");
        if (parts.length === 3) {
          const payload = JSON.parse(Buffer.from(parts[1], "base64").toString("utf-8"));
          const email = (payload.email || "").toLowerCase().trim();
          const emailVerified = Boolean(payload.email_verified || payload.firebase?.sign_in_provider === "google.com");
          if (["dev@alistwebs.com", "admin@alistwebs.com"].includes(email) && emailVerified) {
            isAuthorizedAdmin = true;
          }
        }
      } catch {
        isAuthorizedAdmin = false;
      }

      if (!isAuthorizedAdmin) {
        res.status(403).json({ error: "Forbidden: Administrative privileges required." });
        return;
      }

      const summary = await getAdminSubscriptionSummary();
      res.json(summary);
    } catch (err: unknown) {
      console.error("Error fetching admin subscriptions:", err);
      const msg = err instanceof Error ? err.message : "Failed to load admin subscription summary";
      res.status(500).json({ error: msg });
    }
  });

  const handleCheckoutSession = async (req: express.Request, res: express.Response) => {
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
      const { tier, priceId, customerEmail, successUrl, cancelUrl, domainUpsell, mailUpsell } = req.body;
      const origin = req.headers.origin || `http://localhost:${PORT}`;
      const session = await createSubscriptionCheckoutSession({
        tier: tier || priceId || "starter",
        priceId: priceId?.startsWith("price_") ? priceId : undefined,
        customerEmail,
        successUrl: successUrl || `${origin}/dashboard?session_id={CHECKOUT_SESSION_ID}&checkout_success=true`,
        cancelUrl: cancelUrl || `${origin}/#pricing`,
        domainUpsell: domainUpsell && domainUpsell.domain ? {
          domain: domainUpsell.domain,
          priceUsd: domainUpsell.priceUsd ? Number(domainUpsell.priceUsd) : 12.0,
        } : undefined,
        mailUpsell: mailUpsell && mailUpsell.enabled ? {
          enabled: true,
          domain: mailUpsell.domain,
          priceUsd: mailUpsell.priceUsd ? Number(mailUpsell.priceUsd) : undefined,
        } : undefined,
      });
      res.json({ url: session.url, sessionId: session.id });
    } catch (err: unknown) {
      console.error("Error creating checkout session:", err);
      const msg = err instanceof Error ? err.message : "Failed to create checkout session";
      res.status(500).json({ error: msg });
    }
  };

  // Dedicated Alist Mail Upsell checkout route
  app.post("/api/stripe/create-mail-upsell-session", async (req, res) => {
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
      const { customerEmail, domain, interval = "month", successUrl, cancelUrl } = req.body;
      const origin = req.headers.origin || `http://localhost:${PORT}`;
      const session = await createMailSubscriptionCheckoutSession({
        customerEmail,
        domain: domain || "alistwebs.com",
        interval: interval === "year" ? "year" : "month",
        successUrl: successUrl || `${origin}/mail?checkout_success=true&domain=${encodeURIComponent(domain || "alistwebs.com")}`,
        cancelUrl: cancelUrl || `${origin}/mail`,
      });
      res.json({ url: session.url, sessionId: session.id });
    } catch (err: unknown) {
      console.error("Error creating mail upsell checkout session:", err);
      const msg = err instanceof Error ? err.message : "Failed to create mail upsell session";
      res.status(500).json({ error: msg });
    }
  });

  app.post("/api/stripe/create-checkout-session", handleCheckoutSession);
  app.post("/api/create-checkout-session", handleCheckoutSession);
  app.post("/api/stripe/checkout-session", createCheckoutSessionHandler);

  app.post("/api/stripe/create-portal-session", async (req, res) => {
    try {
      if (!isStripeConfigured()) {
        res.status(400).json({
          error: "Stripe API key is not configured.",
          needsKey: true,
          message: "Please configure STRIPE_SECRET_KEY in your environment variables via Settings.",
        });
        return;
      }
      const { customerEmail, customerId, returnUrl } = req.body;
      const origin = req.headers.origin || `http://localhost:${PORT}`;
      const portal = await createBillingPortalSession({
        customerEmail,
        customerId,
        returnUrl: returnUrl || `${origin}/dashboard`,
      });
      res.json({ url: portal.url });
    } catch (err: unknown) {
      console.error("Error creating customer portal session:", err);
      const msg = err instanceof Error ? err.message : "Failed to create customer portal session";
      res.status(500).json({ error: msg });
    }
  });

  app.get("/api/stripe/invoices", async (req, res) => {
    try {
      if (!isStripeConfigured()) {
        res.json({ invoices: [], isConfigured: false });
        return;
      }
      const customerEmail = req.query.email as string | undefined;
      const customerId = req.query.customerId as string | undefined;
      const invoices = await getCustomerInvoices({ customerEmail, customerId });
      res.json({ invoices, isConfigured: true });
    } catch (err: unknown) {
      console.error("Error fetching invoices:", err);
      const msg = err instanceof Error ? err.message : "Failed to retrieve invoices";
      res.status(500).json({ error: msg });
    }
  });

  // Blueprint Step 1: Create Product with eligible tax code
  app.post("/api/stripe/create-product", async (req, res) => {
    try {
      if (!isStripeConfigured()) {
        res.status(400).json({
          error: "Stripe is not configured",
          needsKey: true,
          message: "Please configure STRIPE_SECRET_KEY in Settings to enable product creation.",
        });
        return;
      }

      const { name, description, tax_code, unit_amount, currency, recurring, metadata } = req.body;
      const product = await createProduct({
        name: name || "Basic subscription",
        description: description || "A basic subscription to our service",
        tax_code: tax_code || "txcd_10103100",
        unit_amount: typeof unit_amount === "number" ? unit_amount : 1000,
        currency: currency || "usd",
        recurring: recurring !== undefined ? recurring : { interval: "month" },
        metadata: metadata || {},
      });

      res.json({
        success: true,
        product,
        default_price: product.default_price,
        productId: product.id,
      });
    } catch (err: unknown) {
      console.error("Error creating product:", err);
      const msg = err instanceof Error ? err.message : "Failed to create product";
      res.status(500).json({ error: msg });
    }
  });

  // Blueprint Step 2: Create Checkout Session with managed_payments[enabled] = true
  app.post("/api/stripe/create-managed-checkout-session", async (req, res) => {
    try {
      if (!isStripeConfigured()) {
        res.status(400).json({
          error: "Stripe is not configured",
          needsKey: true,
          message: "Please configure STRIPE_SECRET_KEY in Settings to generate a Managed Payments Checkout Session.",
        });
        return;
      }

      const { priceId, productId, customerEmail, successUrl, cancelUrl, mode } = req.body;
      const origin = req.headers.origin || `http://localhost:${PORT}`;

      const session = await createManagedCheckoutSession({
        priceId,
        productId,
        customerEmail,
        successUrl: successUrl || `${origin}/dashboard?session_id={CHECKOUT_SESSION_ID}&checkout_success=true`,
        cancelUrl: cancelUrl || `${origin}/#pricing`,
        mode,
      });

      res.json({
        success: true,
        url: session.url,
        sessionId: session.id,
        session,
      });
    } catch (err: unknown) {
      console.error("Error creating managed checkout session:", err);
      const msg = err instanceof Error ? err.message : "Failed to create managed checkout session";
      res.status(500).json({ error: msg });
    }
  });

  // Polling / Inspection endpoint for completed checkout sessions (Blueprint Step 4 verification)
  app.get("/api/stripe/completed-sessions", (_req, res) => {
    res.json({
      sessions: recordedCompletedSessions,
    });
  });

  app.post("/api/stripe/webhook", async (req: CustomIncomingMessage, res) => {
    const sig = req.headers["stripe-signature"] as string | undefined;
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!isStripeConfigured()) {
      res.status(400).json({ error: "Stripe is not configured" });
      return;
    }

    try {
      const stripe = getStripe();
      let event;
      if (webhookSecret && sig && req.rawBody) {
        event = stripe.webhooks.constructEvent(req.rawBody, sig, webhookSecret);
      } else {
        event = req.body;
      }

      console.log(`[Stripe Webhook] Received event: ${event.type}`);

      switch (event.type) {
        case "checkout.session.completed": {
          const session = event.data.object;
          console.log(`[Stripe Webhook] Checkout session completed for customer: ${session.customer || session.customer_email}`);
          recordCompletedSession(session);
          break;
        }
        case "invoice.payment_succeeded": {
          const invoice = event.data.object;
          console.log(`[Stripe Webhook] Invoice payment succeeded: ${invoice.id}`);
          break;
        }
        case "customer.subscription.deleted": {
          const subscription = event.data.object;
          console.log(`[Stripe Webhook] Subscription canceled: ${subscription.id}`);
          break;
        }
        default:
          break;
      }

      res.json({ received: true });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Webhook verification failed";
      console.error("[Stripe Webhook Error]:", msg);
      res.status(400).send(`Webhook Error: ${msg}`);
    }
  });

  // ==========================================
  // Cloudflare Registrar API Endpoints
  // ==========================================

  // Extension List & Details
  const handleListExtensions = async (req: express.Request, res: express.Response) => {
    try {
      const accountId = req.params.account_id;
      const data = await listRegistrarExtensions(accountId);
      res.json(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to list extensions";
      res.status(500).json({ success: false, error: msg });
    }
  };

  const handleGetExtension = async (req: express.Request, res: express.Response) => {
    try {
      const accountId = req.params.account_id;
      const ext = req.params.extension;
      const data = await getRegistrarExtension(ext, accountId);
      res.json(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to get extension";
      res.status(500).json({ success: false, error: msg });
    }
  };

  app.get("/api/registrar/extensions", handleListExtensions);
  app.get("/api/accounts/:account_id/registrar/extensions", handleListExtensions);

  app.get("/api/registrar/extensions/:extension", handleGetExtension);
  app.get("/api/accounts/:account_id/registrar/extensions/:extension", handleGetExtension);

  // Live Domain Search & Upsell Pricing
  app.get("/api/registrar/search", async (req, res) => {
    try {
      const domainQuery = (req.query.domain as string) || "";
      if (!domainQuery) {
        res.status(400).json({ error: "domain query parameter is required" });
        return;
      }
      const data = await checkDomainAvailability(domainQuery);
      res.json({ success: true, ...data });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Domain search failed";
      res.status(500).json({ success: false, error: msg });
    }
  });

  // Registrations: List & Create
  const handleListRegistrations = async (req: express.Request, res: express.Response) => {
    try {
      const accountId = req.params.account_id;
      const data = await listRegistrarRegistrations(accountId);
      res.json(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to list registrations";
      res.status(500).json({ success: false, error: msg });
    }
  };

  const handleCreateRegistration = async (req: express.Request, res: express.Response) => {
    try {
      const accountId = req.params.account_id;
      const { domain_name, years, privacy, auto_renew, contact_email, stripe_session_id } = req.body;
      if (!domain_name) {
        res.status(400).json({ success: false, error: "domain_name is required" });
        return;
      }
      const result = await createRegistrarRegistration({
        domain_name,
        years,
        privacy,
        auto_renew,
        contact_email,
        stripe_session_id,
        accountIdOverride: accountId,
      });
      res.json(result);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to create registration";
      res.status(500).json({ success: false, error: msg });
    }
  };

  app.get("/api/registrar/registrations", handleListRegistrations);
  app.get("/api/accounts/:account_id/registrar/registrations", handleListRegistrations);

  app.post("/api/registrar/registrations", handleCreateRegistration);
  app.post("/api/accounts/:account_id/registrar/registrations", handleCreateRegistration);

  // Single Registration: Get & Update (PATCH)
  const handleGetRegistration = async (req: express.Request, res: express.Response) => {
    try {
      const accountId = req.params.account_id;
      const domainName = req.params.domain_name || req.params.domain;
      const result = await getRegistrarRegistration(domainName, accountId);
      res.json(result);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to get registration";
      res.status(500).json({ success: false, error: msg });
    }
  };

  const handleUpdateRegistration = async (req: express.Request, res: express.Response) => {
    try {
      const accountId = req.params.account_id;
      const domainName = req.params.domain_name || req.params.domain;
      const result = await updateRegistrarRegistration(domainName, req.body, accountId);
      res.json(result);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to update registration";
      res.status(500).json({ success: false, error: msg });
    }
  };

  app.get("/api/registrar/registrations/:domain_name", handleGetRegistration);
  app.get("/api/accounts/:account_id/registrar/registrations/:domain_name", handleGetRegistration);

  app.patch("/api/registrar/registrations/:domain_name", handleUpdateRegistration);
  app.patch("/api/accounts/:account_id/registrar/registrations/:domain_name", handleUpdateRegistration);

  // Registration Status & Update Status
  const handleGetRegistrationStatus = async (req: express.Request, res: express.Response) => {
    try {
      const accountId = req.params.account_id;
      const domainName = req.params.domain_name || req.params.domain;
      const result = await getRegistrarRegistrationStatus(domainName, accountId);
      res.json(result);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to get registration status";
      res.status(500).json({ success: false, error: msg });
    }
  };

  const handleGetUpdateStatus = async (req: express.Request, res: express.Response) => {
    try {
      const accountId = req.params.account_id;
      const domainName = req.params.domain_name || req.params.domain;
      const result = await getRegistrarUpdateStatus(domainName, accountId);
      res.json(result);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to get update status";
      res.status(500).json({ success: false, error: msg });
    }
  };

  app.get("/api/registrar/registrations/:domain_name/registration-status", handleGetRegistrationStatus);
  app.get("/api/accounts/:account_id/registrar/registrations/:domain_name/registration-status", handleGetRegistrationStatus);

  app.get("/api/registrar/registrations/:domain_name/update-status", handleGetUpdateStatus);
  app.get("/api/accounts/:account_id/registrar/registrations/:domain_name/update-status", handleGetUpdateStatus);

  // API route for streaming design chat
  app.post("/api/design-chat", async (req, res) => {
    // Set headers for SSE streaming immediately
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    try {
      const { messages } = req.body || {};
      const rawMessages = Array.isArray(messages) ? messages : [];

      const validMessages = rawMessages.filter(
        (m: unknown): m is ChatMessage =>
          Boolean(m && typeof m === "object" && typeof (m as ChatMessage).content === "string" && (m as ChatMessage).content.trim().length > 0)
      );

      let contents = validMessages.map((m: ChatMessage) => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.content.trim() }],
      }));

      // If no valid messages were provided (e.g. client initiating conversation), provide an initial trigger prompt for Gemini
      if (contents.length === 0) {
        contents = [
          {
            role: "user",
            parts: [
              {
                text: "Hello! I am ready to design my website. Please introduce yourself as the A List Webs Consultant, welcome me warmly, and ask your first question to begin designing my band/artist website.",
              },
            ],
          },
        ];
      }

      if (process.env.GEMINI_API_KEY) {
        try {
          const ai = getGenAI();
          const responseStream = await ai.models.generateContentStream({
            model: "gemini-3.8-flash",
            contents: contents,
            config: {
              systemInstruction: DESIGN_CHAT_SYSTEM_PROMPT,
            },
          });

          for await (const chunk of responseStream) {
            const text = chunk.text;
            if (text) {
              const payload = {
                choices: [
                  {
                    delta: {
                      content: text,
                    },
                  },
                ],
              };
              res.write(`data: ${JSON.stringify(payload)}\n\n`);
            }
          }

          res.write("data: [DONE]\n\n");
          res.end();
          return;
        } catch (geminiError) {
          console.warn("Gemini design-chat stream encountered an issue, transitioning to design consultant logic:", geminiError);
        }
      }

      // Stream fallback response
      const fallbackText = getDesignChatFallbackResponse(validMessages);
      const words = fallbackText.split(" ");
      let i = 0;
      const interval = setInterval(() => {
        if (i < words.length) {
          const chunk = (i === 0 ? "" : " ") + words.slice(i, i + 5).join(" ");
          i += 5;
          const payload = {
            choices: [
              {
                delta: {
                  content: chunk,
                },
              },
            ],
          };
          res.write(`data: ${JSON.stringify(payload)}\n\n`);
        } else {
          clearInterval(interval);
          res.write("data: [DONE]\n\n");
          res.end();
        }
      }, 35);
    } catch (error: unknown) {
      console.error("Error in design-chat stream:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to generate response";
      res.write(`data: ${JSON.stringify({ choices: [{ delta: { content: `\n\n*(Notice: ${errorMessage})*` } }] })}\n\n`);
      res.write("data: [DONE]\n\n");
      res.end();
    }
  });

  // API route for Hollywood Genius AI Assistant (Film Crews, Casting, Production Intelligence)
  app.post("/api/hollywood-genius", async (req, res) => {
    // Set headers for SSE streaming
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    const { messages } = req.body || {};
    const rawMessages = Array.isArray(messages) ? messages : [];

    const validMessages = rawMessages.filter(
      (m: unknown): m is ChatMessage =>
        Boolean(m && typeof m === "object" && typeof (m as ChatMessage).content === "string" && (m as ChatMessage).content.trim().length > 0)
    );

    const lastUserMessage = [...validMessages].reverse().find((m: ChatMessage) => m.role === "user")?.content || "";

    // Check if GEMINI_API_KEY is available
    if (process.env.GEMINI_API_KEY) {
      try {
        const ai = getGenAI();
        let contents = validMessages.map((m: ChatMessage) => ({
          role: m.role === "assistant" ? "model" : "user",
          parts: [{ text: m.content.trim() }],
        }));

        if (contents.length === 0) {
          contents = [
            {
              role: "user",
              parts: [{ text: "Hello! Tell me about Hollywood film production crews and casting." }],
            },
          ];
        }

        const responseStream = await ai.models.generateContentStream({
          model: "gemini-3.8-flash",
          contents: contents,
          config: {
            systemInstruction: HOLLYWOOD_GENIUS_SYSTEM_PROMPT,
          },
        });

        for await (const chunk of responseStream) {
          const text = chunk.text;
          if (text) {
            const payload = {
              choices: [
                {
                  delta: {
                    content: text,
                  },
                },
              ],
            };
            res.write(`data: ${JSON.stringify(payload)}\n\n`);
          }
        }

        res.write("data: [DONE]\n\n");
        res.end();
        return;
      } catch (err) {
        console.warn("Hollywood Genius live Gemini stream failed, using knowledge fallback:", err);
      }
    }

    // High-fidelity fallback streaming
    const fallbackText = getHollywoodGeniusFallbackResponse(lastUserMessage);
    // Split into natural word chunks to simulate smooth AI typing
    const words = fallbackText.split(" ");
    let i = 0;
    const interval = setInterval(() => {
      if (i < words.length) {
        const chunk = (i === 0 ? "" : " ") + words.slice(i, i + 5).join(" ");
        i += 5;
        const payload = {
          choices: [
            {
              delta: {
                content: chunk,
              },
            },
          ],
        };
        res.write(`data: ${JSON.stringify(payload)}\n\n`);
      } else {
        clearInterval(interval);
        res.write("data: [DONE]\n\n");
        res.end();
      }
    }, 40);
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*all', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();

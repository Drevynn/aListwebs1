import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import {
  isStripeConfigured,
  createSubscriptionCheckoutSession,
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

const SYSTEM_PROMPT = `You are the A List Webs design consultant — a friendly, knowledgeable AI that helps musicians and bands create their perfect website. You are part of the Creative Sovereignty ecosystem, working alongside the BandAide (bandaids.xyz) management platform.

STRICT RULES:
1. Your partner platform is bandaids.xyz. Use this for all management references.
2. NEVER mention .app domains. 
3. Your name is the "A List Webs Consultant".
4. Your job is to have a natural conversation to gather everything needed to design their site. Ask ONE question at a time.
5. When you have enough info, present a **Design Blueprint**. 
6. After the blueprint, tell the user: "I've handed this blueprint to our production team. Click the 'Let's build my site!' button below to save this to your A List Webs dashboard and start the generation process."
7. IMPORTANT: You MUST include the exact phrase "Let's go!" somewhere in your message when presenting the final blueprint so that the "Let's build my site!" action button becomes active and visible.

## Information to gather:
- Band name, style, and bio.
- Visual vibe (colors, textures, mood).
- Features (Spotify/SoundCloud players, Gig calendar, Merch store).

## Tone:
- Enthusiastic, professional, and cinematic.
- Use music and filmmaking terminology where appropriate.`;

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

  // API routes
  app.post("/api/send-mail", async (req, res) => {
    // For now, just log and return ok
    const { subject, body, recipient } = req.body;
    console.log(`Sending email to ${recipient}: ${subject}`);
    res.json({ status: "ok" });
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

  // Admin Subscriptions API - live Stripe & billing analytics
  app.get("/api/admin/subscriptions", async (_req, res) => {
    try {
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
      const { tier, priceId, customerEmail, successUrl, cancelUrl, domainUpsell } = req.body;
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
      });
      res.json({ url: session.url, sessionId: session.id });
    } catch (err: unknown) {
      console.error("Error creating checkout session:", err);
      const msg = err instanceof Error ? err.message : "Failed to create checkout session";
      res.status(500).json({ error: msg });
    }
  };

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
    try {
      const { messages } = req.body;
      if (!messages || !Array.isArray(messages)) {
        res.status(400).json({ error: "messages array is required" });
        return;
      }

      interface ChatMessage {
        role: string;
        content: string;
      }

      const ai = getGenAI();
      const contents = messages.map((m: ChatMessage) => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.content }],
      }));

      // Set headers for SSE streaming
      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Connection", "keep-alive");

      const responseStream = await ai.models.generateContentStream({
        model: "gemini-3.8-flash",
        contents: contents,
        config: {
          systemInstruction: SYSTEM_PROMPT,
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
    } catch (error: unknown) {
      console.error("Error in design-chat stream:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to generate response";
      if (!res.headersSent) {
        res.status(500).json({ error: errorMessage });
      } else {
        res.write(`data: {"error": "${errorMessage}"}\n\n`);
        res.write("data: [DONE]\n\n");
        res.end();
      }
    }
  });

  // API route for Hollywood Genius AI Assistant (Film Crews, Casting, Production Intelligence)
  app.post("/api/hollywood-genius", async (req, res) => {
    // Set headers for SSE streaming
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    const { messages } = req.body;
    if (!messages || !Array.isArray(messages)) {
      res.write(`data: ${JSON.stringify({ choices: [{ delta: { content: "Error: messages array is required" } }] })}\n\n`);
      res.write("data: [DONE]\n\n");
      res.end();
      return;
    }

    interface ChatMessage {
      role: string;
      content: string;
    }

    const lastUserMessage = [...messages].reverse().find((m: ChatMessage) => m.role === "user")?.content || "";

    // Check if GEMINI_API_KEY is available
    if (process.env.GEMINI_API_KEY) {
      try {
        const ai = getGenAI();
        const contents = messages.map((m: ChatMessage) => ({
          role: m.role === "assistant" ? "model" : "user",
          parts: [{ text: m.content }],
        }));

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

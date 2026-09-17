import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Sparkles,
  ShoppingBag,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  RefreshCw,
  CreditCard,
  Building2,
  FileText,
  Clock,
  ArrowRight,
} from "lucide-react";
import {
  createStripeProduct,
  createManagedCheckoutSession,
  getCompletedSessions,
  ManagedProduct,
  CompletedSessionEvent,
  getStripeConfig,
} from "@/lib/stripe";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { db } from "@/lib/firebase";
import { collection, addDoc } from "firebase/firestore";

interface ManagedPaymentsTesterProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function ManagedPaymentsTester({
  open,
  onOpenChange,
}: ManagedPaymentsTesterProps) {
  const { user } = useAuth();
  const [isConfigured, setIsConfigured] = useState<boolean>(true);

  // Step 1: Product state
  const [productName, setProductName] = useState("Basic subscription");
  const [productDesc, setProductDesc] = useState("A basic subscription to our service");
  const [taxCode, setTaxCode] = useState("txcd_10103100");
  const [unitAmount, setUnitAmount] = useState(1000); // $10.00
  const [isRecurring, setIsRecurring] = useState(true);
  const [createdProduct, setCreatedProduct] = useState<ManagedProduct | null>(null);
  const [creatingProduct, setCreatingProduct] = useState(false);

  // Step 2: Checkout Session state
  const [customerEmail, setCustomerEmail] = useState(user?.email || "customer@example.com");
  const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [creatingSession, setCreatingSession] = useState(false);

  // Step 4: Webhook events
  const [completedEvents, setCompletedEvents] = useState<CompletedSessionEvent[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(false);
  const [copiedText, setCopiedText] = useState<string | null>(null);

  useEffect(() => {
    if (user?.email && customerEmail === "customer@example.com") {
      setCustomerEmail(user.email);
    }
  }, [user, customerEmail]);

  useEffect(() => {
    if (open) {
      checkStripe();
      fetchEvents();
      const interval = setInterval(fetchEvents, 3000);
      return () => clearInterval(interval);
    }
  }, [open]);

  const checkStripe = async () => {
    const config = await getStripeConfig();
    setIsConfigured(config.isConfigured);
  };

  const fetchEvents = async () => {
    setLoadingEvents(true);
    try {
      const events = await getCompletedSessions();
      setCompletedEvents(events);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingEvents(false);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    toast.success(`Copied ${label} to clipboard`);
    setTimeout(() => setCopiedText(null), 2000);
  };

  // Step 1: Create Product
  const handleCreateProduct = async () => {
    setCreatingProduct(true);
    try {
      const res = await createStripeProduct({
        name: productName,
        description: productDesc,
        tax_code: taxCode,
        unit_amount: unitAmount,
        currency: "usd",
        recurring: isRecurring ? { interval: "month" } : null,
        userId: user?.uid,
      });

      if (!res.success || !res.product) {
        if (res.needsKey) {
          toast.error(res.error || "Please configure STRIPE_SECRET_KEY in Settings");
        } else {
          toast.error(res.error || "Failed to create product");
        }
        return;
      }

      setCreatedProduct(res.product);
      toast.success(`Product "${res.product.name}" created successfully with eligible tax code!`);

      // Persist in datastore if signed in
      if (user?.uid) {
        try {
          await addDoc(collection(db, "products"), {
            stripeProductId: res.product.id,
            name: res.product.name,
            description: res.product.description,
            tax_code: res.product.tax_code,
            priceId: res.product.default_price,
            unit_amount: res.product.unit_amount,
            currency: res.product.currency,
            recurring: isRecurring ? "month" : null,
            user_id: user.uid,
            createdAt: new Date().toISOString(),
          });
        } catch (dbErr) {
          console.warn("Could not write product to Firestore:", dbErr);
        }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error creating product";
      toast.error(msg);
    } finally {
      setCreatingProduct(false);
    }
  };

  // Step 2: Create Managed Checkout Session
  const handleCreateSession = async () => {
    if (!createdProduct?.default_price && !createdProduct?.id) {
      toast.error("Please create or select a product first in Step 1.");
      return;
    }

    setCreatingSession(true);
    try {
      const res = await createManagedCheckoutSession({
        priceId: createdProduct.default_price,
        productId: createdProduct.id,
        customerEmail: customerEmail || undefined,
        mode: isRecurring ? "subscription" : "payment",
        successUrl: `${window.location.origin}/dashboard?session_id={CHECKOUT_SESSION_ID}&checkout_success=true&managed=true`,
        cancelUrl: `${window.location.origin}/`,
      });

      if (res.error || !res.url) {
        if (res.needsKey) {
          toast.error(res.error || "Please configure STRIPE_SECRET_KEY in Settings");
        } else {
          toast.error(res.error || "Failed to generate checkout session");
        }
        return;
      }

      setCheckoutUrl(res.url);
      setSessionId(res.sessionId || null);
      toast.success("Managed Payments Checkout Session created successfully!");

      // Persist in datastore if signed in
      if (user?.uid && res.sessionId) {
        try {
          await addDoc(collection(db, "orders"), {
            stripeSessionId: res.sessionId,
            customerEmail: customerEmail || "",
            amount: unitAmount,
            currency: "usd",
            status: "open",
            paymentStatus: "unpaid",
            productId: createdProduct.id,
            user_id: user.uid,
            createdAt: new Date().toISOString(),
          });
        } catch (dbErr) {
          console.warn("Could not write order to Firestore:", dbErr);
        }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error creating checkout session";
      toast.error(msg);
    } finally {
      setCreatingSession(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto bg-[#141517] border-white/10 text-white p-6 sm:p-8">
        <DialogHeader className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <Badge className="bg-gold/20 text-gold border-gold/40 text-xs px-2.5 py-0.5 font-medium">
              Stripe Managed Payments
            </Badge>
            <Badge variant="outline" className="border-white/10 text-white/60 text-xs">
              Version: 2026-02-25.preview
            </Badge>
          </div>
          <DialogTitle className="text-2xl font-bold font-serif text-white tracking-tight flex items-center gap-2">
            <ShoppingBag className="w-6 h-6 text-gold" />
            Set up & Test Managed Payments
          </DialogTitle>
          <DialogDescription className="text-white/60 text-sm">
            Complete the 4-step sequence to create an eligible tax-coded product, generate a Managed Payments
            Checkout Session, complete a test payment with tax calculation, and monitor webhooks.
          </DialogDescription>
        </DialogHeader>

        {!isConfigured && (
          <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-200 text-sm mb-6 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-amber-300">Stripe API key required</p>
              <p className="text-xs text-amber-200/80 mt-1">
                Add your <code className="bg-black/30 px-1 py-0.5 rounded text-amber-100">STRIPE_SECRET_KEY</code> to
                Settings to execute live API calls against Stripe.
              </p>
            </div>
          </div>
        )}

        <div className="space-y-6">
          {/* STEP 1: Create Product */}
          <div className="p-5 rounded-xl bg-white/[0.03] border border-white/10 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="w-6 h-6 rounded-full bg-gold/20 text-gold text-xs font-bold flex items-center justify-center border border-gold/40">
                  1
                </span>
                <h3 className="font-semibold text-white text-base">Create a Product with Eligible Tax Code</h3>
              </div>
              {createdProduct && (
                <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/40 text-xs">
                  <CheckCircle2 className="w-3 h-3 mr-1 inline" /> Product Created
                </Badge>
              )}
            </div>
            <p className="text-xs text-white/60">
              Create a digital subscription or one-time product with an eligible tax code (<code className="text-gold">txcd_10103100</code>)
              using the <code className="text-white/80">2026-02-25.preview</code> version header.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <div>
                <label className="text-xs text-white/60 block mb-1">Product Name</label>
                <Input
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  className="bg-black/40 border-white/10 text-white text-sm"
                  placeholder="Basic subscription"
                />
              </div>
              <div>
                <label className="text-xs text-white/60 block mb-1">Tax Code (eligible digital code)</label>
                <Input
                  value={taxCode}
                  onChange={(e) => setTaxCode(e.target.value)}
                  className="bg-black/40 border-white/10 text-white text-sm"
                  placeholder="txcd_10103100"
                />
              </div>
              <div>
                <label className="text-xs text-white/60 block mb-1">Description</label>
                <Input
                  value={productDesc}
                  onChange={(e) => setProductDesc(e.target.value)}
                  className="bg-black/40 border-white/10 text-white text-sm"
                  placeholder="A basic subscription to our service"
                />
              </div>
              <div>
                <label className="text-xs text-white/60 block mb-1">Billing Interval / Model</label>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant={isRecurring ? "default" : "outline"}
                    onClick={() => setIsRecurring(true)}
                    className={`text-xs h-9 flex-1 ${isRecurring ? "bg-gold text-black font-semibold" : "border-white/10 text-white/70"}`}
                  >
                    Monthly Subscription
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant={!isRecurring ? "default" : "outline"}
                    onClick={() => setIsRecurring(false)}
                    className={`text-xs h-9 flex-1 ${!isRecurring ? "bg-gold text-black font-semibold" : "border-white/10 text-white/70"}`}
                  >
                    One-Time Payment
                  </Button>
                </div>
              </div>
              <div className="sm:col-span-2">
                <label className="text-xs text-white/60 block mb-1">Price (USD)</label>
                <div className="flex items-center gap-2 max-w-xs">
                  <Input
                    type="number"
                    value={unitAmount / 100}
                    onChange={(e) => setUnitAmount(Math.round(parseFloat(e.target.value || "0") * 100))}
                    className="bg-black/40 border-white/10 text-white text-sm"
                    placeholder="10.00"
                  />
                  <span className="text-xs text-white/60 whitespace-nowrap font-mono">
                    USD (${(unitAmount / 100).toFixed(2)} {isRecurring ? "/ month" : "one-time"})
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCreateProduct}
                disabled={creatingProduct}
                className="bg-gold/10 hover:bg-gold/20 text-gold border-gold/30 text-xs gap-2"
              >
                {creatingProduct ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Creating Product...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" /> Create Product (/v1/products)
                  </>
                )}
              </Button>

              {createdProduct && (
                <div className="flex items-center gap-2 text-xs text-white/70">
                  <span>Price ID:</span>
                  <code className="bg-black/50 px-2 py-0.5 rounded border border-white/10 font-mono text-[11px] text-gold">
                    {createdProduct.default_price || "Generated"}
                  </code>
                </div>
              )}
            </div>

            {createdProduct && (
              <div className="p-3 rounded-lg bg-black/40 border border-white/10 text-xs font-mono text-white/80 space-y-1">
                <div>
                  <span className="text-white/40">Product ID:</span> {createdProduct.id}
                </div>
                <div>
                  <span className="text-white/40">Default Price:</span> {createdProduct.default_price}
                </div>
                <div>
                  <span className="text-white/40">Tax Code:</span> {createdProduct.tax_code}
                </div>
              </div>
            )}
          </div>

          {/* STEP 2: Create Checkout Session */}
          <div className="p-5 rounded-xl bg-white/[0.03] border border-white/10 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="w-6 h-6 rounded-full bg-gold/20 text-gold text-xs font-bold flex items-center justify-center border border-gold/40">
                  2
                </span>
                <h3 className="font-semibold text-white text-base">Create Checkout Session</h3>
              </div>
              {checkoutUrl && (
                <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/40 text-xs">
                  <CheckCircle2 className="w-3 h-3 mr-1 inline" /> Session Ready
                </Badge>
              )}
            </div>
            <p className="text-xs text-white/60">
              Pass <code className="text-gold">managed_payments[enabled] = true</code> and header{" "}
              <code className="text-white/80">2026-02-25.preview</code> to create the Checkout Session reusing the
              product output.
            </p>

            <div>
              <label className="text-xs text-white/60 block mb-1">Customer Email</label>
              <Input
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                className="bg-black/40 border-white/10 text-white text-sm max-w-md"
                placeholder="customer@example.com"
              />
            </div>

            <div className="pt-2 flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCreateSession}
                disabled={creatingSession || !createdProduct}
                className="bg-gold/10 hover:bg-gold/20 text-gold border-gold/30 text-xs gap-2"
              >
                {creatingSession ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Generating Session...
                  </>
                ) : (
                  <>
                    <ArrowRight className="w-3.5 h-3.5" /> Create Checkout Session (/v1/checkout/sessions)
                  </>
                )}
              </Button>
              {!createdProduct && (
                <span className="text-xs text-white/40">Complete Step 1 to enable session creation</span>
              )}
            </div>

            {sessionId && (
              <div className="p-3 rounded-lg bg-black/40 border border-white/10 text-xs font-mono text-white/80 flex items-center justify-between">
                <div className="truncate max-w-[80%]">
                  <span className="text-white/40">Session ID:</span> {sessionId}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(sessionId, "Session ID")}
                  className="h-7 text-xs text-white/70 hover:text-white"
                >
                  {copiedText === "Session ID" ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                </Button>
              </div>
            )}
          </div>

          {/* STEP 3: Complete a test payment */}
          <div className="p-5 rounded-xl bg-white/[0.03] border border-white/10 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="w-6 h-6 rounded-full bg-gold/20 text-gold text-xs font-bold flex items-center justify-center border border-gold/40">
                  3
                </span>
                <h3 className="font-semibold text-white text-base">Complete a Test Payment</h3>
              </div>
            </div>
            <p className="text-xs text-white/60">
              Try different billing addresses to see how tax is calculated for customers in different locations. Then,
              process a test payment using this test card information.
            </p>

            {/* Test Payment Info Helper Box */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-lg bg-black/40 border border-white/10 text-xs">
              <div>
                <p className="text-white/40 mb-1 flex items-center gap-1 font-medium">
                  <CreditCard className="w-3.5 h-3.5 text-gold" /> Test Card Details
                </p>
                <div className="font-mono text-white/90 space-y-0.5">
                  <p>Number: 4242 4242 4242 4242</p>
                  <p>Expiry: Any future date (e.g. 12/28)</p>
                  <p>CVC: 123</p>
                </div>
              </div>
              <div>
                <p className="text-white/40 mb-1 flex items-center gap-1 font-medium">
                  <Building2 className="w-3.5 h-3.5 text-gold" /> Test Tax Locations
                </p>
                <div className="font-mono text-white/90 space-y-0.5">
                  <p>ZIP 90210 (Beverly Hills, CA)</p>
                  <p>ZIP 10001 (New York, NY)</p>
                  <p>ZIP 98101 (Seattle, WA)</p>
                </div>
              </div>
            </div>

            <div className="pt-2 flex items-center gap-3">
              {checkoutUrl ? (
                <Button
                  onClick={() => window.open(checkoutUrl, "_blank", "noopener,noreferrer")}
                  className="bg-gold text-black hover:bg-gold-light font-medium text-xs gap-2 px-5 py-2.5 shadow-lg shadow-gold/20"
                >
                  <ExternalLink className="w-4 h-4" />
                  Complete a test payment
                </Button>
              ) : (
                <Button disabled className="bg-white/10 text-white/40 text-xs gap-2">
                  Complete a test payment (Generate session in Step 2 first)
                </Button>
              )}
            </div>
          </div>

          {/* STEP 4: Handle Webhooks */}
          <div className="p-5 rounded-xl bg-white/[0.03] border border-white/10 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="w-6 h-6 rounded-full bg-gold/20 text-gold text-xs font-bold flex items-center justify-center border border-gold/40">
                  4
                </span>
                <h3 className="font-semibold text-white text-base">Listen for checkout.session.completed</h3>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={fetchEvents}
                disabled={loadingEvents}
                className="h-7 text-xs text-white/60 hover:text-white gap-1"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loadingEvents ? "animate-spin" : ""}`} />
                Refresh Events
              </Button>
            </div>
            <p className="text-xs text-white/60">
              Monitor successful payments instantly. When a payment completes, the webhook handler captures the{" "}
              <code className="text-gold">checkout.session.completed</code> snapshot.
            </p>

            <div className="space-y-2">
              {completedEvents.length === 0 ? (
                <div className="p-4 rounded-lg bg-black/30 border border-white/5 text-center text-xs text-white/40 flex items-center justify-center gap-2">
                  <Clock className="w-4 h-4 text-white/30" />
                  Waiting for checkout.session.completed events...
                </div>
              ) : (
                completedEvents.slice(0, 3).map((ev) => (
                  <div
                    key={ev.id}
                    className="p-3.5 rounded-lg bg-black/40 border border-emerald-500/30 text-xs space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/40 text-[11px]">
                          checkout.session.completed
                        </Badge>
                        <span className="font-mono text-white/70 text-[11px]">{ev.sessionId}</span>
                      </div>
                      <span className="text-white/40 text-[11px]">
                        {new Date(ev.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-white/80 font-mono text-[11px]">
                      <div>Customer: {ev.customerEmail || ev.customerId || "Anonymous"}</div>
                      <div>
                        Amount: ${(ev.amountTotal ? ev.amountTotal / 100 : 0).toFixed(2)} {ev.currency?.toUpperCase()}
                      </div>
                      <div>Status: {ev.status}</div>
                      <div>Payment: {ev.paymentStatus}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

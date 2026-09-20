import { useState } from "react";
import { motion } from "framer-motion";
import { Check, Sparkles, CreditCard, Receipt, Loader2, ShieldCheck, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { startCheckoutSession } from "@/lib/stripe";
import BillingManagerModal from "@/components/BillingManagerModal";
import { useAuth } from "@/hooks/useAuth";

const tiers = [
  {
    id: "monthly",
    name: "Monthly Creator",
    price: "$47.00",
    period: "/month",
    description: "Full digital headquarters suite. Flexible month-to-month billing for working musicians, filmmakers, actors, and writers.",
    features: [
      "1-3 Active Creative HQs & Aliases",
      "Full EPK, Casting Kit & Pitch Deck builder",
      "Password-protected screeners, riders & manuscripts",
      "Lossless audio & 4K video reel hosting",
      "Multiple custom domains & vanity URLs",
      "Downloadable 300DPI press & headshot bundles",
      "Direct fan & mailing list capture",
    ],
    cta: "Get Monthly Creator ($47)",
    variant: "heroOutline" as const,
    highlighted: false,
  },
  {
    id: "biannual",
    name: "Bi-Annual Pro",
    price: "$234.00",
    period: "/6 months",
    description: "Billed every 6 months ($39.00/mo effective). Saves 17% compared to monthly. Ideal for active release schedules and seasonal production cycles.",
    features: [
      "Up to 4 Creative HQs / Production Hubs",
      "Everything in Monthly Creator",
      "Save 17% compared to monthly billing",
      "Priority Cloud Run build worker queue",
      "Release countdown & VIP RSVP screening gates",
      "Multi-domain alias management",
      "Guaranteed continuous Google Cloud compute capacity",
    ],
    cta: "Get Bi-Annual Pro ($234)",
    variant: "hero" as const,
    highlighted: true,
  },
  {
    id: "yearly",
    name: "Annual Sovereign",
    price: "$397.00",
    period: "/year",
    description: "Billed annually ($33.08/mo effective). Saves ~30% with guaranteed full-year Google Cloud & Gemini AI token coverage.",
    features: [
      "Up to 6 Creative HQs on a unified dashboard",
      "Everything in Bi-Annual Pro",
      "Save 30% compared to monthly billing",
      "Team roles (Producer, Tour Manager, Agent, Editor)",
      "Dedicated custom domains for every roster artist",
      "Priority Cloud Run rendering pipeline",
      "Direct founder chat & priority support",
    ],
    cta: "Go Annual Sovereign ($397)",
    variant: "heroOutline" as const,
    highlighted: false,
  },
];

const Pricing = () => {
  const { user } = useAuth();
  const [billingOpen, setBillingOpen] = useState(false);
  const [loadingTier, setLoadingTier] = useState<string | null>(null);
  const [missingKeyNotice, setMissingKeyNotice] = useState(false);
  const [selectedTier, setSelectedTier] = useState<typeof tiers[0] | null>(null);

  const handleSelectTier = async (tier: typeof tiers[0]) => {
    setSelectedTier(tier);
    setLoadingTier(tier.id);

    try {
      const result = await startCheckoutSession(tier.id, user?.email || undefined);

      if (result.needsKey) {
        setMissingKeyNotice(true);
        setLoadingTier(null);
        return;
      }

      if (result.error) {
        toast.error(result.error);
        setLoadingTier(null);
        return;
      }

      if (result.url) {
        toast.success(`Redirecting to Stripe Checkout for ${tier.name}...`);
        window.location.href = result.url;
      }
    } catch (err) {
      console.error(err);
      toast.error("An unexpected error occurred while starting checkout.");
      setLoadingTier(null);
    }
  };

  return (
    <section id="pricing" className="relative py-32 px-6">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gold/10 border border-gold/30 text-gold text-xs font-mono uppercase tracking-widest mb-4">
            <ShieldCheck className="w-3.5 h-3.5" />
            STRIPE SECURE BILLING
          </div>
          <h2 className="font-display text-4xl md:text-5xl font-bold mb-4 shiny-gold-header">
            Fair, creator-first infrastructure pricing
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-6">
            Start free. Own your music, films, casting reels, and writing. Zero middleman commission cuts.
          </p>

          <div className="flex items-center justify-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setBillingOpen(true)}
              className="border-gold/30 hover:bg-gold/10 text-xs gap-1.5"
            >
              <CreditCard className="w-3.5 h-3.5 text-gold" />
              Manage Subscription & Invoices
            </Button>
          </div>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 items-start">
          {tiers.map((tier, index) => (
            <motion.div
              key={tier.name}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <div
                className={`relative rounded-2xl ${
                  tier.highlighted
                    ? "p-[1.5px] bg-gradient-to-br from-gold via-gold-light to-primary animate-glow-pulse animate-float-soft"
                    : ""
                }`}
              >
                <div
                  className={`glass-card p-8 relative h-full rounded-2xl overflow-hidden ${
                    tier.highlighted ? "bg-card/80" : ""
                  }`}
                >
                  {tier.highlighted && (
                    <>
                      {/* Animated shimmer sweep */}
                      <div className="pointer-events-none absolute inset-0 opacity-30 bg-[linear-gradient(110deg,transparent_30%,hsl(var(--gold)/0.25)_50%,transparent_70%)] bg-[length:200%_100%] animate-shimmer" />
                      {/* Soft gold radial glow */}
                      <div className="pointer-events-none absolute -top-20 -right-20 w-56 h-56 rounded-full bg-gold/20 blur-3xl" />
                    </>
                  )}

                  {tier.highlighted && (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-10">
                      <span className="bg-gradient-to-r from-gold-light via-gold to-gold-dark text-background text-xs font-bold uppercase tracking-wider px-4 py-1.5 rounded-full flex items-center gap-1.5 shadow-[0_8px_24px_-6px_hsl(var(--gold)/0.7)] ring-1 ring-gold-light/60">
                        <Sparkles className="w-3 h-3 animate-pulse" />
                        Most Popular
                      </span>
                    </div>
                  )}

                  <div className="relative">
                    <h3 className="font-display text-2xl font-bold mb-1">
                      {tier.name}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-6">
                      {tier.description}
                    </p>

                    <div className="flex items-baseline gap-1 mb-8">
                      <span
                        className={`font-display text-5xl font-bold ${
                          tier.highlighted
                            ? "bg-gradient-to-br from-gold-light via-gold to-gold-dark bg-clip-text text-transparent"
                            : "text-gold"
                        }`}
                      >
                        {tier.price}
                      </span>
                      <span className="text-muted-foreground text-sm">
                        {tier.period}
                      </span>
                    </div>

                    <Button
                      variant={tier.variant}
                      size="lg"
                      className="w-full mb-8 gap-2"
                      disabled={loadingTier === tier.id}
                      onClick={() => handleSelectTier(tier)}
                    >
                      {loadingTier === tier.id ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin text-gold" />
                          Preparing Checkout...
                        </>
                      ) : (
                        <>
                          {tier.cta}
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </Button>

                    <ul className="space-y-3">
                      {tier.features.map((feature) => {
                        const slug = feature
                          .toLowerCase()
                          .replace(/[^a-z0-9]+/g, "-")
                          .replace(/(^-|-$)/g, "");
                        const id = `feature-${tier.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${slug}`;
                        return (
                          <li
                            key={feature}
                            id={id}
                            className="flex items-center gap-3 text-sm scroll-mt-32 target:bg-gold/10 target:ring-1 target:ring-gold/40 rounded-md px-1 -mx-1 transition-colors"
                          >
                            <Check className="w-4 h-4 text-gold flex-shrink-0" />
                            <span className="text-muted-foreground">{feature}</span>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Stripe Key Notice Dialog */}
      <AlertDialog open={missingKeyNotice} onOpenChange={setMissingKeyNotice}>
        <AlertDialogContent className="glass-card border-gold/30">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-display flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-gold" />
              Connect Stripe Payments
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-3 text-sm">
              <p>
                AlistWebs is fully configured with the Stripe Payments, Billing, and Invoicing integration for{" "}
                <span className="font-semibold text-foreground">{selectedTier?.name} ({selectedTier?.price}{selectedTier?.period})</span>.
              </p>
              <p className="p-3 rounded-lg bg-black/40 border border-gold/20 text-xs text-muted-foreground">
                To accept live credit cards and start recurring subscriptions, simply add your{" "}
                <code className="text-gold font-mono">STRIPE_SECRET_KEY</code> in the Settings panel or environment configuration.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setMissingKeyNotice(false)}>Close</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setMissingKeyNotice(false);
                setBillingOpen(true);
              }}
              className="bg-gradient-to-r from-gold-light via-gold to-gold-dark text-background hover:opacity-90"
            >
              View Billing Portal & Invoices
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Billing & Invoices Management Modal */}
      <BillingManagerModal
        open={billingOpen}
        onOpenChange={setBillingOpen}
        defaultEmail={user?.email || ""}
      />
    </section>
  );
};

export default Pricing;

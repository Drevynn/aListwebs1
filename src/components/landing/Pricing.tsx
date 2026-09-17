import { useState } from "react";
import { motion } from "framer-motion";
import { Check, Sparkles, Shield, Loader2, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

export default function Pricing() {
  const [loadingTier, setLoadingTier] = useState<string | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  const tiers = [
    {
      id: "starter",
      name: "Starter (Weekly)",
      price: "$7.77",
      period: "/week",
      description: "Our starting plan. Flexible weekly billing for indie creators and artists getting started. Safely covers Google Cloud container & database infrastructure costs.",
      features: [
        "1 published creative headquarters + Custom Domain",
        "Schema-first component & EPK builder",
        "Embedded audio & 4K video streaming",
        "Direct fan & mailing list capture",
        "Guaranteed Google Cloud infrastructure coverage",
      ],
      cta: "Start with Weekly ($7.77)",
      variant: "heroOutline" as const,
      highlighted: false,
    },
    {
      id: "monthly",
      name: "Monthly Creator",
      price: "$47.00",
      period: "/month",
      description: "The ultimate professional tier for working musicians, filmmakers, actors, and writers with robust profit margin over Google Cloud APIs.",
      features: [
        "Up to 3 Active Creative HQs / Aliases",
        "Full EPK, Casting Kit & Pitch Deck builder",
        "Password-protected screeners, riders & manuscripts",
        "Lossless FLAC audio & 4K video reel hosting",
        "Multiple custom domains & vanity URLs",
        "Downloadable 300DPI press & headshot bundles",
        "Priority Cloud Run build worker queue",
      ],
      cta: "Get Monthly Creator ($47)",
      variant: "hero" as const,
      highlighted: true,
    },
    {
      id: "yearly",
      name: "Yearly Sovereign",
      price: "$397.00",
      period: "/year",
      description: "Saves ~30% compared to monthly ($33.08/mo effective). Locks in guaranteed annual Google Cloud & AI token coverage upfront on day one.",
      features: [
        "Up to 5 Creative HQs on a unified dashboard",
        "Everything in Monthly Creator",
        "Team roles (Producer, Tour Manager, Agent, Editor)",
        "Dedicated custom domains for every roster artist",
        "Multi-creator release drop scheduling",
        "Direct founder chat & priority support",
      ],
      cta: "Go Yearly Sovereign ($397)",
      variant: "heroOutline" as const,
      highlighted: false,
    },
  ];

  const handleSelectTier = async (tier: typeof tiers[0]) => {
    setLoadingTier(tier.id);
    try {
      const res = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceId: tier.id, successUrl: window.location.origin + "/build", cancelUrl: window.location.href }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        navigate("/build");
      }
    } catch {
      navigate("/build");
    } finally {
      setLoadingTier(null);
    }
  };

  return (
    <section id="pricing" className="py-24 px-4 sm:px-6 lg:px-8 bg-background relative">
      <div className="max-w-6xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-gold/10 border border-gold/30 text-gold text-xs font-mono uppercase tracking-widest">
            <Sparkles className="w-3.5 h-3.5" />
            Transparent Sovereign Pricing
          </div>
          <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
            Invest in Your Creative Independence
          </h2>
          <p className="text-muted-foreground text-sm sm:text-base">
            Clear 3-tiered pricing designed so creator revenues comfortably outpace all infrastructure costs.
          </p>

          {/* Key Trust Signals */}
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 pt-2 text-xs font-mono text-muted-foreground">
            <span className="flex items-center gap-1.5 text-foreground">
              <CreditCard className="w-4 h-4 text-gold" />
              <strong>No credit card required</strong> to try
            </span>
            <span className="flex items-center gap-1.5 text-foreground">
              <Shield className="w-4 h-4 text-gold" />
              <strong>0% commission</strong> on all client sales
            </span>
            <span className="flex items-center gap-1.5 text-foreground">
              <Sparkles className="w-4 h-4 text-gold" />
              <strong>Starting at $7.77/week</strong>
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch mb-12">
          {tiers.map((tier, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: idx * 0.1 }}
              className={`p-8 rounded-3xl flex flex-col justify-between relative transition-all shadow-lg ${
                tier.highlighted
                  ? "bg-card border-2 border-gold shadow-gold/15 scale-105 z-10"
                  : "bg-card border border-border hover:border-border/80"
              }`}
            >
              {tier.highlighted && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gold text-white text-xs font-mono font-bold tracking-wider uppercase shadow-md shadow-gold/30">
                  Most Popular Creator Tier
                </div>
              )}

              <div className="space-y-6">
                <div>
                  <h3 className="font-display text-xl font-bold text-foreground mb-1">
                    {tier.name}
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed min-h-[36px]">
                    {tier.description}
                  </p>
                </div>

                <div className="flex items-baseline gap-1">
                  <span className="font-display text-4xl sm:text-5xl font-extrabold text-foreground">
                    {tier.price}
                  </span>
                  <span className="text-xs font-mono text-muted-foreground font-semibold">
                    {tier.period}
                  </span>
                </div>

                <div className="space-y-3 pt-4 border-t border-border">
                  <p className="text-xs font-mono uppercase tracking-wider text-gold font-bold">
                    What's included:
                  </p>
                  <ul className="space-y-2.5">
                    {tier.features.map((feature, fIdx) => (
                      <li key={fIdx} className="flex items-start gap-2.5 text-xs text-foreground/80 font-medium">
                        <Check className="w-4 h-4 text-gold shrink-0 mt-0.5" />
                        <span className="leading-relaxed">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="pt-8 mt-8 border-t border-border">
                <Button
                  variant={tier.variant}
                  onClick={() => handleSelectTier(tier)}
                  disabled={loadingTier === tier.id}
                  className="w-full justify-center text-xs font-bold h-11"
                >
                  {loadingTier === tier.id ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Connecting to Stripe...
                    </>
                  ) : (
                    tier.cta
                  )}
                </Button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Pricing Trust Details & Limits Policy */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6 rounded-2xl bg-muted/50 border border-border mb-8 text-left text-xs">
          <div className="space-y-1.5">
            <h4 className="font-semibold text-foreground flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-gold" />
              Card Policy
            </h4>
            <p className="text-muted-foreground leading-relaxed">
              No credit card required to start generating designs in the Studio. Add payment only when ready to publish your custom domain and activate live edge hosting.
            </p>
          </div>
          <div className="space-y-1.5">
            <h4 className="font-semibold text-foreground flex items-center gap-2">
              <Shield className="w-4 h-4 text-gold" />
              Limits & Upgrades
            </h4>
            <p className="text-muted-foreground leading-relaxed">
              If your traffic spikes or you reach tier site limits, your live websites never shut down. We notify you with a seamless 1-click upgrade to protect bandwidth.
            </p>
          </div>
          <div className="space-y-1.5">
            <h4 className="font-semibold text-foreground flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-gold" />
              Support Path
            </h4>
            <p className="text-muted-foreground leading-relaxed">
              Direct email support at <a href="mailto:support@alistwebs.com" className="text-gold underline">support@alistwebs.com</a>, self-serve <a href="/help" className="text-gold underline">Knowledge Base</a>, and priority founder Discord.
            </p>
          </div>
        </div>

        {/* Pricing Trust Footer */}
        <div className="text-center text-xs text-muted-foreground max-w-xl mx-auto space-y-2">
          <p>
            Secure checkout powered by Stripe. Cancel anytime directly from your dashboard billing portal.
          </p>
          <p className="text-gold font-mono">
            Need custom enterprise or record label agency licensing? <a href="mailto:support@alistwebs.com" className="underline hover:text-gold-light">Contact our team</a>.
          </p>
        </div>
      </div>
    </section>
  );
}

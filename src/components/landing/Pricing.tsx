import { useState } from "react";
import { motion } from "framer-motion";
import { Check, Sparkles, Shield, Loader2, CreditCard, Globe, Search, PlusCircle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

export default function Pricing() {
  const [loadingTier, setLoadingTier] = useState<string | null>(null);
  const [domainQuery, setDomainQuery] = useState("");
  const [searchingDomain, setSearchingDomain] = useState(false);
  const [domainResult, setDomainResult] = useState<{
    domain: string;
    isAvailable: boolean;
    upsellPriceUsd: number;
    wholesalePriceUsd: number;
    suggestions: Array<{ domain: string; tld: string; upsellPriceUsd: number }>;
  } | null>(null);
  const [includeDomainUpsell, setIncludeDomainUpsell] = useState(false);
  const [selectedDomain, setSelectedDomain] = useState("artistname.com");
  const [selectedDomainPrice, setSelectedDomainPrice] = useState(12.00);

  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSearchDomain = async (queryToSearch?: string) => {
    const q = (queryToSearch || domainQuery).trim();
    if (!q) return;
    setSearchingDomain(true);
    try {
      const res = await fetch(`/api/registrar/search?domain=${encodeURIComponent(q)}`);
      const data = await res.json();
      if (data.success) {
        setDomainResult(data);
        setSelectedDomain(data.domain);
        setSelectedDomainPrice(data.upsellPriceUsd || 12.00);
        setIncludeDomainUpsell(true);
      }
    } catch {
      toast({
        title: "Domain Search Failed",
        description: "Could not query registrar at this moment. You can still bundle a domain.",
        variant: "destructive",
      });
    } finally {
      setSearchingDomain(false);
    }
  };

  const tiers = [
    {
      id: "monthly",
      name: "Monthly Creator",
      price: "$47.00",
      period: "/month",
      description: "Full digital headquarters suite. Flexible month-to-month billing for musicians, filmmakers, actors, and writers.",
      features: [
        "1-3 Active Creative HQs & Aliases",
        "Full EPK, Casting Kit & Pitch Deck builder",
        "Password-protected screeners, riders & manuscripts",
        "Lossless audio & 4K video reel hosting",
        "Custom domain routing + Free SSL/DNSSEC",
        "Downloadable 300DPI press & headshot bundles",
        "Direct fan & mailing list capture",
      ],
      cta: "Get Monthly ($47/mo)",
      variant: "heroOutline" as const,
      highlighted: false,
    },
    {
      id: "biannual",
      name: "Bi-Annual Pro",
      price: "$234.00",
      period: "/6 months",
      description: "Billed every 6 months ($39.00/mo effective). Saves 17% compared to monthly. Ideal for active release schedules and tour cycles.",
      features: [
        "Up to 4 Creative HQs / Production Hubs",
        "Everything in Monthly Creator",
        "Save 17% compared to monthly billing",
        "Priority Cloud Run worker rendering queue",
        "Release countdown & VIP RSVP screening gates",
        "Multi-domain alias management",
        "Guaranteed continuous Google Cloud compute capacity",
      ],
      cta: "Get Bi-Annual ($234/6mo)",
      variant: "hero" as const,
      highlighted: true,
    },
    {
      id: "yearly",
      name: "Annual Sovereign",
      price: "$397.00",
      period: "/year",
      description: "Billed annually ($33.08/mo effective). Saves ~30% with guaranteed full-year Google Cloud & Gemini AI infrastructure coverage.",
      features: [
        "Up to 6 Creative HQs on a unified dashboard",
        "Everything in Bi-Annual Pro",
        "Save 30% compared to monthly billing",
        "Team collaboration (Producer, Tour Manager, Agent, Editor)",
        "Dedicated custom domains for every roster artist",
        "Direct founder chat & priority support",
        "Priority Cloud Run render pipeline & VIP onboarding",
      ],
      cta: "Go Annual ($397/yr)",
      variant: "heroOutline" as const,
      highlighted: false,
    },
  ];

  const handleSelectTier = async (tier: typeof tiers[0]) => {
    setLoadingTier(tier.id);
    try {
      const payload: Record<string, unknown> = {
        priceId: tier.id,
        tier: tier.id,
        successUrl: window.location.origin + "/build",
        cancelUrl: window.location.href,
      };

      if (includeDomainUpsell && selectedDomain) {
        payload.domainUpsell = {
          domain: selectedDomain,
          priceUsd: selectedDomainPrice,
        };
      }

      const res = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
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

        {/* Cloudflare Registrar Domain Registration Upsell Card */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12 p-6 sm:p-8 rounded-3xl bg-card border-2 border-gold/40 shadow-xl shadow-gold/5 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-gold/5 rounded-full blur-3xl pointer-events-none" />
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
            <div className="space-y-2 max-w-xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold/15 text-gold text-xs font-mono font-semibold uppercase tracking-wider">
                <Globe className="w-3.5 h-3.5" />
                Upsell Add-On: Cloudflare Registrar Integration
              </div>
              <h3 className="text-xl sm:text-2xl font-bold font-display text-foreground tracking-tight">
                Reserve Your Custom Apex Domain at Cost
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Connect your sovereign digital headquarters to a dedicated custom domain (e.g. <span className="text-gold font-mono">.com, .film, .studio, .live, .me</span>). Includes free automated WHOIS privacy, DNSSEC protection, and Edge CDN routing.
              </p>
            </div>

            {/* Domain Search & Selection Form */}
            <div className="w-full md:w-auto md:min-w-[340px] space-y-3">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={domainQuery}
                    onChange={(e) => setDomainQuery(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearchDomain()}
                    placeholder="Search domain (e.g. yourname.com)"
                    className="w-full pl-9 pr-3 py-2 text-xs font-mono rounded-xl bg-background border border-border focus:border-gold focus:outline-none text-foreground placeholder:text-muted-foreground"
                  />
                </div>
                <Button
                  size="sm"
                  variant="hero"
                  onClick={() => handleSearchDomain()}
                  disabled={searchingDomain}
                  className="shrink-0 text-xs px-4"
                >
                  {searchingDomain ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Check"}
                </Button>
              </div>

              {/* Quick Extension Suggestions */}
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <span className="text-[11px] font-mono text-muted-foreground mr-1">Popular:</span>
                {[
                  { tld: "com", price: 12.00 },
                  { tld: "film", price: 29.00 },
                  { tld: "studio", price: 24.00 },
                  { tld: "live", price: 16.00 },
                  { tld: "me", price: 18.00 },
                ].map((ext) => (
                  <button
                    key={ext.tld}
                    type="button"
                    onClick={() => {
                      const base = domainQuery ? domainQuery.split(".")[0] : "artistname";
                      const candidate = `${base}.${ext.tld}`;
                      setDomainQuery(candidate);
                      handleSearchDomain(candidate);
                    }}
                    className={`text-[11px] font-mono px-2 py-0.5 rounded-md border transition-all ${
                      selectedDomain.endsWith(`.${ext.tld}`)
                        ? "bg-gold text-white border-gold font-bold shadow-sm"
                        : "bg-muted/60 text-muted-foreground border-border hover:border-gold/50 hover:text-foreground"
                    }`}
                  >
                    .{ext.tld} (${ext.price}/yr)
                  </button>
                ))}
              </div>

              {/* Domain Selected Status & Toggle */}
              {domainResult && (
                <div className="p-3 rounded-xl bg-muted/40 border border-gold/30 flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-gold shrink-0" />
                    <div>
                      <span className="font-mono font-semibold text-foreground">{domainResult.domain}</span>
                      <span className="text-muted-foreground ml-2">
                        (+${domainResult.upsellPriceUsd.toFixed(2)}/yr)
                      </span>
                    </div>
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={includeDomainUpsell}
                      onChange={(e) => setIncludeDomainUpsell(e.target.checked)}
                      className="w-4 h-4 rounded text-gold focus:ring-gold border-border cursor-pointer accent-[#D4AF37]"
                    />
                    <span className="font-mono text-[11px] font-medium text-gold">
                      {includeDomainUpsell ? "Bundled ✓" : "Add to plan"}
                    </span>
                  </label>
                </div>
              )}
            </div>
          </div>
        </motion.div>

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
                  ) : includeDomainUpsell && selectedDomain ? (
                    `${tier.cta} + Domain ($${selectedDomainPrice.toFixed(2)}/yr)`
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

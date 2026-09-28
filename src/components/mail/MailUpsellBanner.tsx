import React, { useState } from "react";
import { Mail, Sparkles, ShieldCheck, Check, ArrowRight, Zap, Globe, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface MailUpsellBannerProps {
  currentDomain: string;
  hasActiveSubscription?: boolean;
  onUpgradeSuccess?: () => void;
}

export const MailUpsellBanner: React.FC<MailUpsellBannerProps> = ({
  currentDomain,
  hasActiveSubscription = false,
  onUpgradeSuccess,
}) => {
  const [billingCycle, setBillingCycle] = useState<"month" | "year">("year");
  const [isUpgrading, setIsUpgrading] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  if (dismissed && hasActiveSubscription) return null;

  const handleStartMailCheckout = async () => {
    setIsUpgrading(true);
    try {
      const res = await fetch("/api/stripe/create-mail-upsell-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          domain: currentDomain || "alistwebs.com",
          interval: billingCycle,
          successUrl: `${window.location.origin}/mail?checkout_success=true&domain=${encodeURIComponent(currentDomain || "alistwebs.com")}`,
          cancelUrl: window.location.href,
        }),
      });

      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else if (data.needsKey) {
        toast.info("Stripe Demo Mode: Alist Mail active for preview.");
        onUpgradeSuccess?.();
      } else {
        toast.success(`Alist Mail Sovereign Plan activated for @${currentDomain}!`);
        onUpgradeSuccess?.();
      }
    } catch (err) {
      console.error("Error initiating mail checkout:", err);
      toast.error("Could not initiate checkout. Please try again.");
    } finally {
      setIsUpgrading(false);
    }
  };

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-card via-card/95 to-gold/10 border-2 border-gold/40 p-6 sm:p-8 shadow-xl shadow-gold/5 mb-8">
      <div className="absolute -top-12 -right-12 w-48 h-48 bg-gold/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        <div className="space-y-3 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold/15 border border-gold/30 text-gold text-xs font-mono font-semibold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            New Upgrade: Alist Mail Sovereign Suite
          </div>

          <h2 className="text-2xl sm:text-3xl font-bold font-display text-foreground tracking-tight">
            Send & Receive Official Email on <span className="text-gold font-mono">@{currentDomain || "yourdomain.com"}</span>
          </h2>

          <p className="text-sm text-muted-foreground leading-relaxed">
            Eliminate generic Gmail/Yahoo addresses. Upgrade your creative brand with sovereign domain inboxes (<span className="text-foreground font-mono font-medium">booking@</span>, <span className="text-foreground font-mono font-medium">contact@</span>, <span className="text-foreground font-mono font-medium">press@</span>), zero third-party telemetry, 25GB storage, and automated SPF/DKIM verification.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 text-xs text-muted-foreground font-mono">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-gold shrink-0" />
              <span>Full Inbound & Outbound Domain Routing</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-gold shrink-0" />
              <span>Automated SPF, DKIM & DMARC Protection</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-gold shrink-0" />
              <span>No Ad Profiling or Algorithm Scraping</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-gold shrink-0" />
              <span>Direct Tour, EPK & Sync Licensing Desks</span>
            </div>
          </div>
        </div>

        <div className="w-full lg:w-auto shrink-0 bg-background/80 backdrop-blur border border-glass-border p-5 rounded-2xl space-y-4 min-w-[280px]">
          <div className="flex items-center justify-between gap-2 bg-white/5 p-1 rounded-xl border border-white/5 text-xs font-medium">
            <button
              onClick={() => setBillingCycle("month")}
              className={`flex-1 py-1.5 px-3 rounded-lg transition-all ${
                billingCycle === "month" ? "bg-gold text-black font-semibold shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              $5 / month
            </button>
            <button
              onClick={() => setBillingCycle("year")}
              className={`flex-1 py-1.5 px-3 rounded-lg transition-all ${
                billingCycle === "year" ? "bg-gold text-black font-semibold shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              $49 / year <span className="text-[10px] opacity-80">(Save 18%)</span>
            </button>
          </div>

          <Button
            onClick={handleStartMailCheckout}
            disabled={isUpgrading}
            className="w-full bg-gold hover:bg-gold/90 text-black font-semibold h-11 shadow-lg shadow-gold/20"
          >
            {isUpgrading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Provisioning Mailbox...
              </>
            ) : (
              <>
                <Zap className="w-4 h-4 mr-2 fill-current" />
                Activate Sovereign Mail
              </>
            )}
          </Button>

          <p className="text-[11px] text-center text-muted-foreground">
            Instant activation &middot; Cancel anytime &middot; 100% data ownership
          </p>
        </div>
      </div>
    </div>
  );
};

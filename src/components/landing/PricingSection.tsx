import React, { useState } from "react";
import { CheckCircle2, ShieldCheck, Mail, ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";

export const PricingSection: React.FC = () => {
  const navigate = useNavigate();
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");

  return (
    <section id="mail-pricing" className="py-20 bg-zinc-950/50 border-t border-border/40 relative">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gold/10 border border-gold/25 text-gold text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Sovereign Mail Plans</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-display font-bold text-foreground tracking-tight">
            Transparent Pricing. No Middlemen.
          </h2>
          <p className="text-muted-foreground text-sm">
            Everything you need to broadcast, negotiate, and close licensing deals from your own domain.
          </p>

          <div className="flex items-center justify-center pt-2">
            <div className="flex items-center bg-muted/40 p-1 rounded-xl border border-border/40">
              <button
                type="button"
                onClick={() => setBillingCycle("monthly")}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  billingCycle === "monthly" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
                }`}
              >
                Monthly
              </button>
              <button
                type="button"
                onClick={() => setBillingCycle("yearly")}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  billingCycle === "yearly" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
                }`}
              >
                Yearly <span className="text-[10px] text-gold font-bold ml-1">Save 20%</span>
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Starter Plan */}
          <div className="p-7 rounded-3xl bg-card/60 border border-border/50 hover:border-gold/40 transition-all space-y-6 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-foreground font-display">Alist Mail Starter</h3>
                  <p className="text-xs text-muted-foreground">For independent artists & solo creators</p>
                </div>
                <Badge variant="outline" className="border-gold/40 text-gold text-[10px]">
                  Solo Desk
                </Badge>
              </div>

              <div className="flex items-baseline gap-1 font-display">
                <span className="text-4xl font-bold text-foreground">
                  {billingCycle === "monthly" ? "$5" : "$49"}
                </span>
                <span className="text-xs text-muted-foreground">
                  {billingCycle === "monthly" ? "/month" : "/year"}
                </span>
              </div>

              <ul className="space-y-2.5 text-xs text-muted-foreground pt-2">
                <li className="flex items-center gap-2.5 text-foreground">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  1 Apex Domain Mailbox (booking@yourdomain.com)
                </li>
                <li className="flex items-center gap-2.5 text-foreground">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  25 GB encrypted NVMe mailbox storage
                </li>
                <li className="flex items-center gap-2.5 text-foreground">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  Unlimited disposable plus-aliases (merch+, tour+)
                </li>
                <li className="flex items-center gap-2.5 text-foreground">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  2048-bit DKIM, SPF, & DMARC authentication
                </li>
                <li className="flex items-center gap-2.5 text-foreground">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  Sovereign Webmail Client with keyboard navigation
                </li>
              </ul>
            </div>

            <Button
              onClick={() => navigate("/signup?plan=starter")}
              className="w-full bg-gold hover:bg-gold/90 text-zinc-950 font-bold h-11 rounded-2xl shadow-md shadow-gold/20"
            >
              Get Started with Starter
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>

          {/* Studio Multi-Desk */}
          <div className="p-7 rounded-3xl bg-card/80 border-2 border-gold/60 shadow-xl shadow-gold/5 space-y-6 flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-gold text-zinc-950 text-[10px] font-bold uppercase tracking-wider px-4 py-1 rounded-bl-xl">
              Most Popular
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-foreground font-display">Alist Studio Multi-Desk</h3>
                  <p className="text-xs text-muted-foreground">For labels, touring acts, and creative studios</p>
                </div>
              </div>

              <div className="flex items-baseline gap-1 font-display">
                <span className="text-4xl font-bold text-foreground">
                  {billingCycle === "monthly" ? "$15" : "$149"}
                </span>
                <span className="text-xs text-muted-foreground">
                  {billingCycle === "monthly" ? "/month" : "/year"}
                </span>
              </div>

              <ul className="space-y-2.5 text-xs text-muted-foreground pt-2">
                <li className="flex items-center gap-2.5 text-foreground">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  Up to 5 Dedicated Desks (booking@, press@, sync@, mgmt@, vip@)
                </li>
                <li className="flex items-center gap-2.5 text-foreground">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  100 GB pooled high-speed NVMe storage
                </li>
                <li className="flex items-center gap-2.5 text-foreground">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  Priority Tier-1 MX inbound routing cluster
                </li>
                <li className="flex items-center gap-2.5 text-foreground">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  Inbound Sync License agreement parser & cue sheet detection
                </li>
                <li className="flex items-center gap-2.5 text-foreground">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  Priority SLA & dedicated onboarding assistance
                </li>
              </ul>
            </div>

            <Button
              onClick={() => navigate("/signup?plan=studio")}
              className="w-full bg-gold hover:bg-gold/90 text-zinc-950 font-bold h-11 rounded-2xl shadow-lg shadow-gold/20"
            >
              Get Started with Studio
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PricingSection;

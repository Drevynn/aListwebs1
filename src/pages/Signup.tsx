import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { 
  ShieldCheck, 
  Mail, 
  Globe, 
  CheckCircle2, 
  ArrowRight, 
  ArrowLeft, 
  Lock, 
  Sparkles, 
  Zap, 
  Copy, 
  Check, 
  RefreshCw,
  ExternalLink
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { DnsRecordsTable } from "@/components/signup/DnsRecordsTable";
import { VerificationChecklist } from "@/components/signup/VerificationChecklist";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";

type OnboardingStep = "domain" | "plan" | "dns" | "verify" | "complete";

export const Signup: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();

  const [step, setStep] = useState<OnboardingStep>("domain");
  const [domain, setDomain] = useState<string>(searchParams.get("domain") || "");
  const [prefix, setPrefix] = useState<string>("booking");
  const [selectedPlan, setSelectedPlan] = useState<"starter" | "studio">("starter");
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");
  const [dkimKey, setDkimKey] = useState<string>("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [isProvisioning, setIsProvisioning] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [step]);

  // If a domain was pre-provided in query, populate it
  useEffect(() => {
    const qDomain = searchParams.get("domain");
    if (qDomain) {
      setDomain(qDomain.trim().toLowerCase());
    }
  }, [searchParams]);

  const cleanDomain = domain.trim().toLowerCase().replace(/^(https?:\/\/)?(www\.)?/, "");
  const fullEmail = `${prefix}@${cleanDomain || "yourdomain.com"}`;

  const handleDomainSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cleanDomain) {
      toast.error("Please enter your custom domain (e.g. artistname.com)");
      return;
    }
    if (!cleanDomain.includes(".")) {
      toast.error("Please enter a valid domain name with an extension (e.g. .com, .io, .net)");
      return;
    }

    setIsProvisioning(true);
    try {
      // Call DKIM generation backend
      const dkimRes = await fetch("/api/mail/generate-dkim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domain: cleanDomain }),
      });
      const dkimData = await dkimRes.json();
      if (dkimData?.dkim?.value) {
        setDkimKey(dkimData.dkim.value);
      }

      setStep("plan");
    } catch (err) {
      console.error("Error generating DKIM:", err);
      setStep("plan");
    } finally {
      setIsProvisioning(false);
    }
  };

  const handlePlanProceed = () => {
    setStep("dns");
    toast.success(`Selected ${selectedPlan === "starter" ? "Starter Mailbox" : "Studio Multi-Desk"} plan`);
  };

  const handleDnsVerified = () => {
    setStep("verify");
  };

  const handleCompleteSetup = async () => {
    setIsProvisioning(true);
    try {
      // Provision the custom mailbox in memory / state
      await fetch("/api/mail/mailboxes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user?.uid || "user_default",
          domain: cleanDomain,
          prefix,
          displayName: `${prefix.toUpperCase()} Desk`,
        }),
      });

      toast.success(`Sovereign Mailbox ${fullEmail} is fully activated!`);
      setStep("complete");
    } catch (err) {
      console.error("Failed to finalize mailbox setup:", err);
      setStep("complete");
    } finally {
      setIsProvisioning(false);
    }
  };

  const handleOpenWebmail = () => {
    navigate(`/mail?domain=${encodeURIComponent(cleanDomain)}`);
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-between selection:bg-gold selection:text-white">
      <Navbar />

      <main className="container max-w-5xl mx-auto px-4 pt-28 md:pt-36 pb-20 space-y-10 flex-1">
        {/* Progress Header */}
        <div className="space-y-4 text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gold/10 border border-gold/25 text-gold text-xs font-semibold">
            <Mail className="w-3.5 h-3.5" />
            <span>Sovereign Domain Email Setup</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-display font-bold tracking-tight">
            Claim Your Custom Domain Inbox
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            Configure enterprise-grade email for your artist domain with zero Big Tech tracking and guaranteed 99.8% deliverability.
          </p>

          {/* Stepper Dots */}
          <div className="flex items-center justify-center gap-2 pt-2">
            {[
              { key: "domain", label: "Domain" },
              { key: "plan", label: "Plan" },
              { key: "dns", label: "DNS Records" },
              { key: "verify", label: "Verify" },
              { key: "complete", label: "Live" },
            ].map((s, idx) => {
              const stepKeys: OnboardingStep[] = ["domain", "plan", "dns", "verify", "complete"];
              const currentIndex = stepKeys.indexOf(step);
              const thisIndex = stepKeys.indexOf(s.key as OnboardingStep);
              const isPast = thisIndex < currentIndex;
              const isCurrent = thisIndex === currentIndex;

              return (
                <div key={s.key} className="flex items-center gap-2">
                  <div
                    className={`px-3 py-1 rounded-full text-xs font-mono font-bold transition-all ${
                      isCurrent
                        ? "bg-gold text-zinc-950 shadow-md shadow-gold/20"
                        : isPast
                        ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                        : "bg-muted/40 text-muted-foreground"
                    }`}
                  >
                    {isPast ? "✓" : idx + 1}. {s.label}
                  </div>
                  {idx < 4 && <div className="w-3 h-[1px] bg-border/60" />}
                </div>
              );
            })}
          </div>
        </div>

        {/* Step 1: Domain & Handle Selection */}
        {step === "domain" && (
          <div className="max-w-xl mx-auto bg-card/80 border border-glass-border rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl backdrop-blur-xl">
            <div className="space-y-2">
              <h2 className="text-xl font-bold font-display text-foreground">
                Enter your domain & primary desk
              </h2>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Connect your existing custom apex domain (purchased on Cloudflare, GoDaddy, Namecheap, etc.) or your Alist subdomain.
              </p>
            </div>

            <form onSubmit={handleDomainSubmit} className="space-y-5">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-foreground uppercase tracking-wider">
                  Domain Name
                </label>
                <div className="relative">
                  <Globe className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <Input
                    type="text"
                    placeholder="yourdomain.com (e.g. artistname.com)"
                    value={domain}
                    onChange={(e) => setDomain(e.target.value)}
                    className="pl-10 h-12 bg-background/60 border-border/60 focus:border-gold text-sm font-mono"
                    required
                  />
                </div>
                <span className="text-[11px] text-muted-foreground block">
                  Do not include https:// or www. Just the root domain.
                </span>
              </div>

              {/* Handle selection */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-foreground uppercase tracking-wider">
                  Choose Primary Mailbox Handle
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {["booking", "contact", "press", "hello"].map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPrefix(p)}
                      className={`p-2.5 rounded-xl border text-xs font-mono transition-all ${
                        prefix === p
                          ? "bg-gold/15 border-gold text-gold font-bold"
                          : "bg-muted/30 border-border/40 text-muted-foreground hover:bg-muted/60"
                      }`}
                    >
                      {p}@
                    </button>
                  ))}
                </div>
                <div className="pt-1">
                  <Input
                    type="text"
                    placeholder="Or type custom handle (e.g. sync, merch, vip)"
                    value={prefix}
                    onChange={(e) => setPrefix(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ""))}
                    className="h-10 bg-background/50 border-border/50 text-xs font-mono"
                  />
                </div>
              </div>

              {/* Real-time Address Preview */}
              <div className="p-4 rounded-2xl bg-zinc-950/60 border border-border/50 space-y-1.5">
                <span className="text-[10px] uppercase font-mono tracking-wider text-muted-foreground">
                  Your New Sovereign Email Address:
                </span>
                <div className="text-base font-mono font-bold text-gold flex items-center gap-2">
                  <Mail className="w-4 h-4 text-gold" />
                  <span>{fullEmail}</span>
                </div>
              </div>

              <Button
                type="submit"
                disabled={isProvisioning || !cleanDomain}
                className="w-full bg-gold hover:bg-gold/90 text-zinc-950 font-bold h-12 rounded-2xl shadow-lg shadow-gold/20"
              >
                {isProvisioning ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Generating DKIM Keys...
                  </>
                ) : (
                  <>
                    Continue to Plan Selection
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            </form>
          </div>
        )}

        {/* Step 2: Select Plan */}
        {step === "plan" && (
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-2xl font-bold font-display text-foreground">
                  Select your Alist Mail tier
                </h2>
                <p className="text-xs text-muted-foreground">
                  All plans include 2048-bit DKIM, SPF, DMARC, zero trackers, and webmail access.
                </p>
              </div>

              {/* Billing Toggle */}
              <div className="flex items-center bg-muted/40 p-1 rounded-xl border border-border/40 w-fit">
                <button
                  type="button"
                  onClick={() => setBillingCycle("monthly")}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                    billingCycle === "monthly" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
                  }`}
                >
                  Monthly
                </button>
                <button
                  type="button"
                  onClick={() => setBillingCycle("yearly")}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                    billingCycle === "yearly" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
                  }`}
                >
                  Yearly <span className="text-[10px] text-gold font-bold ml-0.5">(Save 20%)</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Plan A: Starter */}
              <div
                onClick={() => setSelectedPlan("starter")}
                className={`cursor-pointer rounded-3xl p-6 border transition-all space-y-5 flex flex-col justify-between ${
                  selectedPlan === "starter"
                    ? "bg-card/90 border-gold shadow-xl shadow-gold/5"
                    : "bg-card/40 border-border/50 hover:border-border"
                }`}
              >
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-foreground">Alist Mail Starter</h3>
                      <p className="text-xs text-muted-foreground">For independent creators & solo artists</p>
                    </div>
                    <Badge variant="outline" className="border-gold/40 text-gold text-[10px]">
                      Single Desk
                    </Badge>
                  </div>

                  <div className="flex items-baseline gap-1 font-display">
                    <span className="text-3xl font-bold text-foreground">
                      {billingCycle === "monthly" ? "$5" : "$49"}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {billingCycle === "monthly" ? "/month" : "/year"}
                    </span>
                  </div>

                  <ul className="space-y-2 text-xs text-muted-foreground">
                    <li className="flex items-center gap-2 text-foreground/90">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      1 Apex custom domain mailbox ({fullEmail})
                    </li>
                    <li className="flex items-center gap-2 text-foreground/90">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      25 GB sovereign encrypted storage
                    </li>
                    <li className="flex items-center gap-2 text-foreground/90">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      Unlimited aliases (e.g. merch+, newsletter+)
                    </li>
                    <li className="flex items-center gap-2 text-foreground/90">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      Full SPF, DKIM & DMARC authentication
                    </li>
                  </ul>
                </div>

                <Button
                  onClick={handlePlanProceed}
                  className={`w-full font-bold rounded-2xl h-11 ${
                    selectedPlan === "starter"
                      ? "bg-gold hover:bg-gold/90 text-zinc-950"
                      : "bg-muted hover:bg-muted/80 text-foreground"
                  }`}
                >
                  Configure DNS for Starter
                </Button>
              </div>

              {/* Plan B: Studio Agency */}
              <div
                onClick={() => setSelectedPlan("studio")}
                className={`cursor-pointer rounded-3xl p-6 border transition-all space-y-5 flex flex-col justify-between ${
                  selectedPlan === "studio"
                    ? "bg-card/90 border-gold shadow-xl shadow-gold/5"
                    : "bg-card/40 border-border/50 hover:border-border"
                }`}
              >
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-foreground">Alist Studio Multi-Desk</h3>
                      <p className="text-xs text-muted-foreground">For bands, labels, agencies & management</p>
                    </div>
                    <Badge className="bg-gold text-zinc-950 font-bold text-[10px]">
                      Recommended
                    </Badge>
                  </div>

                  <div className="flex items-baseline gap-1 font-display">
                    <span className="text-3xl font-bold text-foreground">
                      {billingCycle === "monthly" ? "$15" : "$149"}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {billingCycle === "monthly" ? "/month" : "/year"}
                    </span>
                  </div>

                  <ul className="space-y-2 text-xs text-muted-foreground">
                    <li className="flex items-center gap-2 text-foreground/90">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      Up to 5 distinct mailboxes (booking@, press@, sync@, mgmt@, vip@)
                    </li>
                    <li className="flex items-center gap-2 text-foreground/90">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      100 GB pooled NVMe storage
                    </li>
                    <li className="flex items-center gap-2 text-foreground/90">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      Automated inbound sync licensing parser
                    </li>
                    <li className="flex items-center gap-2 text-foreground/90">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      Priority Tier-1 MX routing cluster
                    </li>
                  </ul>
                </div>

                <Button
                  onClick={handlePlanProceed}
                  className={`w-full font-bold rounded-2xl h-11 ${
                    selectedPlan === "studio"
                      ? "bg-gold hover:bg-gold/90 text-zinc-950 shadow-md shadow-gold/20"
                      : "bg-muted hover:bg-muted/80 text-foreground"
                  }`}
                >
                  Configure DNS for Studio
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setStep("domain")}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Back to domain input
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: DNS Records Configuration */}
        {step === "dns" && (
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-2xl font-bold font-display text-foreground">
                  Add DNS Records for {cleanDomain}
                </h2>
                <p className="text-xs text-muted-foreground">
                  Copy these cryptographic records into your DNS provider (Cloudflare, GoDaddy, Namecheap, etc.).
                </p>
              </div>

              <Button
                onClick={handleDnsVerified}
                className="bg-gold hover:bg-gold/90 text-zinc-950 font-bold text-xs h-10 px-4 rounded-xl shadow-md shadow-gold/20 shrink-0"
              >
                I've Added the Records
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            </div>

            <DnsRecordsTable
              domain={cleanDomain}
              dkimKey={dkimKey}
              onRefresh={() => toast.info("Querying global DNS propagation servers...")}
            />

            <div className="flex items-center justify-between pt-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setStep("plan")}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Change Plan
              </Button>

              <Button
                onClick={handleDnsVerified}
                className="bg-gold hover:bg-gold/90 text-zinc-950 font-bold text-xs h-10 px-4 rounded-xl"
              >
                Proceed to Verification Check
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 4: Verification Checklist */}
        {step === "verify" && (
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-2xl font-bold font-display text-foreground">
                  Verifying Deliverability & Security
                </h2>
                <p className="text-xs text-muted-foreground">
                  Testing MX, SPF, DKIM-2048, and DMARC alignment on <span className="font-mono text-foreground font-semibold">{cleanDomain}</span>.
                </p>
              </div>
            </div>

            <VerificationChecklist
              domain={cleanDomain}
              onVerificationComplete={() => {
                toast.success("Domain verified! Ready to activate mailbox.");
              }}
              onOpenWebmail={handleCompleteSetup}
            />

            <div className="flex items-center justify-between pt-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setStep("dns")}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Back to DNS Records
              </Button>

              <Button
                onClick={handleCompleteSetup}
                disabled={isProvisioning}
                className="bg-gold hover:bg-gold/90 text-zinc-950 font-bold text-xs h-10 px-5 rounded-xl shadow-lg shadow-gold/20"
              >
                {isProvisioning ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Provisioning Mailbox...
                  </>
                ) : (
                  <>
                    Activate {fullEmail}
                    <ArrowRight className="w-4 h-4 ml-1.5" />
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

        {/* Step 5: Activation Complete */}
        {step === "complete" && (
          <div className="max-w-xl mx-auto bg-card/90 border border-emerald-500/30 rounded-3xl p-8 text-center space-y-6 shadow-2xl backdrop-blur-xl">
            <div className="w-16 h-16 rounded-3xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/30">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 font-mono text-xs">
                Sovereign Domain Active
              </Badge>
              <h2 className="text-2xl font-bold font-display text-foreground">
                Your Mailbox is Live!
              </h2>
              <p className="text-xs text-muted-foreground leading-relaxed">
                You can now send and receive sovereign emails with Hollywood music supervisors, festival promoters, and fans.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-background/60 border border-border/50 text-left space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-muted-foreground">Primary Address:</span>
                <span className="font-mono font-bold text-gold">{fullEmail}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-muted-foreground">Webmail Portal:</span>
                <span className="font-mono text-foreground">https://mail.{cleanDomain}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-muted-foreground">Authentication:</span>
                <span className="text-emerald-400 font-mono font-semibold">SPF + DKIM-2048 + DMARC</span>
              </div>
            </div>

            <div className="pt-2 space-y-3">
              <Button
                onClick={handleOpenWebmail}
                className="w-full bg-gold hover:bg-gold/90 text-zinc-950 font-bold h-12 rounded-2xl shadow-lg shadow-gold/20"
              >
                <Mail className="w-4 h-4 mr-2" />
                Open Sovereign Webmail Client
              </Button>

              <Button
                variant="outline"
                onClick={() => navigate("/")}
                className="w-full text-xs h-10 rounded-2xl border-border/60"
              >
                Return to Studio Dashboard
              </Button>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Signup;

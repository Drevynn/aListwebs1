import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Globe,
  Server,
  ShieldCheck,
  CheckCircle2,
  Copy,
  Check,
  Loader2,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { toast } from "@/hooks/use-toast";

type Step = 0 | 1 | 2 | 3 | 4;

type VerifyState = "idle" | "checking" | "success" | "failed";

const STEPS = [
  { id: 0, label: "Domain", icon: Globe },
  { id: 1, label: "DNS Records", icon: Server },
  { id: 2, label: "Verify", icon: CheckCircle2 },
  { id: 3, label: "SSL", icon: ShieldCheck },
  { id: 4, label: "Live", icon: Sparkles },
];

const TARGET_IP = "185.158.133.1";

const DomainWizard = () => {
  const [step, setStep] = useState<Step>(0);
  const [domainMode, setDomainMode] = useState<"connect" | "register">("connect");
  const [domain, setDomain] = useState("");
  const [confirmedDomain, setConfirmedDomain] = useState("");
  const [verifyState, setVerifyState] = useState<VerifyState>("idle");
  const [sslState, setSslState] = useState<VerifyState>("idle");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Registration mode states
  const [isSearchingReg, setIsSearchingReg] = useState(false);
  const [regResult, setRegResult] = useState<{
    domain: string;
    isAvailable: boolean;
    upsellPriceUsd: number;
    wholesalePriceUsd: number;
  } | null>(null);
  const [isRegistering, setIsRegistering] = useState(false);

  const handleSearchRegistrar = async (searchName?: string) => {
    const q = (searchName || domain).trim();
    if (!q) return;
    setIsSearchingReg(true);
    try {
      const res = await fetch(`/api/registrar/search?domain=${encodeURIComponent(q)}`);
      const data = await res.json();
      if (data.success) {
        setRegResult(data);
        setDomain(data.domain);
      }
    } catch {
      toast({
        title: "Search Error",
        description: "Could not query registrar availability. Please retry.",
        variant: "destructive",
      });
    } finally {
      setIsSearchingReg(false);
    }
  };

  const handleRegisterDomain = async () => {
    if (!regResult) return;
    setIsRegistering(true);
    try {
      const res = await fetch("/api/registrar/registrations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          domain_name: regResult.domain,
          years: 1,
          privacy: true,
          auto_renew: true,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setConfirmedDomain(regResult.domain);
        toast({
          title: "Domain Reserved!",
          description: `${regResult.domain} has been registered via Cloudflare Registrar. Automatic DNS records created.`,
        });
        setStep(4); // Skip manual DNS setup straight to Live!
      } else {
        toast({
          title: "Registration Failed",
          description: data.error || "Could not complete registration.",
          variant: "destructive",
        });
      }
    } catch {
      toast({
        title: "Registration Error",
        description: "An unexpected error occurred during domain provisioning.",
        variant: "destructive",
      });
    } finally {
      setIsRegistering(false);
    }
  };

  const verifyToken = `lovable_verify=${(confirmedDomain || "yourdomain.com")
    .replace(/[^a-z0-9]/gi, "")
    .slice(0, 12)
    .toLowerCase()}-${Math.abs(
    [...(confirmedDomain || "yourdomain.com")].reduce((a, c) => a + c.charCodeAt(0), 0)
  ).toString(36)}`;

  const dnsRecords = [
    { type: "A", name: "@", value: TARGET_IP, ttl: "3600" },
    { type: "A", name: "www", value: TARGET_IP, ttl: "3600" },
    { type: "TXT", name: "_lovable", value: verifyToken, ttl: "3600" },
  ];

  const validDomain = (d: string) =>
    /^([a-z0-9]([a-z0-9-]*[a-z0-9])?\.)+[a-z]{2,}$/i.test(d.trim());

  const handleStartDomain = () => {
    const cleaned = domain.trim().toLowerCase().replace(/^https?:\/\//, "").replace(/\/.*/, "");
    if (!validDomain(cleaned)) {
      toast({
        title: "Invalid domain",
        description: "Enter a domain like mysite.com (no http:// or paths).",
        variant: "destructive",
      });
      return;
    }
    setConfirmedDomain(cleaned);
    setDomain(cleaned);
    setStep(1);
  };

  const copy = (key: string, value: string) => {
    navigator.clipboard.writeText(value);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1500);
    toast({ title: "Copied", description: value });
  };

  const runVerification = () => {
    setVerifyState("checking");
    // Simulated DNS verification — in production, hit an edge function
    setTimeout(() => {
      const ok = Math.random() > 0.25;
      if (ok) {
        setVerifyState("success");
        setTimeout(() => setStep(3), 700);
      } else {
        setVerifyState("failed");
      }
    }, 2200);
  };

  const runSsl = () => {
    setSslState("checking");
    setTimeout(() => {
      setSslState("success");
      setTimeout(() => setStep(4), 700);
    }, 2500);
  };

  const reset = () => {
    setStep(0);
    setDomain("");
    setConfirmedDomain("");
    setVerifyState("idle");
    setSslState("idle");
  };

  const progress = ((step + 1) / STEPS.length) * 100;

  return (
    <section className="relative py-24 px-4">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gold/10 border border-gold/20 mb-4">
            <Globe className="w-4 h-4 text-gold" />
            <span className="text-xs font-medium text-gold uppercase tracking-wider">
              Custom Domain
            </span>
          </div>
          <h2 className="font-display text-4xl md:text-5xl font-bold mb-4">
            Connect your <span className="text-gold">own domain</span>
          </h2>
          <p className="text-muted-foreground text-lg">
            Wire up DNS, verify ownership, and enable SSL — all in a few clicks.
          </p>
        </motion.div>

        <div className="glass-card rounded-2xl p-6 md:p-10 border border-glass-border">
          {/* Stepper */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              {STEPS.map((s, i) => {
                const Icon = s.icon;
                const active = step === s.id;
                const done = step > s.id;
                return (
                  <div key={s.id} className="flex flex-col items-center flex-1 min-w-0">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center border transition-all ${
                        done
                          ? "bg-gold border-gold text-background"
                          : active
                          ? "bg-gold/15 border-gold text-gold shadow-[0_0_20px_-4px_hsl(var(--gold)/0.5)]"
                          : "bg-secondary border-glass-border text-muted-foreground"
                      }`}
                    >
                      {done ? <Check className="w-5 h-5" /> : <Icon className="w-4 h-4" />}
                    </div>
                    <span
                      className={`text-[10px] md:text-xs mt-2 font-medium truncate ${
                        active || done ? "text-foreground" : "text-muted-foreground"
                      }`}
                    >
                      {s.label}
                    </span>
                  </div>
                );
              })}
            </div>
            <Progress value={progress} className="h-1.5" />
          </div>

          {/* Step content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -12 }}
              transition={{ duration: 0.25 }}
            >
              {step === 0 && (
                <div className="space-y-6">
                  {/* Mode Toggle Tabs */}
                  <div className="flex p-1 bg-secondary/80 rounded-xl border border-glass-border">
                    <button
                      type="button"
                      onClick={() => setDomainMode("connect")}
                      className={`flex-1 py-2 text-xs font-medium rounded-lg transition-all ${
                        domainMode === "connect"
                          ? "bg-background text-foreground shadow-sm font-semibold"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      Connect Existing Domain
                    </button>
                    <button
                      type="button"
                      onClick={() => setDomainMode("register")}
                      className={`flex-1 py-2 text-xs font-medium rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                        domainMode === "register"
                          ? "bg-gold text-white shadow-sm font-semibold"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      Register New Domain (at cost)
                    </button>
                  </div>

                  {domainMode === "connect" ? (
                    <div className="space-y-5">
                      <div>
                        <h3 className="font-display text-2xl font-semibold mb-2">
                          Enter your existing domain
                        </h3>
                        <p className="text-muted-foreground text-sm">
                          Use a domain you already own (GoDaddy, Namecheap, Google, etc.). We'll generate the DNS records you need.
                        </p>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="domain">Domain name</Label>
                        <Input
                          id="domain"
                          placeholder="mysite.com"
                          value={domain}
                          onChange={(e) => setDomain(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && handleStartDomain()}
                          className="bg-secondary border-glass-border h-12"
                        />
                        <p className="text-xs text-muted-foreground">
                          No <code className="text-gold">http://</code> or paths — just the apex domain.
                        </p>
                      </div>
                      <Button variant="hero" size="lg" onClick={handleStartDomain} className="w-full">
                        Continue to DNS Setup <ArrowRight className="w-4 h-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-5">
                      <div>
                        <h3 className="font-display text-2xl font-semibold mb-2 flex items-center gap-2">
                          <Globe className="w-6 h-6 text-gold" />
                          Register Domain via Cloudflare
                        </h3>
                        <p className="text-muted-foreground text-sm">
                          Direct registration with wholesale pricing, zero markup, free WHOIS privacy, and automatic DNS routing.
                        </p>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="reg-domain">Desired Domain</Label>
                        <div className="flex gap-2">
                          <Input
                            id="reg-domain"
                            placeholder="e.g. thevalkyries.com"
                            value={domain}
                            onChange={(e) => setDomain(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleSearchRegistrar()}
                            className="bg-secondary border-glass-border h-12"
                          />
                          <Button
                            variant="hero"
                            onClick={() => handleSearchRegistrar()}
                            disabled={isSearchingReg}
                            className="h-12 px-6 shrink-0"
                          >
                            {isSearchingReg ? <Loader2 className="w-4 h-4 animate-spin" /> : "Check"}
                          </Button>
                        </div>
                      </div>

                      {/* Extension Shortcuts */}
                      <div className="flex flex-wrap items-center gap-1.5 pt-1">
                        <span className="text-xs font-mono text-muted-foreground mr-1">Popular:</span>
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
                              const base = domain ? domain.split(".")[0] : "artistname";
                              const cand = `${base}.${ext.tld}`;
                              setDomain(cand);
                              handleSearchRegistrar(cand);
                            }}
                            className="text-xs font-mono px-2.5 py-1 rounded-md bg-secondary border border-glass-border hover:border-gold/60 text-muted-foreground hover:text-foreground transition-all"
                          >
                            .{ext.tld} (${ext.price}/yr)
                          </button>
                        ))}
                      </div>

                      {regResult && (
                        <div className="p-4 rounded-xl bg-secondary/50 border border-gold/40 space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <CheckCircle2 className="w-5 h-5 text-gold" />
                              <span className="font-mono text-base font-semibold text-foreground">
                                {regResult.domain}
                              </span>
                            </div>
                            <span className="font-mono text-sm font-bold text-gold px-2.5 py-1 rounded bg-gold/10">
                              ${regResult.wholesalePriceUsd.toFixed(2)}/year
                            </span>
                          </div>

                          <div className="text-xs text-muted-foreground space-y-1">
                            <p>✓ Free WHOIS Privacy Guard included</p>
                            <p>✓ Automatic Cloudflare DNSSEC & SSL configuration</p>
                            <p>✓ Zero-downtime edge CDN integration</p>
                          </div>

                          <Button
                            variant="hero"
                            size="lg"
                            onClick={handleRegisterDomain}
                            disabled={isRegistering}
                            className="w-full mt-2"
                          >
                            {isRegistering ? (
                              <>
                                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                Provisioning Registration...
                              </>
                            ) : (
                              `Register & Connect ${regResult.domain}`
                            )}
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {step === 1 && (
                <div className="space-y-5">
                  <div>
                    <h3 className="font-display text-2xl font-semibold mb-2">
                      Add these DNS records
                    </h3>
                    <p className="text-muted-foreground text-sm">
                      Sign in to your registrar (GoDaddy, Namecheap, Cloudflare, etc.) and add the
                      following records for{" "}
                      <span className="text-gold font-medium">{confirmedDomain}</span>.
                    </p>
                  </div>

                  <div className="space-y-3">
                    {dnsRecords.map((r, i) => (
                      <div
                        key={i}
                        className="rounded-xl border border-glass-border bg-secondary/40 p-4 space-y-3"
                      >
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                          <Field label="Type" value={r.type} />
                          <Field label="Name" value={r.name} />
                          <div className="md:col-span-1 col-span-2">
                            <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
                              TTL
                            </div>
                            <div className="font-mono text-foreground">{r.ttl}</div>
                          </div>
                          <div className="col-span-2 md:col-span-1">
                            <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
                              Value
                            </div>
                            <div className="font-mono text-foreground truncate" title={r.value}>
                              {r.value}
                            </div>
                          </div>
                        </div>
                        <Button
                          variant="glass"
                          size="sm"
                          onClick={() => copy(`r${i}`, r.value)}
                          className="w-full"
                        >
                          {copiedKey === `r${i}` ? (
                            <>
                              <Check className="w-4 h-4" /> Copied
                            </>
                          ) : (
                            <>
                              <Copy className="w-4 h-4" /> Copy value
                            </>
                          )}
                        </Button>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-start gap-2 rounded-lg bg-gold/5 border border-gold/20 p-3 text-xs text-muted-foreground">
                    <AlertCircle className="w-4 h-4 text-gold shrink-0 mt-0.5" />
                    <span>
                      DNS changes can take from a few minutes up to 72 hours to propagate. Once
                      added, click Verify.
                    </span>
                  </div>

                  <div className="flex gap-3">
                    <Button variant="glass" onClick={() => setStep(0)} className="flex-1">
                      <ArrowLeft className="w-4 h-4" /> Back
                    </Button>
                    <Button variant="hero" onClick={() => setStep(2)} className="flex-1">
                      I've added them <ArrowRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-5">
                  <div>
                    <h3 className="font-display text-2xl font-semibold mb-2">
                      Verify ownership
                    </h3>
                    <p className="text-muted-foreground text-sm">
                      We'll check that your DNS records are pointing to A List Webs.
                    </p>
                  </div>

                  <div className="rounded-xl border border-glass-border bg-secondary/40 p-6 flex flex-col items-center text-center">
                    {verifyState === "idle" && (
                      <>
                        <div className="w-14 h-14 rounded-full bg-gold/10 flex items-center justify-center mb-3">
                          <Server className="w-7 h-7 text-gold" />
                        </div>
                        <p className="text-sm text-muted-foreground mb-4">
                          Ready to check DNS for{" "}
                          <span className="text-foreground font-medium">{confirmedDomain}</span>
                        </p>
                        <Button variant="hero" onClick={runVerification}>
                          Run verification
                        </Button>
                      </>
                    )}
                    {verifyState === "checking" && (
                      <>
                        <Loader2 className="w-10 h-10 text-gold animate-spin mb-3" />
                        <p className="text-sm text-muted-foreground">Checking DNS records…</p>
                      </>
                    )}
                    {verifyState === "success" && (
                      <>
                        <div className="w-14 h-14 rounded-full bg-green-500/10 flex items-center justify-center mb-3">
                          <CheckCircle2 className="w-8 h-8 text-green-500" />
                        </div>
                        <p className="font-medium text-foreground">DNS records verified</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Moving on to SSL certificate…
                        </p>
                      </>
                    )}
                    {verifyState === "failed" && (
                      <>
                        <div className="w-14 h-14 rounded-full bg-destructive/10 flex items-center justify-center mb-3">
                          <AlertCircle className="w-8 h-8 text-destructive" />
                        </div>
                        <p className="font-medium text-foreground">Could not verify DNS</p>
                        <p className="text-xs text-muted-foreground mt-1 mb-4 max-w-sm">
                          Records might still be propagating, or values don't match. Double-check
                          and try again.
                        </p>
                        <div className="flex gap-2">
                          <Button variant="glass" size="sm" onClick={() => setStep(1)}>
                            Review records
                          </Button>
                          <Button variant="hero" size="sm" onClick={runVerification}>
                            Retry
                          </Button>
                        </div>
                      </>
                    )}
                  </div>

                  {verifyState === "idle" && (
                    <Button variant="glass" onClick={() => setStep(1)} className="w-full">
                      <ArrowLeft className="w-4 h-4" /> Back to records
                    </Button>
                  )}
                </div>
              )}

              {step === 3 && (
                <div className="space-y-5">
                  <div>
                    <h3 className="font-display text-2xl font-semibold mb-2">Provision SSL</h3>
                    <p className="text-muted-foreground text-sm">
                      We'll automatically issue a free SSL certificate so your site loads over
                      HTTPS.
                    </p>
                  </div>

                  <div className="rounded-xl border border-glass-border bg-secondary/40 p-6 flex flex-col items-center text-center">
                    {sslState === "idle" && (
                      <>
                        <div className="w-14 h-14 rounded-full bg-gold/10 flex items-center justify-center mb-3">
                          <ShieldCheck className="w-7 h-7 text-gold" />
                        </div>
                        <p className="text-sm text-muted-foreground mb-4">
                          Issue certificate via Let's Encrypt
                        </p>
                        <Button variant="hero" onClick={runSsl}>
                          Enable HTTPS
                        </Button>
                      </>
                    )}
                    {sslState === "checking" && (
                      <>
                        <Loader2 className="w-10 h-10 text-gold animate-spin mb-3" />
                        <p className="text-sm text-muted-foreground">Issuing certificate…</p>
                      </>
                    )}
                    {sslState === "success" && (
                      <>
                        <div className="w-14 h-14 rounded-full bg-green-500/10 flex items-center justify-center mb-3">
                          <ShieldCheck className="w-8 h-8 text-green-500" />
                        </div>
                        <p className="font-medium text-foreground">SSL certificate active</p>
                      </>
                    )}
                  </div>
                </div>
              )}

              {step === 4 && (
                <div className="text-center py-6 space-y-4">
                  <motion.div
                    initial={{ scale: 0.6, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 200 }}
                    className="w-20 h-20 rounded-full bg-gradient-to-br from-gold to-gold-dark flex items-center justify-center mx-auto shadow-[0_0_40px_-8px_hsl(var(--gold)/0.6)]"
                  >
                    <Sparkles className="w-10 h-10 text-background" />
                  </motion.div>
                  <h3 className="font-display text-3xl font-bold">You're live</h3>
                  <p className="text-muted-foreground">
                    Your site is now reachable at{" "}
                    <a
                      href={`https://${confirmedDomain}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-gold hover:underline font-medium"
                    >
                      https://{confirmedDomain}
                    </a>
                  </p>
                  <Button variant="glass" onClick={reset} className="mt-2">
                    Connect another domain
                  </Button>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
};

const Field = ({ label, value }: { label: string; value: string }) => (
  <div>
    <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">{label}</div>
    <div className="font-mono text-foreground">{value}</div>
  </div>
);

export default DomainWizard;

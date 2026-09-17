import { useState, useEffect, useCallback } from "react";
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
import { CreditCard, Receipt, ExternalLink, ShieldCheck, AlertCircle, Sparkles, Loader2, Download, ShoppingBag } from "lucide-react";
import { openBillingPortal, getInvoices, getStripeConfig, StripeInvoice } from "@/lib/stripe";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import ManagedPaymentsTester from "@/components/ManagedPaymentsTester";

interface BillingManagerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultEmail?: string;
}

export default function BillingManagerModal({
  open,
  onOpenChange,
  defaultEmail = "",
}: BillingManagerModalProps) {
  const { user } = useAuth();
  const [email, setEmail] = useState(defaultEmail || user?.email || "");
  const [isConfigured, setIsConfigured] = useState<boolean>(true);
  const [loadingPortal, setLoadingPortal] = useState(false);
  const [loadingInvoices, setLoadingInvoices] = useState(false);
  const [invoices, setInvoices] = useState<StripeInvoice[]>([]);
  const [managedPaymentsOpen, setManagedPaymentsOpen] = useState(false);

  const checkConfigAndInvoices = useCallback(async () => {
    const config = await getStripeConfig();
    setIsConfigured(config.isConfigured);

    if (email && config.isConfigured) {
      setLoadingInvoices(true);
      try {
        const invs = await getInvoices(email);
        setInvoices(invs);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingInvoices(false);
      }
    }
  }, [email]);

  useEffect(() => {
    if (user?.email && !email) {
      setEmail(user.email);
    }
  }, [user, email]);

  useEffect(() => {
    if (open) {
      checkConfigAndInvoices();
    }
  }, [open, checkConfigAndInvoices]);

  const handleOpenPortal = async () => {
    if (!email) {
      toast.error("Please enter your billing email address.");
      return;
    }

    setLoadingPortal(true);
    try {
      const result = await openBillingPortal(email);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      if (result.url) {
        window.location.href = result.url;
      }
    } catch (err) {
      toast.error("Unable to connect to Stripe Billing Portal.");
    } finally {
      setLoadingPortal(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl glass-card border-gold/30 bg-background/95 backdrop-blur-xl">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gold/15 flex items-center justify-center text-gold border border-gold/30">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle className="font-display text-2xl font-bold shiny-gold-header flex items-center gap-2">
                Billing & Invoices
                {isConfigured ? (
                  <Badge variant="outline" className="text-xs bg-gold/10 text-gold border-gold/30">
                    <ShieldCheck className="w-3 h-3 mr-1 text-emerald-400" />
                    Stripe Active
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-xs bg-amber-500/10 text-amber-300 border-amber-500/30">
                    <AlertCircle className="w-3 h-3 mr-1 text-amber-400" />
                    Setup Pending
                  </Badge>
                )}
              </DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground">
                Manage your subscription, update payment methods, and download VAT receipts.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {!isConfigured && (
          <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-200 space-y-1">
            <div className="flex items-center gap-1.5 font-semibold text-amber-300">
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
              Stripe API Key Needed
            </div>
            <p className="text-muted-foreground leading-relaxed">
              Add your <code className="text-gold font-mono bg-black/40 px-1 py-0.5 rounded">STRIPE_SECRET_KEY</code> in Settings to enable direct live billing and automated invoicing.
            </p>
          </div>
        )}

        <div className="space-y-6 pt-2">
          {/* Customer Email Input */}
          <div className="space-y-2">
            <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
              Account Billing Email
            </label>
            <div className="flex gap-2">
              <Input
                type="email"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-black/30 border-white/10 text-foreground"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={checkConfigAndInvoices}
                className="border-gold/30 hover:bg-gold/10 text-xs"
              >
                Refresh
              </Button>
            </div>
          </div>

          {/* Stripe Customer Portal Launcher */}
          <div className="p-4 rounded-2xl border border-glass-border bg-white/[0.02] flex items-center justify-between">
            <div className="space-y-1 pr-4">
              <div className="font-semibold text-sm text-foreground flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-gold" />
                Stripe Customer Portal
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Update card info, switch subscription tiers, or cancel your active plan directly via Stripe.
              </p>
            </div>
            <Button
              variant="hero"
              size="sm"
              onClick={handleOpenPortal}
              disabled={loadingPortal || !isConfigured}
              className="shrink-0 gap-1.5 text-xs"
            >
              {loadingPortal ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Connecting...
                </>
              ) : (
                <>
                  Launch Portal
                  <ExternalLink className="w-3.5 h-3.5" />
                </>
              )}
            </Button>
          </div>

          {/* Managed Payments Digital Store Card */}
          <div className="p-4 rounded-2xl border border-gold/30 bg-gold/[0.03] flex items-center justify-between">
            <div className="space-y-1 pr-4">
              <div className="font-semibold text-sm text-foreground flex items-center gap-1.5">
                <ShoppingBag className="w-4 h-4 text-gold" />
                Managed Payments & Digital Store
                <Badge className="bg-gold/20 text-gold text-[10px] px-1.5 py-0 border-gold/40">2026.02 Preview</Badge>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Create digital items with tax codes (e.g. Hamlet e-book), run managed checkout sessions, and test tax calculation by ZIP code.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setManagedPaymentsOpen(true)}
              className="shrink-0 gap-1.5 text-xs border-gold/40 text-gold hover:bg-gold/10"
            >
              Open Studio
              <ExternalLink className="w-3.5 h-3.5" />
            </Button>
          </div>

          {/* Invoices List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Receipt className="w-3.5 h-3.5 text-gold" />
                Recent Invoices & Receipts
              </span>
              <span className="text-[11px] text-muted-foreground">
                {invoices.length} invoice{invoices.length === 1 ? "" : "s"} found
              </span>
            </div>

            {loadingInvoices ? (
              <div className="flex items-center justify-center py-6 text-muted-foreground text-xs gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-gold" />
                Fetching invoices from Stripe...
              </div>
            ) : invoices.length > 0 ? (
              <div className="max-h-56 overflow-y-auto space-y-2 pr-1">
                {invoices.map((inv) => (
                  <div
                    key={inv.id}
                    className="p-3 rounded-xl border border-white/10 bg-black/40 flex items-center justify-between text-xs hover:border-gold/30 transition-colors"
                  >
                    <div>
                      <div className="font-semibold text-foreground flex items-center gap-2">
                        <span>Invoice {inv.number || inv.id.slice(0, 12)}</span>
                        <Badge
                          variant="outline"
                          className={`text-[10px] uppercase font-mono ${
                            inv.status === "paid"
                              ? "text-emerald-400 border-emerald-500/30 bg-emerald-500/10"
                              : "text-amber-400 border-amber-500/30 bg-amber-500/10"
                          }`}
                        >
                          {inv.status}
                        </Badge>
                      </div>
                      <div className="text-muted-foreground text-[11px]">
                        {new Date(inv.created * 1000).toLocaleDateString()} •{" "}
                        {(inv.amount_paid / 100).toLocaleString("en-US", {
                          style: "currency",
                          currency: inv.currency || "USD",
                        })}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {inv.hosted_invoice_url && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 px-2 text-xs text-gold hover:text-gold-light"
                          asChild
                        >
                          <a
                            href={inv.hosted_invoice_url}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            View
                            <ExternalLink className="w-3 h-3 ml-1" />
                          </a>
                        </Button>
                      )}
                      {inv.invoice_pdf && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 px-2 text-xs border-white/10 hover:border-gold/30"
                          asChild
                        >
                          <a href={inv.invoice_pdf} target="_blank" rel="noopener noreferrer">
                            <Download className="w-3 h-3 mr-1" />
                            PDF
                          </a>
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 rounded-xl border border-white/5 bg-black/20 text-center text-xs text-muted-foreground">
                No Stripe invoices found for this email address yet. Once you complete a checkout session, generated invoices and PDF receipts will appear here automatically.
              </div>
            )}
          </div>
        </div>
      </DialogContent>

      <ManagedPaymentsTester
        open={managedPaymentsOpen}
        onOpenChange={setManagedPaymentsOpen}
      />
    </Dialog>
  );
}

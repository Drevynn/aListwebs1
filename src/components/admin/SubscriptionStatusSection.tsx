import React, { useState, useMemo } from "react";
import { AdminSubscriptionRecord, UserProfile } from "@/types";
import {
  CreditCard,
  Search,
  CheckCircle2,
  Clock,
  AlertCircle,
  XCircle,
  Copy,
  Check,
  Download,
  ExternalLink,
  Sparkles,
  ShieldCheck,
  RefreshCw,
  TrendingUp,
  Receipt,
  Mail,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface SubscriptionStatusSectionProps {
  subscriptions: AdminSubscriptionRecord[];
  users: UserProfile[];
  mrrCents: number;
  arrCents: number;
  isStripeConfigured: boolean;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export const SubscriptionStatusSection: React.FC<SubscriptionStatusSectionProps> = ({
  subscriptions,
  users,
  mrrCents,
  arrCents,
  isStripeConfigured,
  onRefresh,
  isRefreshing,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [tierFilter, setTierFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const formatUSD = (cents: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(cents / 100);
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(text);
    toast.success(`Copied ${label} to clipboard`);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Combine live subscriptions from Stripe and Firestore users
  const consolidatedList = useMemo(() => {
    const list: AdminSubscriptionRecord[] = [...subscriptions];
    const existingEmails = new Set(subscriptions.map((s) => s.customerEmail?.toLowerCase()));

    // Integrate users from Firestore who may not have a live Stripe session yet
    users.forEach((user) => {
      if (user.email && !existingEmails.has(user.email.toLowerCase())) {
        const tier = user.subscriptionTier || "free";
        const isPaid = tier === "monthly" || tier === "biannual" || tier === "yearly";
        const amountCents = tier === "yearly" ? 39700 : tier === "biannual" ? 23400 : tier === "monthly" ? 4700 : 0;

        list.push({
          id: user.stripeSubscriptionId || `sub_user_${user.id.slice(0, 8)}`,
          customerId: user.stripeCustomerId || `cus_user_${user.id.slice(0, 8)}`,
          customerEmail: user.email,
          customerName: undefined,
          status: user.subscriptionStatus || (isPaid ? "active" : "free"),
          planId: tier,
          planName:
            tier === "yearly"
              ? "Annual Sovereign ($397/yr)"
              : tier === "biannual"
              ? "Bi-Annual Pro ($234/6mo)"
              : tier === "monthly"
              ? "Monthly Creator ($47/mo)"
              : "Free Creator Tier",
          tier,
          interval: tier === "yearly" ? "year" : tier === "biannual" ? "6 months" : tier === "monthly" ? "month" : "none",
          amountCents,
          currency: "usd",
          currentPeriodEnd: new Date(Date.now() + 30 * 86400000).toISOString(),
          createdAt: user.created_at || new Date().toISOString(),
        });
      }
    });

    return list;
  }, [subscriptions, users]);

  // Filter items
  const filteredList = useMemo(() => {
    return consolidatedList.filter((item) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        searchQuery === "" ||
        item.customerEmail?.toLowerCase().includes(q) ||
        item.customerName?.toLowerCase().includes(q) ||
        item.id.toLowerCase().includes(q) ||
        item.customerId.toLowerCase().includes(q) ||
        item.planName.toLowerCase().includes(q);

      const matchesTier =
        tierFilter === "all" ||
        item.tier.toLowerCase() === tierFilter.toLowerCase();

      const matchesStatus =
        statusFilter === "all" ||
        item.status.toLowerCase() === statusFilter.toLowerCase();

      return matchesSearch && matchesTier && matchesStatus;
    });
  }, [consolidatedList, searchQuery, tierFilter, statusFilter]);

  // Export to CSV
  const exportCSV = () => {
    const headers = ["Customer Email,Name,Plan Tier,Billing Interval,Amount (USD),Status,Stripe Customer ID,Stripe Subscription ID,Renewal Date,Domain Upsell"];
    const rows = filteredList.map((item) =>
      `"${item.customerEmail}","${item.customerName || ''}","${item.planName}","${item.interval}","${(item.amountCents / 100).toFixed(2)}","${item.status}","${item.customerId}","${item.id}","${item.currentPeriodEnd ? new Date(item.currentPeriodEnd).toLocaleDateString() : ''}","${item.domainUpsell || ''}"`
    );
    const blob = new Blob([[headers, ...rows].join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `alistwebs_subscribers_${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
    toast.success("Subscriber report exported to CSV");
  };

  const activeCount = consolidatedList.filter((s) => s.status === "active").length;
  const monthlyCount = consolidatedList.filter((s) => s.tier === "monthly").length;
  const biannualCount = consolidatedList.filter((s) => s.tier === "biannual").length;
  const yearlyCount = consolidatedList.filter((s) => s.tier === "yearly").length;

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-card/70 border border-glass-border backdrop-blur-md">
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
            <span>Monthly Run Rate</span>
            <Receipt className="w-4 h-4 text-gold" />
          </div>
          <div className="text-2xl font-bold text-foreground font-mono">{formatUSD(mrrCents)}</div>
          <div className="text-xs text-muted-foreground mt-1">ARR: {formatUSD(arrCents)}</div>
        </div>

        <div className="p-4 rounded-2xl bg-card/70 border border-glass-border backdrop-blur-md">
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
            <span>Monthly Creator</span>
            <Badge variant="outline" className="text-xs border-zinc-700 bg-white/5">$47/mo</Badge>
          </div>
          <div className="text-2xl font-bold text-foreground">{monthlyCount}</div>
          <div className="text-xs text-muted-foreground mt-1">Month-to-month flexibility</div>
        </div>

        <div className="p-4 rounded-2xl bg-card/70 border border-glass-border backdrop-blur-md">
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
            <span>Bi-Annual Pro</span>
            <Badge variant="outline" className="text-xs border-gold/30 text-gold bg-gold/10">Save 17%</Badge>
          </div>
          <div className="text-2xl font-bold text-gold">{biannualCount}</div>
          <div className="text-xs text-muted-foreground mt-1">$234 / 6 months</div>
        </div>

        <div className="p-4 rounded-2xl bg-card/70 border border-glass-border backdrop-blur-md">
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
            <span>Annual Sovereign</span>
            <Badge variant="outline" className="text-xs border-purple-500/30 text-purple-400 bg-purple-500/10">Save 30%</Badge>
          </div>
          <div className="text-2xl font-bold text-purple-400">{yearlyCount}</div>
          <div className="text-xs text-muted-foreground mt-1">$397 / full year</div>
        </div>
      </div>

      {/* Main Subscribers Directory */}
      <div className="bg-card/70 border border-glass-border rounded-3xl p-6 backdrop-blur-md">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-gold" />
              User Subscription Statuses
            </h3>
            <p className="text-xs text-muted-foreground">
              Direct telemetry from Stripe Billing API and registered Firestore creator accounts
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
            {onRefresh && (
              <Button
                variant="outline"
                size="sm"
                onClick={onRefresh}
                disabled={isRefreshing}
                className="border-glass-border text-xs h-9"
              >
                <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${isRefreshing ? "animate-spin text-gold" : ""}`} />
                {isRefreshing ? "Syncing..." : "Sync Stripe"}
              </Button>
            )}

            <Button
              variant="outline"
              size="sm"
              onClick={exportCSV}
              disabled={filteredList.length === 0}
              className="border-glass-border text-xs h-9"
            >
              <Download className="w-3.5 h-3.5 mr-1.5" />
              Export CSV
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by customer email, name, or Stripe ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-background/50 border-glass-border text-xs h-9"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              value={tierFilter}
              onChange={(e) => setTierFilter(e.target.value)}
              className="bg-background/80 border border-glass-border rounded-xl px-3 py-1.5 text-xs text-foreground focus:outline-none focus:border-gold/50"
            >
              <option value="all">All Plans</option>
              <option value="monthly">Monthly Creator ($47/mo)</option>
              <option value="biannual">Bi-Annual Pro ($234/6mo)</option>
              <option value="yearly">Annual Sovereign ($397/yr)</option>
              <option value="free">Free Creator Tier</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-background/80 border border-glass-border rounded-xl px-3 py-1.5 text-xs text-foreground focus:outline-none focus:border-gold/50"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="trialing">Trialing</option>
              <option value="past_due">Past Due</option>
              <option value="canceled">Canceled</option>
            </select>
          </div>
        </div>

        {/* Subscribers Table */}
        {filteredList.length === 0 ? (
          <div className="text-center py-16 px-4 rounded-2xl bg-background/30 border border-dashed border-glass-border">
            <CreditCard className="w-12 h-12 text-muted-foreground/40 mx-auto mb-3" />
            <h4 className="text-base font-semibold text-foreground mb-1">No Subscribers Found</h4>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              {searchQuery
                ? `No subscriptions match "${searchQuery}". Try a different filter or search phrase.`
                : "No customer subscriptions recorded yet. As users upgrade their plans via Stripe, they will appear here automatically."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-glass-border text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  <th className="py-3 px-4">User / Customer</th>
                  <th className="py-3 px-4">Plan & Billing</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Renews / Ended</th>
                  <th className="py-3 px-4">Domain Upsell</th>
                  <th className="py-3 px-4 text-right">Stripe Reference</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-sm">
                {filteredList.map((item) => {
                  const isActive = item.status === "active";
                  const isTrial = item.status === "trialing";
                  const isPastDue = item.status === "past_due";
                  const isCanceled = item.status === "canceled";

                  const isYearly = item.tier === "yearly";
                  const isBiannual = item.tier === "biannual";

                  return (
                    <tr key={item.id} className="hover:bg-white/[0.02] transition-colors group">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gold/10 border border-gold/20 flex items-center justify-center text-gold font-semibold text-xs shrink-0">
                            {item.customerEmail ? item.customerEmail.charAt(0).toUpperCase() : "U"}
                          </div>
                          <div className="min-w-0">
                            <div className="font-medium text-foreground text-xs sm:text-sm truncate">
                              {item.customerEmail}
                            </div>
                            {item.customerName && (
                              <div className="text-[11px] text-muted-foreground truncate">
                                {item.customerName}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex flex-col gap-1">
                          <span className={`inline-flex items-center gap-1 font-semibold text-xs ${
                            isYearly ? "text-purple-400" : isBiannual ? "text-gold" : "text-zinc-200"
                          }`}>
                            {item.planName}
                          </span>
                          <span className="text-[11px] font-mono text-muted-foreground">
                            {(item.amountCents / 100).toFixed(2)} {item.currency.toUpperCase()} / {item.interval}
                          </span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                            isActive
                              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                              : isTrial
                              ? "bg-sky-500/10 text-sky-400 border border-sky-500/20"
                              : isPastDue
                              ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                              : "bg-zinc-500/10 text-zinc-400 border border-zinc-500/20"
                          }`}
                        >
                          {isActive ? (
                            <CheckCircle2 className="w-3 h-3" />
                          ) : isTrial ? (
                            <Clock className="w-3 h-3" />
                          ) : isPastDue ? (
                            <AlertCircle className="w-3 h-3" />
                          ) : (
                            <XCircle className="w-3 h-3" />
                          )}
                          <span className="capitalize">{item.status}</span>
                        </span>
                      </td>

                      <td className="py-3.5 px-4 font-mono text-xs text-muted-foreground">
                        {item.currentPeriodEnd ? (
                          new Date(item.currentPeriodEnd).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })
                        ) : (
                          "Continuous"
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-xs font-mono">
                        {item.domainUpsell ? (
                          <span className="inline-flex items-center gap-1 text-sky-400">
                            <Sparkles className="w-3 h-3 text-gold" />
                            {item.domainUpsell}
                          </span>
                        ) : (
                          <span className="text-muted-foreground/40">—</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-right font-mono text-xs">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => copyToClipboard(item.id, "Subscription ID")}
                            className="inline-flex items-center gap-1 text-zinc-400 hover:text-gold transition-colors text-[11px]"
                            title={`Copy ${item.id}`}
                          >
                            {copiedId === item.id ? (
                              <Check className="w-3 h-3 text-emerald-400" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                            <span className="truncate max-w-[80px]">{item.id.slice(0, 10)}...</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

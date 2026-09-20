import React from "react";
import { DollarSign, Globe, Users, TrendingUp, Sparkles } from "lucide-react";

interface AdminStatsRibbonProps {
  totalSites: number;
  publishedSites: number;
  draftSites: number;
  totalSubscribers: number;
  activeSubscribers: number;
  mrrCents: number;
  arrCents: number;
  monthlyCount: number;
  biannualCount: number;
  yearlyCount: number;
  domainsCount: number;
}

export const AdminStatsRibbon: React.FC<AdminStatsRibbonProps> = ({
  totalSites,
  publishedSites,
  draftSites,
  totalSubscribers,
  activeSubscribers,
  mrrCents,
  arrCents,
  monthlyCount,
  biannualCount,
  yearlyCount,
  domainsCount,
}) => {
  const formatUSD = (cents: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(cents / 100);
  };

  const publishRatio = totalSites > 0 ? Math.round((publishedSites / totalSites) * 100) : 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {/* MRR & Revenue */}
      <div className="bg-card/70 border border-glass-border rounded-2xl p-5 backdrop-blur-md relative overflow-hidden group hover:border-gold/30 transition-all duration-300">
        <div className="absolute top-0 right-0 p-4 text-gold/10 group-hover:text-gold/20 transition-colors">
          <DollarSign className="w-16 h-16 -mr-4 -mt-4 pointer-events-none" />
        </div>
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Monthly Run Rate (MRR)
          </span>
          <span className="p-1.5 rounded-lg bg-gold/10 text-gold text-xs font-mono font-medium">
            ARR {formatUSD(arrCents)}
          </span>
        </div>
        <div className="text-3xl font-extrabold text-foreground tracking-tight mb-2">
          {formatUSD(mrrCents)}
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1 text-emerald-400 font-medium">
            <TrendingUp className="w-3.5 h-3.5" /> Active Billing
          </span>
          <span>• {activeSubscribers} active accounts</span>
        </div>
      </div>

      {/* Subscription Breakdown */}
      <div className="bg-card/70 border border-glass-border rounded-2xl p-5 backdrop-blur-md relative overflow-hidden group hover:border-gold/30 transition-all duration-300">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Subscriber Base
          </span>
          <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 text-xs font-mono font-medium">
            {totalSubscribers} Total
          </span>
        </div>
        <div className="text-3xl font-extrabold text-foreground tracking-tight mb-2">
          {activeSubscribers} <span className="text-sm font-normal text-muted-foreground">Paid</span>
        </div>
        <div className="flex flex-wrap items-center gap-1.5 text-[11px] font-mono text-muted-foreground">
          <span className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-zinc-300">
            {monthlyCount} Mo ($47)
          </span>
          <span className="px-1.5 py-0.5 rounded bg-gold/10 border border-gold/20 text-gold">
            {biannualCount} Bi-An ($234)
          </span>
          <span className="px-1.5 py-0.5 rounded bg-purple-500/10 border border-purple-500/20 text-purple-300">
            {yearlyCount} Ann ($397)
          </span>
        </div>
      </div>

      {/* Site Creation Telemetry */}
      <div className="bg-card/70 border border-glass-border rounded-2xl p-5 backdrop-blur-md relative overflow-hidden group hover:border-gold/30 transition-all duration-300">
        <div className="absolute top-0 right-0 p-4 text-emerald-500/10 group-hover:text-emerald-500/20 transition-colors">
          <Globe className="w-16 h-16 -mr-4 -mt-4 pointer-events-none" />
        </div>
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Total Sites Created
          </span>
          <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 text-xs font-mono font-medium">
            {publishRatio}% Live
          </span>
        </div>
        <div className="text-3xl font-extrabold text-foreground tracking-tight mb-2">
          {totalSites}
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="text-emerald-400 font-medium">{publishedSites} Published</span>
          <span>•</span>
          <span className="text-amber-400 font-medium">{draftSites} Drafts</span>
        </div>
      </div>

      {/* Sovereign Custom Domains */}
      <div className="bg-card/70 border border-glass-border rounded-2xl p-5 backdrop-blur-md relative overflow-hidden group hover:border-gold/30 transition-all duration-300">
        <div className="absolute top-0 right-0 p-4 text-sky-500/10 group-hover:text-sky-500/20 transition-colors">
          <Sparkles className="w-16 h-16 -mr-4 -mt-4 pointer-events-none" />
        </div>
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Custom Domains
          </span>
          <span className="p-1.5 rounded-lg bg-sky-500/10 text-sky-400 text-xs font-mono font-medium">
            Cloudflare DNS
          </span>
        </div>
        <div className="text-3xl font-extrabold text-foreground tracking-tight mb-2">
          {domainsCount}
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="text-sky-400 font-medium">Wholesale Registrar</span>
          <span>• Free SSL/DNSSEC</span>
        </div>
      </div>
    </div>
  );
};

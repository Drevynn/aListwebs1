import React from "react";
import { Link } from "react-router-dom";
import {
  ShieldCheck,
  Globe,
  CreditCard,
  RefreshCw,
  ArrowLeft,
  Sparkles,
  Database,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface AdminHeaderProps {
  adminEmail: string;
  activeTab: "analytics" | "subscriptions";
  setActiveTab: (tab: "analytics" | "subscriptions") => void;
  onRefresh: () => void;
  isRefreshing: boolean;
  totalSites: number;
  totalSubscribers: number;
  isStripeConfigured: boolean;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({
  adminEmail,
  activeTab,
  setActiveTab,
  onRefresh,
  isRefreshing,
  totalSites,
  totalSubscribers,
  isStripeConfigured,
}) => {
  return (
    <div className="border-b border-glass-border bg-card/40 backdrop-blur-xl mb-8 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-6">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
        {/* Left info */}
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Creative Studio
            </Link>
            <span className="text-muted-foreground/40">/</span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold tracking-wide uppercase bg-gold/10 text-gold border border-gold/20">
              <ShieldCheck className="w-3.5 h-3.5" />
              Admin Portal
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            Platform Operations & Telemetry
          </h1>

          <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1.5 text-foreground font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              {adminEmail}
            </span>
            <span>•</span>
            <span className="inline-flex items-center gap-1 text-emerald-400">
              <Database className="w-3.5 h-3.5" /> Firestore Active
            </span>
            <span>•</span>
            <span className={`inline-flex items-center gap-1 ${isStripeConfigured ? "text-emerald-400" : "text-amber-400"}`}>
              <CreditCard className="w-3.5 h-3.5" />
              {isStripeConfigured ? "Stripe Live" : "Stripe Test Mode"}
            </span>
          </div>
        </div>

        {/* Right Tab Switcher & Actions */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="inline-flex p-1 rounded-2xl bg-background/80 border border-glass-border backdrop-blur-md">
            <button
              onClick={() => setActiveTab("analytics")}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                activeTab === "analytics"
                  ? "bg-gold text-black shadow-md shadow-gold/20"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Globe className="w-4 h-4" />
              Site Analytics ({totalSites})
            </button>
            <button
              onClick={() => setActiveTab("subscriptions")}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                activeTab === "subscriptions"
                  ? "bg-gold text-black shadow-md shadow-gold/20"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <CreditCard className="w-4 h-4" />
              Subscriptions ({totalSubscribers})
            </button>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            disabled={isRefreshing}
            className="border-glass-border hover:bg-white/5 h-10 px-3 text-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin text-gold" : ""}`} />
            <span className="hidden sm:inline ml-1.5">{isRefreshing ? "Refreshing..." : "Refresh"}</span>
          </Button>

          <Button
            asChild
            size="sm"
            className="bg-gold hover:bg-gold-light text-black font-semibold h-10 px-4 text-xs shadow-md shadow-gold/15"
          >
            <Link to="/build">
              <Sparkles className="w-3.5 h-3.5 mr-1.5" />
              Launch AI Builder
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

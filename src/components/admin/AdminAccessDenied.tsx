import React from "react";
import { Link } from "react-router-dom";
import { ShieldAlert, LogIn, ArrowLeft, RefreshCw, KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AdminAccessDeniedProps {
  userEmail?: string | null;
  onRefresh?: () => void;
  isVerifying?: boolean;
}

export const AdminAccessDenied: React.FC<AdminAccessDeniedProps> = ({
  userEmail,
  onRefresh,
  isVerifying,
}) => {
  const isNotLoggedIn = !userEmail;

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-16">
      <div className="max-w-md w-full bg-card/90 border border-red-500/20 rounded-3xl p-8 shadow-2xl backdrop-blur-xl text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto text-red-400">
          <ShieldAlert className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold tracking-wide uppercase bg-red-500/10 text-red-400 border border-red-500/20">
            Access Restricted
          </span>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">
            {isNotLoggedIn ? "Authentication Required" : "Administrator Privileges Required"}
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {isNotLoggedIn
              ? "The AlistWebs Administrator Dashboard contains protected subscription statuses and site telemetry. Please sign in with an authorized administrator account."
              : `You are currently authenticated as ${userEmail}. This account does not possess verified administrator permissions.`}
          </p>
        </div>

        {!isNotLoggedIn && (
          <div className="p-3.5 rounded-xl bg-background/60 border border-glass-border text-xs text-muted-foreground space-y-1 text-left font-mono">
            <div className="flex justify-between">
              <span className="text-zinc-400">Current Role:</span>
              <span className="text-amber-400 font-semibold">Standard Creator</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-400">Authorized Domain:</span>
              <span className="text-gold font-semibold">@alistwebs.com</span>
            </div>
          </div>
        )}

        <div className="flex flex-col gap-3 pt-2">
          {isNotLoggedIn ? (
            <Button
              asChild
              className="w-full bg-gold hover:bg-gold-light text-black font-semibold h-11 shadow-lg shadow-gold/20"
            >
              <Link to="/auth?redirect=/admin">
                <LogIn className="w-4 h-4 mr-2" />
                Sign In as Administrator
              </Link>
            </Button>
          ) : (
            <>
              {onRefresh && (
                <Button
                  onClick={onRefresh}
                  disabled={isVerifying}
                  variant="outline"
                  className="w-full border-glass-border hover:bg-white/5 h-11"
                >
                  <RefreshCw className={`w-4 h-4 mr-2 ${isVerifying ? "animate-spin text-gold" : ""}`} />
                  {isVerifying ? "Re-verifying Privileges..." : "Re-check Privileges"}
                </Button>
              )}
              <Button
                asChild
                className="w-full bg-gold hover:bg-gold-light text-black font-semibold h-11"
              >
                <Link to="/auth?redirect=/admin">
                  <KeyRound className="w-4 h-4 mr-2" />
                  Switch to Admin Account
                </Link>
              </Button>
            </>
          )}

          <Button
            asChild
            variant="ghost"
            className="w-full text-muted-foreground hover:text-foreground"
          >
            <Link to="/">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Return to Creative Suite
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from "react";
import { X, Plus, Mail, AtSign, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface AddMailboxModalProps {
  isOpen: boolean;
  onClose: () => void;
  domain: string;
  userId?: string;
  onMailboxCreated: () => void;
}

export const AddMailboxModal: React.FC<AddMailboxModalProps> = ({
  isOpen,
  onClose,
  domain,
  userId,
  onMailboxCreated,
}) => {
  const [prefix, setPrefix] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPrefix = prefix.trim().toLowerCase().replace(/[^a-z0-9._-]/g, "");
    if (!cleanPrefix) {
      toast.error("Please enter a mailbox name (e.g. 'merch' or 'licensing').");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/mail/mailboxes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: userId || "user_default",
          domain: domain || "alistwebs.com",
          prefix: cleanPrefix,
          displayName: displayName.trim() || `${cleanPrefix.toUpperCase()} Desk`,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create mailbox");

      toast.success(`Mailbox ${cleanPrefix}@${domain} created successfully!`);
      onMailboxCreated();
      onClose();
    } catch (err: unknown) {
      console.error("Create mailbox error:", err);
      const msg = err instanceof Error ? err.message : "Failed to create mailbox";
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-card border border-glass-border rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-glass-border bg-card/60">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gold/15 border border-gold/30 flex items-center justify-center text-gold">
              <Plus className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground text-sm sm:text-base">Provision New Domain Mailbox</h3>
              <p className="text-xs text-muted-foreground font-mono">Custom address on @{domain}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-muted-foreground mb-1.5">
              Mailbox Prefix
            </label>
            <div className="relative flex items-center">
              <Input
                type="text"
                placeholder="merch, licensing, tour, vip"
                value={prefix}
                onChange={(e) => setPrefix(e.target.value)}
                required
                className="font-mono text-sm bg-background border-glass-border focus:border-gold/60 pr-32"
              />
              <span className="absolute right-3 text-xs font-mono text-muted-foreground pointer-events-none">
                @{domain}
              </span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-muted-foreground mb-1.5">
              Display Name / Title (Optional)
            </label>
            <Input
              type="text"
              placeholder="e.g. VIP Merch Desk, Global Sync Inquiries"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="text-sm bg-background border-glass-border focus:border-gold/60"
            />
          </div>

          <div className="p-3 rounded-xl bg-background/50 border border-glass-border text-xs text-muted-foreground font-mono">
            <div className="flex items-center gap-1 text-gold font-semibold mb-0.5">
              <Sparkles className="w-3 h-3" />
              <span>Instant Edge Activation:</span>
            </div>
            <span>Your new address inherits automated SPF & DKIM DNS records immediately.</span>
          </div>

          <div className="flex items-center justify-between pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="border-glass-border text-muted-foreground hover:text-foreground"
            >
              Cancel
            </Button>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-gold hover:bg-gold/90 text-black font-semibold shadow-lg shadow-gold/20"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Mailbox
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

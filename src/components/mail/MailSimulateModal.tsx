import React, { useState } from "react";
import { X, Sparkles, Inbox, Calendar, Newspaper, Heart, Film, Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Mailbox } from "@/types";
import { toast } from "sonner";

interface MailSimulateModalProps {
  isOpen: boolean;
  onClose: () => void;
  mailboxes: Mailbox[];
  domain: string;
  userId?: string;
  onInboundReceived: () => void;
}

export const MailSimulateModal: React.FC<MailSimulateModalProps> = ({
  isOpen,
  onClose,
  mailboxes,
  domain,
  userId,
  onInboundReceived,
}) => {
  const [targetAddress, setTargetAddress] = useState(mailboxes[0]?.address || `booking@${domain || "alistwebs.com"}`);
  const [selectedScenario, setSelectedScenario] = useState<"booking" | "press" | "fan" | "sync">("booking");
  const [isSimulating, setIsSimulating] = useState(false);

  if (!isOpen) return null;

  const scenarios = [
    {
      id: "booking" as const,
      icon: Calendar,
      title: "Festival / Tour Booking Offer",
      sender: "Laura Miller (Paradigm Tour Bookings)",
      summary: "8-City North American Club Tour direct support offer ($2,500/night + 100% merch).",
      tag: "Tour Booking",
    },
    {
      id: "press" as const,
      icon: Newspaper,
      title: "Music Review & Feature Interview",
      sender: "David Cole (Pitchfork Features)",
      summary: "Exclusive 30-minute interview and rehearsal photo shoot for breakthrough artist spotlight.",
      tag: "Press & EPK",
    },
    {
      id: "fan" as const,
      icon: Heart,
      title: "VIP Fan Club Pre-Order Question",
      sender: "Sarah Jenkins (VIP Fan Club)",
      summary: "Inquiry on transparent smoke vinyl variant and soundcheck early entry passes.",
      tag: "Direct to Fan",
    },
    {
      id: "sync" as const,
      icon: Film,
      title: "Hollywood Trailer Sync Licensing",
      sender: "James Morrison (Music Supervisor)",
      summary: "End-credits master synchronization inquiry for global streaming docuseries.",
      tag: "Sync Licensing",
    },
  ];

  const handleSimulate = async () => {
    setIsSimulating(true);
    try {
      const res = await fetch("/api/mail/simulate-incoming", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: userId || "user_default",
          domain: domain || "alistwebs.com",
          toAddress: targetAddress,
          scenario: selectedScenario,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Simulation failed");

      toast.success(`Incoming email received from ${data.message.fromName} into ${targetAddress}!`);
      onInboundReceived();
      onClose();
    } catch (err: unknown) {
      console.error("Simulation error:", err);
      const msg = err instanceof Error ? err.message : "Failed to simulate incoming email";
      toast.error(msg);
    } finally {
      setIsSimulating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-card border border-glass-border rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-glass-border bg-card/60">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gold/15 border border-gold/30 flex items-center justify-center text-gold">
              <Inbox className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground text-sm sm:text-base">Simulate Inbound Domain Mail</h3>
              <p className="text-xs text-muted-foreground font-mono">Test receiving emails directly to your @{domain} inboxes</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 overflow-y-auto">
          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-muted-foreground mb-1.5">
              Target Inbound Mailbox
            </label>
            <select
              value={targetAddress}
              onChange={(e) => setTargetAddress(e.target.value)}
              className="w-full px-3 py-2 bg-background border border-glass-border rounded-xl text-sm font-mono text-foreground focus:outline-none focus:border-gold/60"
            >
              {mailboxes.map((mb) => (
                <option key={mb.id} value={mb.address}>
                  {mb.address} ({mb.displayName})
                </option>
              ))}
              {mailboxes.length === 0 && (
                <option value={`booking@${domain}`}>booking@{domain} (Tour & Booking Desk)</option>
              )}
            </select>
          </div>

          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-muted-foreground mb-2">
              Select Industry Scenario to Receive
            </label>
            <div className="grid grid-cols-1 gap-2.5">
              {scenarios.map((sc) => {
                const isSelected = selectedScenario === sc.id;
                const IconComponent = sc.icon;
                return (
                  <div
                    key={sc.id}
                    onClick={() => setSelectedScenario(sc.id)}
                    className={`cursor-pointer p-3.5 rounded-2xl border transition-all flex items-start gap-3.5 ${
                      isSelected
                        ? "bg-gold/10 border-gold/60 shadow-sm"
                        : "bg-background/60 border-glass-border hover:border-white/20"
                    }`}
                  >
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                        isSelected ? "bg-gold text-black font-semibold" : "bg-white/5 text-muted-foreground"
                      }`}
                    >
                      <IconComponent className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2 mb-0.5">
                        <span className="font-semibold text-xs sm:text-sm text-foreground">{sc.title}</span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/5 text-gold border border-gold/20">
                          {sc.tag}
                        </span>
                      </div>
                      <div className="text-[11px] font-mono text-gold/80 mb-1">{sc.sender}</div>
                      <div className="text-xs text-muted-foreground leading-relaxed line-clamp-2">{sc.summary}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-background/40 border border-glass-border text-xs text-muted-foreground space-y-1">
            <div className="flex items-center gap-1.5 text-foreground font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-gold" />
              Sovereign Inbound Deliverability:
            </div>
            <p className="text-[11px] leading-relaxed">
              Inbound emails route through MX records at <span className="font-mono text-gold">mail.alistwebs.com</span>, checking SPF & DKIM validity before delivering directly to your domain webmail.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-glass-border bg-card/60">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="border-glass-border text-muted-foreground hover:text-foreground"
          >
            Cancel
          </Button>

          <Button
            onClick={handleSimulate}
            disabled={isSimulating}
            className="bg-gold hover:bg-gold/90 text-black font-semibold shadow-lg shadow-gold/20"
          >
            {isSimulating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Receiving Email...
              </>
            ) : (
              <>
                <Inbox className="w-4 h-4 mr-2" />
                Simulate Delivery
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

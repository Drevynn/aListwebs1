import React, { useState } from "react";
import { X, Send, ShieldCheck, User, AtSign, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Contact, Mailbox } from "@/types";
import { toast } from "sonner";

interface MailComposeModalProps {
  isOpen: boolean;
  onClose: () => void;
  mailboxes: Mailbox[];
  contacts: Contact[];
  domain: string;
  userId?: string;
  onMailSent: () => void;
  initialTo?: string;
  initialSubject?: string;
  initialBody?: string;
}

export const MailComposeModal: React.FC<MailComposeModalProps> = ({
  isOpen,
  onClose,
  mailboxes,
  contacts,
  domain,
  userId,
  onMailSent,
  initialTo = "",
  initialSubject = "",
  initialBody = "",
}) => {
  const defaultFrom = mailboxes[0]?.address || `contact@${domain || "alistwebs.com"}`;
  const [fromAddress, setFromAddress] = useState(defaultFrom);
  const [toAddress, setToAddress] = useState(initialTo);
  const [subject, setSubject] = useState(initialSubject);
  const [body, setBody] = useState(initialBody);
  const [isSending, setIsSending] = useState(false);

  if (!isOpen) return null;

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!toAddress.trim()) {
      toast.error("Please provide a recipient email address.");
      return;
    }
    if (!subject.trim()) {
      toast.error("Please enter a subject line.");
      return;
    }
    if (!body.trim()) {
      toast.error("Please enter an email body.");
      return;
    }

    setIsSending(true);
    try {
      const selectedMailbox = mailboxes.find((m) => m.address.toLowerCase() === fromAddress.toLowerCase());

      const res = await fetch("/api/mail/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: userId || "user_default",
          from: fromAddress,
          to: toAddress.trim(),
          subject: subject.trim(),
          body: body.trim(),
          domain: domain || "alistwebs.com",
          mailboxId: selectedMailbox?.id,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to dispatch email");

      toast.success(`Dispatched from ${fromAddress} with DKIM signature token.`);
      onMailSent();
      onClose();
    } catch (err: unknown) {
      console.error("Send mail error:", err);
      const msg = err instanceof Error ? err.message : "Failed to send email";
      toast.error(msg);
    } finally {
      setIsSending(false);
    }
  };

  const handleSelectContact = (contactEmail: string) => {
    setToAddress(contactEmail);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-card border border-glass-border rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-glass-border bg-card/60">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gold/15 border border-gold/30 flex items-center justify-center text-gold">
              <Send className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground text-sm sm:text-base">Compose Sovereign Email</h3>
              <p className="text-xs text-muted-foreground font-mono">Dispatched from verified apex domain @{domain}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body / Form */}
        <form onSubmit={handleSend} className="p-6 space-y-4 overflow-y-auto flex-1">
          {/* From Address Selector */}
          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-muted-foreground mb-1.5">
              From (Sovereign Mailbox)
            </label>
            <div className="relative">
              <select
                value={fromAddress}
                onChange={(e) => setFromAddress(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-background border border-glass-border rounded-xl text-sm font-mono text-foreground focus:outline-none focus:border-gold/60"
              >
                {mailboxes.map((mb) => (
                  <option key={mb.id} value={mb.address}>
                    {mb.address} ({mb.displayName})
                  </option>
                ))}
                {mailboxes.length === 0 && (
                  <option value={`contact@${domain}`}>contact@{domain} (General Desk)</option>
                )}
              </select>
              <AtSign className="w-4 h-4 text-gold absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
            <div className="flex items-center gap-1.5 mt-1 text-[11px] text-emerald-400 font-mono">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>SPF & DKIM cryptographically signed & verified</span>
            </div>
          </div>

          {/* To Address & Contact Quick Picker */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
                To (Recipient)
              </label>
              {contacts.length > 0 && (
                <div className="text-[11px] text-muted-foreground flex items-center gap-1">
                  <span>Quick contacts:</span>
                  {contacts.slice(0, 3).map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => handleSelectContact(c.email)}
                      className="px-1.5 py-0.5 rounded bg-white/5 hover:bg-gold/20 hover:text-gold text-foreground transition-colors font-mono"
                    >
                      {c.name || c.email.split("@")[0]}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="relative">
              <Input
                type="email"
                placeholder="booking-agent@agency.com, fan@domain.com..."
                value={toAddress}
                onChange={(e) => setToAddress(e.target.value)}
                required
                className="pl-9 font-mono text-sm bg-background border-glass-border focus:border-gold/60"
              />
              <User className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          {/* Subject Line */}
          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-muted-foreground mb-1.5">
              Subject
            </label>
            <Input
              type="text"
              placeholder="Tour Dates 2026 / EPK Release / Licensing Inquiries..."
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              required
              className="text-sm bg-background border-glass-border focus:border-gold/60"
            />
          </div>

          {/* Body */}
          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-muted-foreground mb-1.5">
              Message Body
            </label>
            <Textarea
              placeholder="Write your email here..."
              rows={7}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              required
              className="text-sm bg-background border-glass-border focus:border-gold/60 leading-relaxed font-sans"
            />
          </div>

          {/* Signature Preview */}
          <div className="p-3 rounded-xl bg-background/50 border border-glass-border text-xs text-muted-foreground font-mono space-y-1">
            <div className="text-foreground font-semibold">Automatic Sovereign Footer:</div>
            <div>Sent securely from verified domain {domain} via Alist Mail Suite.</div>
            <div className="text-gold/80">0% Tracker Pixels &middot; End-to-End TLS 1.3 Encryption</div>
          </div>

          {/* Footer Actions */}
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
              disabled={isSending}
              className="bg-gold hover:bg-gold/90 text-black font-semibold shadow-lg shadow-gold/20"
            >
              {isSending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Dispatching...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Send Email
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

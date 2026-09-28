import React, { useState } from "react";
import { MailMessage } from "@/types";
import {
  Reply,
  Star,
  Trash2,
  Mail,
  ShieldCheck,
  Lock,
  ChevronDown,
  ChevronUp,
  Clock,
  User,
  ArrowLeft,
  Copy,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface MailMessageViewProps {
  message: MailMessage;
  onBack?: () => void;
  onReply: (message: MailMessage) => void;
  onToggleStar: (message: MailMessage) => void;
  onToggleRead: (message: MailMessage) => void;
  onDelete: (messageId: string) => void;
}

export const MailMessageView: React.FC<MailMessageViewProps> = ({
  message,
  onBack,
  onReply,
  onToggleStar,
  onToggleRead,
  onDelete,
}) => {
  const [showTechHeaders, setShowTechHeaders] = useState(false);
  const [copiedHeader, setCopiedHeader] = useState(false);

  const copyHeader = () => {
    if (message.messageIdHeader) {
      navigator.clipboard.writeText(message.messageIdHeader);
      setCopiedHeader(true);
      toast.success("Message-ID copied to clipboard");
      setTimeout(() => setCopiedHeader(false), 2000);
    }
  };

  const formattedDate = new Date(message.createdAt).toLocaleString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

  return (
    <div className="flex flex-col h-full bg-card rounded-3xl border border-glass-border overflow-hidden">
      {/* Top Toolbar */}
      <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 border-b border-glass-border bg-card/50">
        <div className="flex items-center gap-2">
          {onBack && (
            <button
              onClick={onBack}
              className="lg:hidden p-1.5 rounded-lg hover:bg-white/10 text-muted-foreground hover:text-foreground transition-colors mr-1"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onReply(message)}
            className="text-xs h-8 hover:text-gold hover:bg-gold/10"
          >
            <Reply className="w-3.5 h-3.5 mr-1.5" />
            Reply
          </Button>

          <Button
            size="sm"
            variant="ghost"
            onClick={() => onToggleStar(message)}
            className={`text-xs h-8 ${message.isStarred ? "text-gold" : "text-muted-foreground hover:text-gold"}`}
          >
            <Star className={`w-3.5 h-3.5 mr-1.5 ${message.isStarred ? "fill-gold" : ""}`} />
            {message.isStarred ? "Starred" : "Star"}
          </Button>

          <Button
            size="sm"
            variant="ghost"
            onClick={() => onToggleRead(message)}
            className="text-xs h-8 text-muted-foreground hover:text-foreground"
          >
            <Mail className="w-3.5 h-3.5 mr-1.5" />
            {message.isRead ? "Mark Unread" : "Mark Read"}
          </Button>
        </div>

        <div>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onDelete(message.id)}
            className="text-xs h-8 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10"
          >
            <Trash2 className="w-3.5 h-3.5 mr-1.5" />
            Delete
          </Button>
        </div>
      </div>

      {/* Message Header & Meta */}
      <div className="px-4 sm:px-6 py-5 border-b border-glass-border space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <h2 className="text-lg sm:text-xl font-bold font-display text-foreground leading-snug">
            {message.subject}
          </h2>
          <span className="text-xs font-mono text-muted-foreground shrink-0">{formattedDate}</span>
        </div>

        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gold/15 border border-gold/30 flex items-center justify-center text-gold font-bold text-sm shrink-0">
              {message.fromName ? message.fromName.charAt(0).toUpperCase() : message.from.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-semibold text-foreground text-sm">{message.fromName || message.from}</span>
                <span className="text-xs font-mono text-muted-foreground">&lt;{message.from}&gt;</span>
              </div>
              <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                <span>To:</span>
                <span className="font-mono text-foreground/80">{message.to}</span>
              </div>
            </div>
          </div>

          {/* Security Badges */}
          <div className="hidden sm:flex flex-col items-end gap-1 shrink-0">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-mono">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>SPF & DKIM: PASS</span>
            </div>
            <div className="inline-flex items-center gap-1 text-[10px] text-muted-foreground font-mono">
              <Lock className="w-3 h-3 text-gold" />
              <span>TLS 1.3 Verified</span>
            </div>
          </div>
        </div>

        {/* Collapsible Tech Headers */}
        <div>
          <button
            onClick={() => setShowTechHeaders(!showTechHeaders)}
            className="inline-flex items-center gap-1 text-[11px] font-mono text-muted-foreground hover:text-gold transition-colors"
          >
            {showTechHeaders ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            <span>{showTechHeaders ? "Hide Technical Headers" : "View Technical Mail Headers"}</span>
          </button>

          {showTechHeaders && (
            <div className="mt-2 p-3 rounded-xl bg-background/80 border border-glass-border font-mono text-[11px] text-muted-foreground space-y-1.5">
              <div className="flex items-center justify-between">
                <span>Message-ID: {message.messageIdHeader || `<${message.id}@${message.domain}>`}</span>
                <button onClick={copyHeader} className="hover:text-gold transition-colors">
                  {copiedHeader ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                </button>
              </div>
              <div>Domain Gateway: mail.alistwebs.com (DKIM RSA 2048-bit)</div>
              <div>Sender SPF Validation: PASS (ip4: 104.21.48.12)</div>
              <div>Recipient Mailbox Domain: @{message.domain}</div>
            </div>
          )}
        </div>
      </div>

      {/* Message Body */}
      <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-6">
        <div className="text-sm text-foreground/90 whitespace-pre-wrap leading-relaxed font-sans">
          {message.body}
        </div>

        {/* Reply Box Shortcut */}
        <div className="pt-8 border-t border-glass-border">
          <Button
            onClick={() => onReply(message)}
            variant="outline"
            className="border-glass-border hover:border-gold/50 text-xs font-semibold"
          >
            <Reply className="w-3.5 h-3.5 mr-2" />
            Reply to {message.fromName || message.from}
          </Button>
        </div>
      </div>
    </div>
  );
};

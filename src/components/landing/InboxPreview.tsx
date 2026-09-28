import React, { useState } from "react";
import { 
  Mail, 
  ShieldCheck, 
  Star, 
  Send, 
  Inbox, 
  FileText, 
  Trash2, 
  Sparkles, 
  CheckCircle2, 
  ArrowRight,
  ExternalLink,
  ChevronRight,
  Reply,
  Lock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";

interface DemoEmail {
  id: string;
  from: string;
  fromName: string;
  to: string;
  subject: string;
  date: string;
  category: "Booking" | "Sync / Licensing" | "Press / Media" | "VIP Direct";
  badgeColor: string;
  snippet: string;
  body: string[];
  isStarred?: boolean;
}

export const InboxPreview: React.FC = () => {
  const navigate = useNavigate();
  const [selectedFolder, setSelectedFolder] = useState<"inbox" | "starred" | "sent">("inbox");
  const [activeEmailId, setActiveEmailId] = useState<string>("sync-1");
  const [activeDomain, setActiveDomain] = useState<string>("artistdomain.com");

  const demoEmails: DemoEmail[] = [
    {
      id: "sync-1",
      from: "licensing@warnerbros-music.com",
      fromName: "Warner Bros. Television Music Dept.",
      to: `booking@${activeDomain}`,
      subject: "Synchronization License Offer: Primetime Drama Series End Credits ($22,500)",
      date: "10:42 AM",
      category: "Sync / Licensing",
      badgeColor: "bg-amber-500/10 text-amber-400 border-amber-500/30",
      isStarred: true,
      snippet: "Our music supervision team listened to your master recording through your sovereign website player...",
      body: [
        "Dear Music Department,",
        "We are currently in post-production on Season 2 of our critically acclaimed primetime drama series. We are interested in licensing your master recording and underlying composition for the closing credits of Episode 7.",
        "Proposed Terms:",
        "• Fee: $22,500 USD (All-in sync fee, 50/50 master & composition buyout)",
        "• Media: All Television & Subscription Video on Demand (SVOD worldwide)",
        "• Term: 5 Years with option to renew",
        "Because you hold 100% sovereign master and publishing rights through your Alist infrastructure, our legal team can fast-track the execution contract directly to your booking desk.",
        "Please confirm acceptance and send your W-9/direct banking instructions.",
        "Warm regards,\nWarner Bros. Television Music Supervision",
      ],
    },
    {
      id: "booking-1",
      from: "talent@coachella-lineup.com",
      fromName: "Goldenvoice Artist Relations",
      to: `booking@${activeDomain}`,
      subject: "Outdoor Stage Evening Slot Hold - Festival Tour Offer",
      date: "Yesterday",
      category: "Booking",
      badgeColor: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
      isStarred: true,
      snippet: "We reviewed your live EPK and stage riders. We would like to confirm a 55-minute sunset slot...",
      body: [
        "Hello Team,",
        "Following our review of your verified EPK and recent performance videos on your sovereign site, our booking committee would like to place a formal hold on your tour calendar.",
        "Festival Details:",
        "• Weekend 1 & Weekend 2: Sunset 7:15 PM slot on the Outdoor Theatre Stage",
        "• Artist Passes: 16 all-access credentials + dedicated tour bus compound",
        "• Audio Stems: Pre-show production patch sheet accepted as submitted",
        "Please let us know your availability so our contracting department can issue the artist rider agreements.",
        "Best,\nGoldenvoice Talent & Programming",
      ],
    },
    {
      id: "press-1",
      from: "features@rollingstone.com",
      fromName: "Rolling Stone Culture & Music",
      to: `press@${activeDomain}`,
      subject: "Cover Feature & Studio Photo Series: The Independent Music Renaissance",
      date: "Sep 19",
      category: "Press / Media",
      badgeColor: "bg-sky-500/10 text-sky-400 border-sky-500/30",
      snippet: "We are profiling 5 breakthrough artists owning 100% of their digital masters and domains...",
      body: [
        "Hi,",
        "I'm a senior editor at Rolling Stone. We're launching an extensive editorial package next month on creators who have severed ties with third-party DSP middlemen to build their own sovereign websites, direct fan email lists, and physical release empires.",
        "Your new digital monolith and direct web store are leading examples of this movement. We would love to send our Los Angeles photographer to your private recording facility for an afternoon session.",
        "Let us know your interview availability this week.",
        "Cheers,\nRolling Stone Editorial Team",
      ],
    },
    {
      id: "fan-1",
      from: "alex.directfan@gmail.com",
      fromName: "Alex Vance (Superfan Club)",
      to: `contact@${activeDomain}`,
      subject: "Direct Vinyl Purchase Confirmation & VIP Soundcheck Passes",
      date: "Sep 18",
      category: "VIP Direct",
      badgeColor: "bg-purple-500/10 text-purple-400 border-purple-500/30",
      snippet: "Just purchased the limited numbered heavyweight vinyl through your direct store. Can't wait...",
      body: [
        "Hey!",
        "Just wanted to say thank you for making it possible to buy music directly from you without big platforms taking a 30% cut. The limited numbered heavyweight vinyl arrived in pristine condition.",
        "See you at the show next month!",
        "Alex",
      ],
    },
  ];

  const currentEmail = demoEmails.find((e) => e.id === activeEmailId) || demoEmails[0];

  return (
    <section id="inbox-preview-section" className="py-20 bg-zinc-950/40 border-y border-border/40 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[450px] bg-gold/5 blur-[120px] rounded-full pointer-events-none -z-10" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gold/10 border border-gold/25 text-gold text-xs font-semibold tracking-wide">
            <Mail className="w-3.5 h-3.5" />
            <span>Interactive Sovereign Mail Showcase</span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-bold text-foreground tracking-tight">
            Your Custom Domain. <br />
            <span className="text-gold">No Middlemen. 100% Inbound Control.</span>
          </h2>

          <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
            Replace generic Gmail or Yahoo addresses with enterprise sovereign desks (
            <code className="text-foreground bg-muted/40 px-1.5 py-0.5 rounded text-xs font-mono">booking@{activeDomain}</code>,{" "}
            <code className="text-foreground bg-muted/40 px-1.5 py-0.5 rounded text-xs font-mono">press@{activeDomain}</code>
            ). Sealed with 2048-bit DKIM & SPF cryptographic deliverability.
          </p>
        </div>

        {/* The Interactive Email Client Box */}
        <div className="bg-card/90 border border-glass-border rounded-3xl overflow-hidden shadow-2xl backdrop-blur-xl">
          {/* Top Bar / Domain Browser Chrome */}
          <div className="bg-zinc-950/80 border-b border-border/50 px-4 py-3 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 w-full sm:w-auto">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block" />
                <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
                <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
              </div>
              <div className="h-4 w-[1px] bg-border/40 mx-1" />
              <div className="flex items-center gap-1.5 bg-background/60 border border-border/40 px-3 py-1 rounded-xl text-xs font-mono text-muted-foreground">
                <Lock className="w-3 h-3 text-emerald-400" />
                <span className="text-foreground font-semibold">https://mail.{activeDomain}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30 text-[10px] font-mono gap-1">
                <ShieldCheck className="w-3 h-3" />
                99.8% Deliverability • SPF/DKIM Active
              </Badge>
              <Button
                size="sm"
                onClick={() => navigate("/signup")}
                className="bg-gold hover:bg-gold/90 text-zinc-950 font-bold text-xs h-7 rounded-lg shadow-sm"
              >
                Claim Your Domain
                <ArrowRight className="w-3 h-3 ml-1" />
              </Button>
            </div>
          </div>

          {/* Mail Client Workspace: 3-column layout */}
          <div className="grid grid-cols-1 md:grid-cols-12 min-h-[480px]">
            {/* Column 1: Desks & Folders (3 cols on md) */}
            <div className="md:col-span-3 border-r border-border/40 p-4 space-y-5 bg-card/40">
              <div className="space-y-1.5">
                <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground font-semibold px-2">
                  Mail Desks
                </span>
                <div className="space-y-1 text-xs">
                  <div className="flex items-center justify-between px-2.5 py-1.5 rounded-xl bg-gold/10 text-gold font-medium">
                    <span className="truncate">booking@{activeDomain}</span>
                    <Badge variant="outline" className="bg-gold/20 text-gold text-[10px] px-1.5 py-0 border-0">
                      2
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between px-2.5 py-1.5 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-colors">
                    <span className="truncate">press@{activeDomain}</span>
                    <span className="text-[10px] text-muted-foreground">1</span>
                  </div>
                  <div className="flex items-center justify-between px-2.5 py-1.5 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-colors">
                    <span className="truncate">contact@{activeDomain}</span>
                    <span className="text-[10px] text-muted-foreground">1</span>
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground font-semibold px-2">
                  Navigation
                </span>
                <div className="space-y-0.5 text-xs font-medium">
                  <button
                    onClick={() => setSelectedFolder("inbox")}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl transition-all ${
                      selectedFolder === "inbox"
                        ? "bg-muted text-foreground font-bold"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/30"
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <Inbox className="w-3.5 h-3.5 text-gold" />
                      Inbox
                    </span>
                    <span className="text-[11px] font-mono">4</span>
                  </button>
                  <button
                    onClick={() => setSelectedFolder("starred")}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl transition-all ${
                      selectedFolder === "starred"
                        ? "bg-muted text-foreground font-bold"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/30"
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <Star className="w-3.5 h-3.5 text-amber-400" />
                      Starred
                    </span>
                    <span className="text-[11px] font-mono">2</span>
                  </button>
                  <button
                    onClick={() => setSelectedFolder("sent")}
                    className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-colors"
                  >
                    <span className="flex items-center gap-2">
                      <Send className="w-3.5 h-3.5" />
                      Sent Mail
                    </span>
                  </button>
                </div>
              </div>

              {/* Storage Pill */}
              <div className="p-3 rounded-xl bg-background/50 border border-border/40 space-y-2">
                <div className="flex justify-between text-[10px] text-muted-foreground">
                  <span>Sovereign Storage</span>
                  <span className="font-mono text-foreground font-semibold">25.0 GB</span>
                </div>
                <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-gold w-[4%]" />
                </div>
                <span className="text-[9px] text-muted-foreground/80 block">
                  Encrypted on NVMe cluster • Zero AI training
                </span>
              </div>
            </div>

            {/* Column 2: Inbound Messages List (4 cols on md) */}
            <div className="md:col-span-4 border-r border-border/40 divide-y divide-border/30 overflow-y-auto max-h-[500px] bg-card/20">
              <div className="p-3 bg-muted/20 flex items-center justify-between text-xs text-muted-foreground">
                <span className="font-semibold text-foreground">Recent Inquiries</span>
                <span className="font-mono text-[10px]">4 Unread</span>
              </div>

              {demoEmails.map((email) => {
                const isActive = email.id === activeEmailId;
                return (
                  <button
                    key={email.id}
                    onClick={() => setActiveEmailId(email.id)}
                    className={`w-full text-left p-3.5 transition-all flex flex-col gap-1.5 ${
                      isActive
                        ? "bg-gold/10 border-l-2 border-gold"
                        : "hover:bg-muted/30 border-l-2 border-transparent"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1">
                      <span className="font-bold text-xs text-foreground truncate">{email.fromName}</span>
                      <span className="text-[10px] text-muted-foreground shrink-0 font-mono">{email.date}</span>
                    </div>

                    <div className="text-xs font-semibold text-foreground/90 truncate leading-snug">
                      {email.subject}
                    </div>

                    <p className="text-[11px] text-muted-foreground line-clamp-1 leading-relaxed">
                      {email.snippet}
                    </p>

                    <div className="flex items-center gap-1.5 pt-0.5">
                      <Badge variant="outline" className={`text-[9px] px-1.5 py-0 font-mono ${email.badgeColor}`}>
                        {email.category}
                      </Badge>
                      {email.isStarred && <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Column 3: Email Reader Pane (5 cols on md) */}
            <div className="md:col-span-5 p-5 flex flex-col justify-between bg-card/60 space-y-4">
              <div className="space-y-4">
                {/* Header info */}
                <div className="space-y-2 pb-3 border-b border-border/40">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-sm font-bold text-foreground leading-snug">
                      {currentEmail.subject}
                    </h3>
                    <Badge variant="outline" className={`text-[10px] font-mono shrink-0 ${currentEmail.badgeColor}`}>
                      {currentEmail.category}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <div>
                      <span className="font-bold text-foreground">{currentEmail.fromName}</span>
                      <span className="text-[11px] text-muted-foreground ml-1 font-mono">
                        &lt;{currentEmail.from}&gt;
                      </span>
                    </div>
                    <span className="text-[10px] font-mono">{currentEmail.date}</span>
                  </div>

                  <div className="flex items-center gap-2 text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20 w-fit">
                    <ShieldCheck className="w-3 h-3" />
                    <span>SPF: PASS • DKIM: 2048-bit VERIFIED • DMARC: PASS</span>
                  </div>
                </div>

                {/* Email Body */}
                <div className="space-y-2.5 text-xs text-foreground/90 leading-relaxed font-sans max-h-[260px] overflow-y-auto pr-2">
                  {currentEmail.body.map((para, idx) => (
                    <p key={idx} className={para.startsWith("•") || para.startsWith("Slot:") ? "font-mono pl-2 text-gold/90" : ""}>
                      {para}
                    </p>
                  ))}
                </div>
              </div>

              {/* Action Toolbar */}
              <div className="pt-3 border-t border-border/40 flex flex-wrap items-center justify-between gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => navigate("/mail")}
                  className="text-xs h-8 rounded-xl border-border/60 hover:border-gold/50"
                >
                  <Reply className="w-3.5 h-3.5 mr-1.5" />
                  Reply via Alist Mail
                </Button>

                <Button
                  size="sm"
                  onClick={() => navigate("/signup")}
                  className="bg-gold hover:bg-gold/90 text-zinc-950 font-bold text-xs h-8 rounded-xl shadow-md shadow-gold/20"
                >
                  Connect Your Domain
                  <ChevronRight className="w-3.5 h-3.5 ml-1" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Feature Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-4">
          <div className="p-5 rounded-2xl bg-card/40 border border-border/50 space-y-2">
            <div className="w-8 h-8 rounded-xl bg-gold/10 text-gold flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <h4 className="font-bold text-foreground text-sm font-display">
              Zero-Spam Sovereign Infrastructure
            </h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              No Big Tech telemetry, ad scanners, or AI scrapers reading your private contracts, cue sheets, or royalties.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-card/40 border border-border/50 space-y-2">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <Mail className="w-4 h-4" />
            </div>
            <h4 className="font-bold text-foreground text-sm font-display">
              Unlimited Industry Mail Desks
            </h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Provision <code className="text-foreground">booking@</code>, <code className="text-foreground">press@</code>, <code className="text-foreground">sync@</code>, and <code className="text-foreground">vip@</code> under your apex domain in seconds.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-card/40 border border-border/50 space-y-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <h4 className="font-bold text-foreground text-sm font-display">
              Automated DNS & DKIM Wizard
            </h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              1-click Cloudflare, GoDaddy, and Namecheap synchronization with live status monitoring and 99.8% inbox deliverability.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default InboxPreview;

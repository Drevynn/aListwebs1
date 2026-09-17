import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  HelpCircle, 
  Search, 
  Sparkles, 
  Globe, 
  Music, 
  FileText, 
  ShieldCheck, 
  Mail, 
  CreditCard, 
  FolderKanban, 
  ExternalLink, 
  ChevronDown, 
  CheckCircle2, 
  BookOpen, 
  ArrowRight,
  Tv,
  Film,
  UserCheck,
  Send,
  Sliders,
  AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";

export interface HowToGuide {
  id: string;
  title: string;
  category: "getting-started" | "music" | "film" | "actors" | "domains-docs" | "security-billing";
  categoryLabel: string;
  timeEstimate: string;
  summary: string;
  steps: {
    number: string;
    title: string;
    description: string;
    tip?: string;
  }[];
  actionText: string;
  actionHref?: string;
  actionExternal?: boolean;
}

const guides: HowToGuide[] = [
  {
    id: "build-first-site",
    title: "How to Build & Launch Your Sovereign Website",
    category: "getting-started",
    categoryLabel: "Getting Started",
    timeEstimate: "3 mins",
    summary: "Generate a custom, hardened creative monolith tailored to your discipline using the AI Design Studio or Portfolio Generator.",
    steps: [
      {
        number: "01",
        title: "Launch Portfolio Studio or AI Studio",
        description: "Click 'Portfolio Studio' in the navigation bar to start the generator, or click 'AI Design Studio' to describe your aesthetic vision in plain English.",
        tip: "You can prompt for specific styles: minimal brutalist, dark cinematic film reel, editorial luxury, or vintage vinyl aesthetic.",
      },
      {
        number: "02",
        title: "Select Your Creative Discipline",
        description: "Choose your primary creative track: Musician/Band, Filmmaker/Director, Actor/Performer, or Author/Screenwriter to automatically inject discipline-specific schemas.",
      },
      {
        number: "03",
        title: "Input Your Core Credits & Media",
        description: "Enter your artist name, headline, bio summary, key credits, and links. The studio engine compiles your portfolio live with high-contrast typography.",
      },
      {
        number: "04",
        title: "Publish to Global Edge CDN",
        description: "Click 'Deploy' to push your site live with instant HTTPS, pre-rendered markup, and ultra-fast global edge distribution.",
        tip: "Your site will be immediately accessible and indexed for casting directors, festival curators, and fans.",
      },
    ],
    actionText: "Open Portfolio Studio",
    actionHref: "/build?tab=portfolio",
  },
  {
    id: "custom-domain-ssl",
    title: "How to Connect Your Custom Domain & SSL",
    category: "domains-docs",
    categoryLabel: "Domains & Hosting",
    timeEstimate: "5 mins",
    summary: "Map your own domain name (e.g., yourname.com, theband.com) with automatic zero-config SSL certificates and edge DNS routing.",
    steps: [
      {
        number: "01",
        title: "Open the Domain Wizard",
        description: "Navigate to the Domain Setup section on your dashboard or homepage to begin custom hostname verification.",
      },
      {
        number: "02",
        title: "Enter Your Registered Domain",
        description: "Input your apex domain (e.g. artistname.com) or subdomain (e.g. press.artistname.com) that you purchased through Namecheap, GoDaddy, Google, or Cloudflare.",
      },
      {
        number: "03",
        title: "Configure DNS Records at Your Registrar",
        description: "Log in to your DNS provider and add the designated CNAME or A record pointing to our edge CDN routing cluster.",
        tip: "DNS propagation typically finishes in 5 to 30 minutes depending on your registrar's TTL settings.",
      },
      {
        number: "04",
        title: "Automated TLS/SSL Provisioning",
        description: "Once DNS resolves, our automated security worker provisions an SSL/TLS certificate with zero downtime and enforces HTTPS everywhere.",
      },
    ],
    actionText: "Open Domain Wizard",
    actionHref: "/#domain-wizard",
  },
  {
    id: "google-docs-sync",
    title: "How to Sync Bio & Tour Dates with Google Docs",
    category: "domains-docs",
    categoryLabel: "Domains & Hosting",
    timeEstimate: "2 mins",
    summary: "Manage tour dates, artist bios, press releases, or festival news directly in Google Docs and have your website update automatically.",
    steps: [
      {
        number: "01",
        title: "Access Google Docs Manager",
        description: "Select 'Docs' in the navigation bar or scroll to the Google Docs Manager panel on your studio dashboard.",
      },
      {
        number: "02",
        title: "Authorize Secure Google Connection",
        description: "Sign in with Google using OAuth. We only request read and update permissions specifically for your designated site documents.",
      },
      {
        number: "03",
        title: "Create or Select Your Site Document",
        description: "Generate a linked Google Doc for your website with structured sections for Bio, Upcoming Dates, Press Quotes, and Release Notes.",
      },
      {
        number: "04",
        title: "Edit in Google Docs Anytime",
        description: "Whenever your tour dates change or you update your biography in Google Docs, sync it with one click or let our webhook reflect changes live.",
        tip: "Great for tour managers and publicists who need to update press announcements without touching code.",
      },
    ],
    actionText: "Open Google Docs Manager",
    actionHref: "/#google-docs-manager",
  },
  {
    id: "lossless-audio-players",
    title: "How to Stream Lossless Audio & Tour Riders (Musicians)",
    category: "music",
    categoryLabel: "Musicians & Bands",
    timeEstimate: "4 mins",
    summary: "Deliver uncompressed 24-bit FLAC audio without platform compression or advertisements, plus manage technical stage riders.",
    steps: [
      {
        number: "01",
        title: "Upload Audio in Cloud Storage",
        description: "Upload high-fidelity master tracks (FLAC, WAV, or 320kbps MP3) directly to your secure cloud bucket with instant CDN streaming.",
      },
      {
        number: "02",
        title: "Configure the Lossless Music Player",
        description: "Add track titles, artwork, lyrics, and direct links to Spotify, Apple Music, and Bandcamp for seamless cross-platform discovery.",
      },
      {
        number: "03",
        title: "Attach 16-Channel Stage Plot & Input Lists",
        description: "Include downloadable technical riders, microphone inputs, and monitor mixes for sound engineers and festival venues.",
        tip: "Venue engineers love having a mobile-friendly link to your exact input list before load-in.",
      },
      {
        number: "04",
        title: "Link Live Ticket Outlets",
        description: "Connect your tour schedule to Ticketmaster, AXS, DICE, or Eventbrite so fans purchase verified tickets directly from your monolith.",
      },
    ],
    actionText: "Open Music Studio",
    actionHref: "/build?tab=portfolio",
  },
  {
    id: "4k-showreels-screeners",
    title: "How to Host 4K Showreels & Screener Gates (Filmmakers)",
    category: "film",
    categoryLabel: "Filmmakers & Directors",
    timeEstimate: "4 mins",
    summary: "Stream high-bitrate showreels, password-protect private festival cuts, and display laurels and lookbooks.",
    steps: [
      {
        number: "01",
        title: "Embed 4K Vimeo, YouTube or Direct Video",
        description: "Add high-bitrate video embeds or upload self-hosted clips for uninterrupted showreel playback with custom clean player controls.",
      },
      {
        number: "02",
        title: "Activate Private Screener Password Protection",
        description: "Protect sensitive festival submissions, rough cuts, or pitch sizzles with customizable passcode gates for distributors and jury members.",
        tip: "You can update the screener password anytime without breaking the shared link.",
      },
      {
        number: "03",
        title: "Display Festival Laurels & Production Credits",
        description: "Showcase official selections, wins, producer credits, cinematographers, and distribution agreements in responsive bento grids.",
      },
      {
        number: "04",
        title: "Attach Production Lookbooks & Treatments",
        description: "Provide one-click PDF downloads of pitch bibles, mood boards, and lookbooks for accredited investors and co-producers.",
      },
    ],
    actionText: "Explore Film Portfolios",
    actionHref: "/build",
  },
  {
    id: "actors-casting-dossiers",
    title: "How to Setup Casting Dossiers & Headshots (Actors)",
    category: "actors",
    categoryLabel: "Actors & Performers",
    timeEstimate: "3 mins",
    summary: "Equip casting directors and talent agents with 300DPI headshots, dramatic reels, and interactive SAG-AFTRA credit resumes.",
    steps: [
      {
        number: "01",
        title: "Upload High-Resolution 300DPI Headshots",
        description: "Add commercial, theatrical, and character headshots with one-click download buttons sized specifically for casting submission specs.",
      },
      {
        number: "02",
        title: "Organize Dramatic & Comedic Reels",
        description: "Feature short, timestamped scene clips categorized by genre so casting associates can review your dramatic and comedic range in seconds.",
      },
      {
        number: "03",
        title: "Build Your SAG-AFTRA / Equity Credit Matrix",
        description: "Format Film, Television, Theatre, and Voiceover credits with role tier (Lead, Series Regular, Guest Star), director, and production company.",
        tip: "Include physical attributes (height, eye color, vocal range) and special dialects directly on your resume page.",
      },
      {
        number: "04",
        title: "Route Inquiries to Your Talent Agency",
        description: "Direct booking and audition inquiries straight to your theatrical agent, manager, or legal representative.",
      },
    ],
    actionText: "Configure Actor Dossier",
    actionHref: "/build",
  },
  {
    id: "alist-mail-communication",
    title: "How to Collect Subscribers & Send Mail (Alist Mail)",
    category: "getting-started",
    categoryLabel: "Communications",
    timeEstimate: "2 mins",
    summary: "Own 100% of your audience data, gather fan emails with zero middleman fees, and send direct tour announcements.",
    steps: [
      {
        number: "01",
        title: "Collect Fan & Booking Inquiries",
        description: "Every visitor subscription or contact inquiry on your sovereign site is saved into your dedicated Firestore database.",
      },
      {
        number: "02",
        title: "Open Alist Mail Dashboard",
        description: "Click 'Alist Mail' in the header navigation or dashboard to inspect all subscriber contacts and inquiry records.",
      },
      {
        number: "03",
        title: "Compose & Send Email Dispatches",
        description: "Send direct notifications, album drops, tour alerts, or press releases with clean, responsive email delivery.",
      },
      {
        number: "04",
        title: "Export Audience Data Anytime",
        description: "Export all your contacts as a CSV file anytime. You maintain 100% data sovereignty without algorithmic de-platforming.",
        tip: "Unlike social networks, your email list is your own permanent, portable creative asset.",
      },
    ],
    actionText: "Open Alist Mail",
    actionHref: "/mail",
  },
  {
    id: "protect-work-sovranly",
    title: "How to Protect Your IP with Sovranly IP",
    category: "security-billing",
    categoryLabel: "IP Protection & Legal",
    timeEstimate: "4 mins",
    summary: "Secure sovereign proof of authorship, copyright timestamps, and trademark verification for your original creative works.",
    steps: [
      {
        number: "01",
        title: "Access Sovranly IP",
        description: "Click 'Protect your work' in the header, footer, or navigation bar to open our partner portal at sovranlyip.com.",
      },
      {
        number: "02",
        title: "Register Your Creative Assets",
        description: "Submit original compositions, master recordings, screenplays, treatments, brand logos, or artistic portfolios for registration.",
      },
      {
        number: "03",
        title: "Obtain Immutable Timestamp Certificates",
        description: "Receive cryptographically signed proof-of-authorship certificates that document creation date, ownership, and copyright provenance.",
        tip: "Essential protection before sending demo tapes to labels or screenplays to production companies.",
      },
      {
        number: "04",
        title: "Embed Sovereign Protection Badges",
        description: "Display sovereign IP verification seals on your live website to deter unauthorized AI scraping and copyright infringement.",
      },
    ],
    actionText: "Visit Sovranly IP",
    actionHref: "https://sovranlyip.com",
    actionExternal: true,
  },
  {
    id: "manage-billing-invoices",
    title: "How to Manage Subscriptions & Download Invoices",
    category: "security-billing",
    categoryLabel: "Billing & Plans",
    timeEstimate: "1 min",
    summary: "Inspect your subscription tier, upgrade for custom domains and unlimited media storage, and download Stripe tax invoices.",
    steps: [
      {
        number: "01",
        title: "Open Billing Portal",
        description: "Click 'Billing' in the navigation bar to launch the secure Stripe customer billing modal.",
      },
      {
        number: "02",
        title: "View Active Plan Status",
        description: "Review your current tier (Starter, Pro Sovereign, or Studio Enterprise), billing cycle, and renewal dates.",
      },
      {
        number: "03",
        title: "Upgrade or Update Payment Method",
        description: "Add new credit cards, update billing addresses, or change plans instantly with prorated billing.",
      },
      {
        number: "04",
        title: "Download Past Receipts & Invoices",
        description: "Access PDF receipts for business accounting, tax write-offs, and artist management records.",
      },
    ],
    actionText: "Open Billing Portal",
    actionHref: "/#pricing",
  },
];

const categoryTabs = [
  { id: "all", label: "All Guides", icon: HelpCircle },
  { id: "getting-started", label: "Getting Started", icon: Sparkles },
  { id: "domains-docs", label: "Domains & Docs", icon: Globe },
  { id: "music", label: "Musicians", icon: Music },
  { id: "film", label: "Filmmakers", icon: Film },
  { id: "actors", label: "Actors & Writers", icon: UserCheck },
  { id: "security-billing", label: "IP & Billing", icon: ShieldCheck },
];

export default function HelpAndHowTo({ className = "" }: { className?: string }) {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [expandedGuideId, setExpandedGuideId] = useState<string | null>("build-first-site");

  const filteredGuides = useMemo(() => {
    return guides.filter((guide) => {
      const matchesCategory = selectedCategory === "all" || guide.category === selectedCategory;
      const query = searchQuery.toLowerCase().trim();
      if (!query) return matchesCategory;

      const matchesSearch =
        guide.title.toLowerCase().includes(query) ||
        guide.summary.toLowerCase().includes(query) ||
        guide.categoryLabel.toLowerCase().includes(query) ||
        guide.steps.some(
          (s) =>
            s.title.toLowerCase().includes(query) ||
            s.description.toLowerCase().includes(query) ||
            (s.tip && s.tip.toLowerCase().includes(query))
        );

      return matchesCategory && matchesSearch;
    });
  }, [searchQuery, selectedCategory]);

  const handleActionClick = (guide: HowToGuide) => {
    if (!guide.actionHref) return;
    if (guide.actionExternal) {
      window.open(guide.actionHref, "_blank", "noopener,noreferrer");
    } else if (guide.actionHref.startsWith("/#")) {
      const elementId = guide.actionHref.replace("/#", "");
      const elem = document.getElementById(elementId);
      if (elem) {
        elem.scrollIntoView({ behavior: "smooth" });
      } else {
        navigate(guide.actionHref);
      }
    } else {
      navigate(guide.actionHref);
    }
  };

  return (
    <section id="help" className={`py-20 px-4 sm:px-6 lg:px-8 bg-background relative ${className}`}>
      {/* Background ambient lighting */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gold/5 blur-[140px] pointer-events-none rounded-full" />

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Header Title */}
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gold/10 border border-gold/30 text-gold text-xs font-mono uppercase tracking-widest">
            <BookOpen className="w-3.5 h-3.5 text-gold" />
            Complete Help & How-To Knowledge Base
          </div>

          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-foreground">
            How-To Guides & Support Center
          </h2>

          <p className="text-base sm:text-lg text-muted-foreground">
            Step-by-step instructions for launching your sovereign creative site, streaming lossless audio, 
            connecting domains, syncing Google Docs, and protecting your work.
          </p>

          {/* Search bar */}
          <div className="relative max-w-xl mx-auto pt-2">
            <Search className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <Input
              type="text"
              placeholder="Search guides (e.g. domain, lossless audio, Google Docs, email, IP protection)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 h-11 bg-card border-border text-foreground text-sm focus:border-gold/50 focus:ring-1 focus:ring-gold/30 rounded-xl"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground hover:text-foreground font-medium"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Category Filters */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 scrollbar-none justify-start md:justify-center">
          {categoryTabs.map((tab) => {
            const Icon = tab.icon;
            const isSelected = selectedCategory === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setSelectedCategory(tab.id)}
                className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border ${
                  isSelected
                    ? "bg-gold text-white border-gold shadow-md shadow-gold/20"
                    : "bg-card text-muted-foreground border-border hover:border-gold/30 hover:text-foreground"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Guides List */}
        <div className="space-y-4 mb-16">
          {filteredGuides.length > 0 ? (
            filteredGuides.map((guide) => {
              const isExpanded = expandedGuideId === guide.id;
              return (
                <div
                  key={guide.id}
                  className={`rounded-2xl border transition-all overflow-hidden ${
                    isExpanded
                      ? "bg-card border-gold/50 shadow-lg"
                      : "bg-card border-border hover:border-border/80"
                  }`}
                >
                  {/* Guide Header Summary */}
                  <button
                    type="button"
                    onClick={() => setExpandedGuideId(isExpanded ? null : guide.id)}
                    className="w-full p-5 sm:p-6 text-left flex items-start sm:items-center justify-between gap-4 cursor-pointer"
                  >
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <Badge
                          variant="outline"
                          className="text-[10px] uppercase font-mono tracking-wider border-gold/40 text-gold bg-gold/10 font-semibold"
                        >
                          {guide.categoryLabel}
                        </Badge>
                        <span className="text-xs text-muted-foreground font-mono flex items-center gap-1 font-medium">
                          Est: {guide.timeEstimate}
                        </span>
                      </div>
                      <h3 className="text-lg sm:text-xl font-bold font-display text-foreground tracking-tight">
                        {guide.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2">
                        {guide.summary}
                      </p>
                    </div>

                    <div className="shrink-0 pt-1 sm:pt-0">
                      <div
                        className={`w-8 h-8 rounded-full border flex items-center justify-center transition-transform ${
                          isExpanded ? "rotate-180 bg-gold text-white border-gold shadow-md shadow-gold/20" : "bg-muted text-foreground/70 border-border"
                        }`}
                      >
                        <ChevronDown className="w-4 h-4" />
                      </div>
                    </div>
                  </button>

                  {/* Expanded Detailed Steps */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="border-t border-border px-5 sm:px-6 pb-6 pt-5 bg-muted/30"
                      >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                          {guide.steps.map((step) => (
                            <div
                              key={step.number}
                              className="p-4 rounded-xl bg-card border border-border flex flex-col justify-between"
                            >
                              <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-mono font-bold text-gold px-2 py-0.5 rounded bg-gold/10 border border-gold/20">
                                    Step {step.number}
                                  </span>
                                  <h4 className="font-semibold text-sm text-foreground">
                                    {step.title}
                                  </h4>
                                </div>
                                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                                  {step.description}
                                </p>
                              </div>

                              {step.tip && (
                                <div className="mt-3 pt-2.5 border-t border-border flex items-start gap-2 text-xs text-foreground/90 bg-gold/10 p-2 rounded-lg font-medium">
                                  <AlertCircle className="w-3.5 h-3.5 text-gold shrink-0 mt-0.5" />
                                  <span>
                                    <strong className="text-gold">Pro-Tip:</strong> {step.tip}
                                  </span>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>

                        {/* Action link */}
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-border">
                          <span className="text-xs text-muted-foreground font-medium">
                            Ready to configure this feature?
                          </span>
                          <Button
                            onClick={() => handleActionClick(guide)}
                            variant="hero"
                            size="sm"
                            className="w-full sm:w-auto text-xs font-bold gap-1.5 h-9 px-4"
                          >
                            <span>{guide.actionText}</span>
                            {guide.actionExternal ? (
                              <ExternalLink className="w-3.5 h-3.5" />
                            ) : (
                              <ArrowRight className="w-3.5 h-3.5" />
                            )}
                          </Button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })
          ) : (
            <div className="py-12 px-4 text-center rounded-2xl bg-card border border-dashed border-border">
              <HelpCircle className="w-8 h-8 text-muted-foreground mx-auto mb-3 opacity-50" />
              <p className="text-foreground font-semibold text-sm">No matching guides found</p>
              <p className="text-xs text-muted-foreground mt-1">
                Try searching for keywords like "domain", "Google Docs", "music", or "billing".
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("all");
                }}
                className="mt-4 text-xs"
              >
                Reset Search Filters
              </Button>
            </div>
          )}
        </div>

        {/* Quick FAQ / Common Questions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          <div className="p-6 rounded-2xl bg-card border border-border space-y-3 shadow-sm">
            <div className="w-9 h-9 rounded-xl bg-gold/15 text-gold flex items-center justify-center">
              <Globe className="w-4 h-4" />
            </div>
            <h4 className="font-bold text-sm text-foreground">Why is DNS showing pending?</h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Registrars like GoDaddy or Namecheap can take anywhere from 5 to 60 minutes to propagate new DNS CNAME and A records across worldwide resolvers. Once active, HTTPS automatically turns green.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-card border border-border space-y-3 shadow-sm">
            <div className="w-9 h-9 rounded-xl bg-blue-500/15 text-blue-500 dark:text-blue-400 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
            <h4 className="font-bold text-sm text-foreground">How does Google Docs stay synced?</h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Your site pulls live content from your authorized Google Docs document whenever you save. If you update tour dates on mobile in Docs, a quick sync refreshes your site in real-time.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-card border border-border space-y-3 shadow-sm">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <h4 className="font-bold text-sm text-foreground">Do you take a cut of my sales?</h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              No. A List Webs takes 0% commission on your music sales, ticket links, screening fees, or merchandise. All payments connect directly to your Stripe or merchant account.
            </p>
          </div>
        </div>

        {/* Still Need Assistance Banner */}
        <div className="p-8 rounded-3xl bg-card border border-gold/40 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
          <div className="space-y-2 text-center sm:text-left">
            <div className="inline-flex items-center gap-1.5 text-xs text-gold font-bold uppercase tracking-wider">
              <HelpCircle className="w-3.5 h-3.5" />
              Need Personal Guidance?
            </div>
            <h3 className="text-xl sm:text-2xl font-display font-bold text-foreground">
              Dedicated Creative Technical Support
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground max-w-xl">
              Our engineering team assists musicians, directors, actors, and writers with custom domains, lossless audio pipelines, and bespoke design migrations.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Button
              variant="outline"
              size="sm"
              asChild
              className="border-gold/40 text-gold hover:bg-gold/10 text-xs h-9 px-3.5"
            >
              <a
                href="https://sovranlyip.com"
                target="_blank"
                rel="noopener noreferrer"
              >
                <ShieldCheck className="w-3.5 h-3.5 mr-1.5 text-gold" />
                IP Help (Sovranly IP)
              </a>
            </Button>
            <Button
              variant="hero"
              size="sm"
              asChild
              className="text-xs h-9 px-4"
            >
              <a href="mailto:support@alistwebs.com">
                <Mail className="w-3.5 h-3.5 mr-1.5" />
                Email Support Team
              </a>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

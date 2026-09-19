import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ShieldCheck,
  LogOut,
  Sparkles,
  ArrowUp,
  Mail,
  Youtube,
  Instagram,
  Twitter,
  Linkedin,
  Github,
  Film,
  CheckCircle2,
  ExternalLink,
  Award,
  Clapperboard,
  Crown
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

export default function Footer() {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      toast({
        title: "Please enter a valid email",
        description: "We require a valid address for the Hollywood Talent Dispatch.",
        variant: "destructive",
      });
      return;
    }
    setSubscribed(true);
    toast({
      title: "Welcome to the Red Carpet Dispatch",
      description: "You've been added to the VIP Hollywood production newsletter.",
    });
    setEmail("");
  };

  const handleLogout = async () => {
    try {
      await signOut();
      toast({
        title: "Signed out",
        description: "You have been logged out successfully.",
      });
      navigate("/");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const socialLinks = [
    {
      name: "YouTube",
      icon: Youtube,
      href: "https://youtube.com/@alistwebs",
      ariaLabel: "Visit A List Webs on YouTube",
    },
    {
      name: "Instagram",
      icon: Instagram,
      href: "https://instagram.com/alistwebs",
      ariaLabel: "Visit A List Webs on Instagram",
    },
    {
      name: "Twitter / X",
      icon: Twitter,
      href: "https://twitter.com/alistwebs",
      ariaLabel: "Visit A List Webs on X (Twitter)",
    },
    {
      name: "LinkedIn",
      icon: Linkedin,
      href: "https://linkedin.com/company/alistwebs",
      ariaLabel: "Visit A List Webs on LinkedIn",
    },
    {
      name: "GitHub",
      icon: Github,
      href: "https://github.com/alistwebs",
      ariaLabel: "Visit A List Webs on GitHub",
    },
    {
      name: "IMDb / Industry",
      icon: Film,
      href: "https://imdb.com",
      ariaLabel: "A List Webs Film & Industry Network",
    },
  ];

  return (
    <footer className="relative border-t border-burgundy/40 bg-gradient-to-b from-background via-burgundy/10 to-background text-foreground overflow-hidden pt-16 pb-12 px-4 sm:px-6 lg:px-8">
      {/* Top subtle golden accent hairline */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold/50 to-transparent pointer-events-none" />

      {/* Ambient background glow */}
      <div className="absolute top-12 left-1/2 -translate-x-1/2 w-[600px] h-[250px] bg-gradient-to-b from-burgundy/20 via-gold/10 to-transparent blur-[140px] pointer-events-none -z-10 rounded-full" />

      <div className="max-w-7xl mx-auto">
        {/* VIP Dispatch Newsletter Banner */}
        <div className="mb-14 p-6 sm:p-8 rounded-2xl bg-zinc-950/70 border border-burgundy/50 backdrop-blur-md shadow-xl shadow-burgundy/20 flex flex-col lg:flex-row items-center justify-between gap-6">
          <div className="space-y-1.5 text-center lg:text-left max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-burgundy/40 border border-gold/30 text-gold-light text-xs font-mono uppercase tracking-widest">
              <Crown className="w-3.5 h-3.5 text-gold" />
              <span>Hollywood Talent Dispatch</span>
            </div>
            <h3 className="font-display text-xl sm:text-2xl font-bold tracking-tight text-foreground">
              Stay Ahead of Industry Shifts & AI Releases
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Bi-weekly briefings on sovereign website tech, IATSE union rate trends, film festival distribution, and Hollywood Genius AI updates.
            </p>
          </div>

          <form onSubmit={handleSubscribe} className="w-full lg:w-auto flex flex-col sm:flex-row gap-2.5 max-w-md">
            <div className="relative flex-1">
              <Mail className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                placeholder="director@paramount.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={subscribed}
                className="w-full pl-10 pr-4 py-2.5 bg-zinc-900/90 border border-zinc-700/80 focus:border-gold rounded-xl text-xs text-foreground placeholder:text-zinc-500 outline-none transition-all shadow-inner"
              />
            </div>
            <Button
              type="submit"
              variant="hero"
              disabled={subscribed}
              className="gap-2 text-xs font-bold px-6 py-2.5 rounded-xl bg-gradient-to-r from-burgundy via-burgundy-light to-gold text-white hover:brightness-110 shadow-lg shadow-burgundy/30 whitespace-nowrap"
            >
              {subscribed ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-gold-light" />
                  <span>Subscribed</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Join Dispatch</span>
                </>
              )}
            </Button>
          </form>
        </div>

        {/* Main 5-Column Navigation Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 pb-14 border-b border-border/70">
          {/* Col 1: Brand, Tagline & Social Icons */}
          <div className="lg:col-span-4 space-y-4">
            <Link to="/" className="inline-flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl bg-zinc-950 border border-gold/40 p-1 flex items-center justify-center group-hover:border-gold transition-colors shadow-md shadow-gold/10">
                <img
                  src="/logo.png"
                  alt="A List Webs"
                  className="w-full h-full object-contain"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div>
                <span className="font-display font-extrabold text-gold text-xl tracking-tight block">
                  A List Webs
                </span>
                <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground block">
                  Sovereign Creative Monolith
                </span>
              </div>
            </Link>

            <p className="text-sm text-muted-foreground leading-relaxed max-w-sm">
              The Hollywood Red Carpet digital headquarters. Purpose-built for actors, directors, cinematographers, musicians, and crew who demand absolute data sovereignty and zero middleman commissions.
            </p>

            {/* Live Operational Status */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-950/80 border border-border/80 text-[11px] font-mono text-zinc-300">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <span>Edge CDN: Global Operational</span>
            </div>

            {/* Social Media Channels */}
            <div className="pt-2">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-muted-foreground block mb-3">
                Industry Network & Channels
              </span>
              <div className="flex items-center flex-wrap gap-2.5">
                {socialLinks.map((social) => {
                  const Icon = social.icon;
                  return (
                    <a
                      key={social.name}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={social.ariaLabel}
                      className="w-9 h-9 rounded-xl bg-zinc-950/90 border border-zinc-800 hover:border-gold/60 text-muted-foreground hover:text-gold transition-all flex items-center justify-center shadow-sm hover:scale-105"
                    >
                      <Icon className="w-4 h-4" />
                    </a>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Col 2: Film Roster & Departments */}
          <div className="lg:col-span-2 space-y-3">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5">
              <Clapperboard className="w-3.5 h-3.5 text-gold" />
              Film Roster
            </span>
            <ul className="space-y-2 text-xs font-medium text-muted-foreground">
              <li>
                <Link to="/build" className="hover:text-gold transition-colors block">
                  Directors & Showrunners
                </Link>
              </li>
              <li>
                <Link to="/build" className="hover:text-gold transition-colors block">
                  Cinematographers & DPs
                </Link>
              </li>
              <li>
                <Link to="/build" className="hover:text-gold transition-colors block">
                  Key Grip & Best Boy Electrics
                </Link>
              </li>
              <li>
                <Link to="/build" className="hover:text-gold transition-colors block">
                  Actors & SAG Performers
                </Link>
              </li>
              <li>
                <Link to="/build" className="hover:text-gold transition-colors block">
                  Screenwriters & Authors
                </Link>
              </li>
              <li>
                <Link to="/build" className="hover:text-gold transition-colors block">
                  Sound Mixers & Composers
                </Link>
              </li>
              <li>
                <Link to="/build" className="hover:text-gold transition-colors block">
                  Stunt Coordinators & Crew
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Sovereign Platform & Studio */}
          <div className="lg:col-span-2 space-y-3">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-gold" />
              Studio Platform
            </span>
            <ul className="space-y-2 text-xs font-medium text-muted-foreground">
              <li>
                <Link to="/build" className="hover:text-gold transition-colors block">
                  AI Design Studio
                </Link>
              </li>
              <li>
                <a href="#hollywood-genius" className="hover:text-gold transition-colors block">
                  Hollywood Genius AI
                </a>
              </li>
              <li>
                <a href="#how-it-works" className="hover:text-gold transition-colors block">
                  Google Docs Live Sync
                </a>
              </li>
              <li>
                <a href="#features" className="hover:text-gold transition-colors block">
                  Lossless 4K Showreels
                </a>
              </li>
              <li>
                <a href="#features" className="hover:text-gold transition-colors block">
                  IATSE & SAG Credit Verification
                </a>
              </li>
              <li>
                <a href="#features" className="hover:text-gold transition-colors block">
                  Custom Domains & Edge CDN
                </a>
              </li>
              <li>
                <Link to="/cms" className="hover:text-gold transition-colors block">
                  Headless CMS Manager
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Navigation & Support */}
          <div className="lg:col-span-2 space-y-3">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5 text-gold" />
              Navigation
            </span>
            <ul className="space-y-2 text-xs font-medium text-muted-foreground">
              <li>
                <a href="#how-it-works" className="hover:text-gold transition-colors block">
                  How It Works
                </a>
              </li>
              <li>
                <a href="#features" className="hover:text-gold transition-colors block">
                  Feature Highlights
                </a>
              </li>
              <li>
                <a href="#pricing" className="hover:text-gold transition-colors block">
                  Pricing & Plans
                </a>
              </li>
              <li>
                <a href="#faq" className="hover:text-gold transition-colors block">
                  Frequently Asked Questions
                </a>
              </li>
              <li>
                <Link to="/help" className="hover:text-gold transition-colors block">
                  Help & Knowledge Base
                </Link>
              </li>
              <li>
                <a href="mailto:dev@alistwebs.com" className="hover:text-gold transition-colors block">
                  Executive Support
                </a>
              </li>
            </ul>
          </div>

          {/* Col 5: Legal & Sovereign IP */}
          <div className="lg:col-span-2 space-y-3">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-gold" />
              Legal & IP Trust
            </span>
            <ul className="space-y-2 text-xs font-medium text-muted-foreground">
              <li>
                <a
                  href="https://sovranlyip.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gold hover:text-gold-light transition-colors flex items-center gap-1"
                >
                  <span>Sovereign IP Vault</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li>
                <Link to="/privacy" className="hover:text-gold transition-colors block">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="hover:text-gold transition-colors block">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to="/help" className="hover:text-gold transition-colors block">
                  Union Compliance (IATSE/SAG)
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="hover:text-gold transition-colors block">
                  DMCA & Content Rights
                </Link>
              </li>
              <li>
                <a href="mailto:legal@alistwebs.com" className="hover:text-gold transition-colors block">
                  Legal Inquiries
                </a>
              </li>
            </ul>

            {/* Authenticated user badge */}
            {user && (
              <div className="pt-3 border-t border-border/60">
                <span className="text-[10px] font-mono text-muted-foreground block mb-1">
                  Active Session
                </span>
                <span className="text-xs font-mono text-zinc-300 block truncate max-w-[170px]" title={user.email || ""}>
                  {user.email}
                </span>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="mt-2 text-xs text-red-400 hover:text-red-300 transition-colors flex items-center gap-1.5 font-semibold"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Log out</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Bar: Copyright, Compliance, Back to Top */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground font-normal">
          <div className="space-y-1 text-center sm:text-left">
            <p className="text-zinc-300">
              © {new Date().getFullYear()} A List Webs, Inc. All rights reserved.
            </p>
            <p className="text-zinc-500 text-[11px]">
              Sovereign web architecture for Hollywood talent, film crews, musicians, actors, and writers. No rented profiles. Pure ownership.
            </p>
          </div>

          <div className="flex items-center gap-4">
            <Link to="/terms" className="hover:text-gold transition-colors">
              Terms
            </Link>
            <span className="text-zinc-700">•</span>
            <Link to="/privacy" className="hover:text-gold transition-colors">
              Privacy
            </Link>
            <span className="text-zinc-700">•</span>
            <button
              type="button"
              onClick={scrollToTop}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-950 border border-zinc-800 hover:border-gold/60 text-zinc-300 hover:text-gold transition-all shadow-sm group"
              aria-label="Back to top of page"
            >
              <span>Top</span>
              <ArrowUp className="w-3.5 h-3.5 transition-transform group-hover:-translate-y-0.5 text-gold" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}


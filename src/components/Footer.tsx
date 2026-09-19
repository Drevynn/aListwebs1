import {
  Sparkles,
  ShieldCheck,
  LogOut,
  ArrowUp,
  Youtube,
  Instagram,
  Twitter,
  Linkedin,
  Github,
  Film,
  ExternalLink,
  Clapperboard,
  Crown
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

const Footer = () => {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

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
    { name: "YouTube", icon: Youtube, href: "https://youtube.com/@alistwebs", label: "YouTube" },
    { name: "Instagram", icon: Instagram, href: "https://instagram.com/alistwebs", label: "Instagram" },
    { name: "Twitter / X", icon: Twitter, href: "https://twitter.com/alistwebs", label: "Twitter" },
    { name: "LinkedIn", icon: Linkedin, href: "https://linkedin.com/company/alistwebs", label: "LinkedIn" },
    { name: "GitHub", icon: Github, href: "https://github.com/alistwebs", label: "GitHub" },
    { name: "IMDb / Industry", icon: Film, href: "https://imdb.com", label: "IMDb" },
  ];

  return (
    <footer className="relative border-t border-burgundy/40 bg-gradient-to-b from-background via-burgundy/10 to-background py-16 px-4 sm:px-6 lg:px-8 text-foreground overflow-hidden">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent pointer-events-none" />

      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 pb-12 border-b border-border/70">
          {/* Brand & Socials */}
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
                  Sovereign Creative Studio
                </span>
              </div>
            </Link>

            <p className="text-sm text-muted-foreground max-w-md leading-relaxed">
              Sovereign web architecture for Hollywood talent, actors, filmmakers, cinematographers, and musicians. Absolute ownership and direct casting discovery.
            </p>

            <div className="pt-2">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-muted-foreground block mb-2.5">
                Connect With Us
              </span>
              <div className="flex items-center flex-wrap gap-2">
                {socialLinks.map((social) => {
                  const Icon = social.icon;
                  return (
                    <a
                      key={social.name}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={social.label}
                      className="w-8 h-8 rounded-lg bg-zinc-950/80 border border-zinc-800 hover:border-gold/60 text-muted-foreground hover:text-gold transition-all flex items-center justify-center shadow-sm hover:scale-105"
                    >
                      <Icon className="w-3.5 h-3.5" />
                    </a>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Quick Links: Platform */}
          <div className="lg:col-span-2 space-y-3">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-gold" />
              Studio Tools
            </span>
            <ul className="space-y-2 text-xs font-medium text-muted-foreground">
              <li>
                <Link to="/build" className="hover:text-gold transition-colors block">
                  Portfolio Studio
                </Link>
              </li>
              <li>
                <Link to="/cms" className="hover:text-gold transition-colors block">
                  Headless CMS
                </Link>
              </li>
              <li>
                <a href="/#google-docs-manager" className="hover:text-gold transition-colors block">
                  Google Docs Sync
                </a>
              </li>
              <li>
                <a href="/#sync-dashboard" className="hover:text-gold transition-colors block">
                  Domain & Cloud Sync
                </a>
              </li>
            </ul>
          </div>

          {/* Quick Links: Navigation */}
          <div className="lg:col-span-2 space-y-3">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5">
              <Clapperboard className="w-3.5 h-3.5 text-gold" />
              Navigation
            </span>
            <ul className="space-y-2 text-xs font-medium text-muted-foreground">
              <li>
                <a href="/#how-it-works" className="hover:text-gold transition-colors block">
                  How It Works
                </a>
              </li>
              <li>
                <a href="/#pricing" className="hover:text-gold transition-colors block">
                  Pricing Plans
                </a>
              </li>
              <li>
                <a href="/#features" className="hover:text-gold transition-colors block">
                  Features & Roster
                </a>
              </li>
              <li>
                <Link to="/help" className="hover:text-gold transition-colors block">
                  Help & How-To
                </Link>
              </li>
            </ul>
          </div>

          {/* Quick Links: Legal & Support */}
          <div className="lg:col-span-2 space-y-3">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-gold" />
              Legal & Trust
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
                <a href="mailto:dev@alistwebs.com" className="hover:text-gold transition-colors block">
                  Executive Support
                </a>
              </li>
            </ul>
          </div>

          {/* Account & Session */}
          <div className="lg:col-span-2 space-y-3">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5">
              <Crown className="w-3.5 h-3.5 text-gold" />
              Account
            </span>
            {user ? (
              <div className="space-y-2 text-xs">
                <span className="text-[11px] font-mono text-zinc-300 block truncate max-w-[170px] bg-zinc-950/80 border border-zinc-800 px-2 py-1 rounded" title={user.email || ""}>
                  {user.email}
                </span>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="text-red-400 hover:text-red-300 transition-colors flex items-center gap-1.5 font-semibold pt-1"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Log out</span>
                </button>
              </div>
            ) : (
              <div className="space-y-2 text-xs">
                <Link to="/auth" className="text-gold hover:underline block font-semibold">
                  Sign In / Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Bottom copyright bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} A List Webs, Inc. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <span className="text-[11px] text-zinc-500">Hollywood, CA</span>
            <span className="text-zinc-700">•</span>
            <button
              type="button"
              onClick={scrollToTop}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-950 border border-zinc-800 hover:border-gold/60 text-zinc-300 hover:text-gold transition-all shadow-sm group"
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
};

export default Footer;


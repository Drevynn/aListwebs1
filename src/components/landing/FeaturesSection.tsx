import React from "react";
import { 
  ShieldCheck, 
  Mail, 
  Lock, 
  Zap, 
  Globe, 
  Smartphone, 
  CheckCircle2, 
  Sparkles,
  FileCheck,
  Users
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

export const FeaturesSection: React.FC = () => {
  const features = [
    {
      icon: <Globe className="w-5 h-5 text-gold" />,
      title: "Apex Custom Domain Identity",
      badge: "Pure Sovereignty",
      description:
        "Send and receive from booking@yourname.com or press@yourlabel.io with zero third-party branding or forced platform redirects.",
    },
    {
      icon: <ShieldCheck className="w-5 h-5 text-emerald-400" />,
      title: "2048-bit DKIM & SPF Cryptography",
      badge: "99.8% Deliverability",
      description:
        "Cryptographically sealed outbound messages prevent spoofing and guarantee festival booking offers and Hollywood sync proposals reach the primary inbox.",
    },
    {
      icon: <Users className="w-5 h-5 text-amber-400" />,
      title: "Multi-Desk Department Routing",
      badge: "Label Architecture",
      description:
        "Segment your incoming communications into specialized desks: Tour Booking, Press & EPK, Master Sync Licensing, and VIP Fan Inquiries.",
    },
    {
      icon: <Lock className="w-5 h-5 text-sky-400" />,
      title: "Zero Telemetry & Private NVMe Storage",
      badge: "No Ad Scanners",
      description:
        "Big Tech scans your private emails to train public AI models and sell ad profiles. Alist Mail is encrypted, private, and strictly your sovereign property.",
    },
    {
      icon: <FileCheck className="w-5 h-5 text-purple-400" />,
      title: "Automated DNS Registrar Sync",
      badge: "1-Click Setup",
      description:
        "Pre-formatted records with copy-paste zone files and targeted setup guides for Cloudflare, GoDaddy, Namecheap, Google Domains, and Route 53.",
    },
    {
      icon: <Smartphone className="w-5 h-5 text-rose-400" />,
      title: "Webmail Client & Standard IMAP/POP3",
      badge: "Universal Access",
      description:
        "Access your sovereign mail through our high-contrast webmail client or connect directly to Apple Mail, iOS, Outlook, and Thunderbird.",
    },
  ];

  return (
    <section id="mail-features" className="py-20 bg-background relative overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gold/10 border border-gold/25 text-gold text-xs font-semibold">
            <Zap className="w-3.5 h-3.5" />
            <span>Enterprise Sovereign Infrastructure</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-display font-bold text-foreground tracking-tight">
            Why Creators Switch to Custom Domain Email
          </h2>

          <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
            When music supervisors and talent buyers see a free generic Gmail or Yahoo address, booking fees drop. A sovereign domain email signals authority and ownership.
          </p>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feat, idx) => (
            <div
              key={idx}
              className="p-6 rounded-3xl bg-card/60 border border-border/50 hover:border-gold/40 transition-all space-y-4 group hover:shadow-xl hover:shadow-gold/5"
            >
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-2xl bg-muted/50 flex items-center justify-center group-hover:scale-110 transition-transform">
                  {feat.icon}
                </div>
                <Badge variant="outline" className="text-[10px] font-mono border-border/60 bg-muted/20">
                  {feat.badge}
                </Badge>
              </div>

              <div className="space-y-2">
                <h3 className="text-base font-bold text-foreground group-hover:text-gold transition-colors font-display">
                  {feat.title}
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {feat.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;

import { motion } from "framer-motion";
import { Sparkles, Music, Film, Mail, Globe, Search, RefreshCw, FileText } from "lucide-react";

export default function Features() {
  const features = [
    {
      icon: Music,
      title: "Interactive EPK & Press Engine",
      description:
        "Give booking agents, festival curators, and label A&Rs a dedicated press kit with downloadable high-res assets, tour dates, bios, and technical stage riders in one click.",
    },
    {
      icon: Mail,
      title: "Turnkey Domain Webmail (/mail)",
      description:
        "Every site includes a dedicated custom-domain inbox (e.g. booking@yourband.com or press@filmmaker.com). Stop paying Google Workspace $7.20/mo per seat.",
    },
    {
      icon: Film,
      title: "Lossless Audio & 4K Screener Hub",
      description:
        "Stream uncompressed 24-bit FLAC audio masters and 4K showreels. Protect private festival cuts and unreleased albums with secure screener passcodes.",
    },
    {
      icon: RefreshCw,
      title: "Lossless Cloud & Drive Sync",
      description:
        "Sync tour dates, stem files, and high-res photos directly from Google Drive, Dropbox, or OneDrive. Update your live site without opening a web builder.",
    },
    {
      icon: Search,
      title: "Dynamic SEO & Social Share Studio",
      description:
        "Fine-tune your Google search rankings, meta descriptions, and Open Graph social preview cards for iMessage, WhatsApp, and X directly from your studio dashboard.",
    },
    {
      icon: Globe,
      title: "Custom Domain & Edge CDN",
      description:
        "Connect your own custom domain (e.g. yourname.com) with automated SSL encryption and lightning-fast global edge delivery with 99.9% uptime.",
    },
  ];

  return (
    <section id="features" className="py-24 px-4 sm:px-6 lg:px-8 bg-muted/30 dark:bg-zinc-950/40 border-y border-border relative">
      <div className="max-w-6xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-gold/10 border border-gold/30 text-gold text-xs font-mono uppercase tracking-widest font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            Built For Serious Careers
          </div>
          <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
            Capabilities Generic Builders Don&apos;t Offer
          </h2>
          <p className="text-muted-foreground text-sm sm:text-base">
            Engineered specifically for musicians, filmmakers, actors, and authors who demand an integrated creative ecosystem.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.1 }}
                className="p-8 rounded-2xl bg-card border border-border hover:border-gold/50 transition-all flex flex-col justify-between relative group shadow-md hover:shadow-xl"
              >
                <div className="space-y-4">
                  <div className="w-12 h-12 rounded-xl bg-gold/15 text-gold flex items-center justify-center border border-gold/30 group-hover:scale-110 transition-transform">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-display font-bold text-foreground">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

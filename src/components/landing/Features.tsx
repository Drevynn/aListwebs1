import { motion } from "framer-motion";
import { Sparkles, Music, Film, UserCheck, Globe, FileText, ShieldCheck } from "lucide-react";

export default function Features() {
  const features = [
    {
      icon: Music,
      title: "Lossless Audio & Stage Riders",
      description: "Stream uncompressed 24-bit FLAC masters, embed Apple Music/Spotify links, and share technical input lists with venue sound engineers.",
    },
    {
      icon: Film,
      title: "4K Showreels & Festival Screeners",
      description: "Host high-bitrate video showreels, protect private cuts with custom festival screener passcodes, and display award laurels.",
    },
    {
      icon: UserCheck,
      title: "Casting Dossiers & SAG Credits",
      description: "Equip casting directors and agents with downloadable 300DPI headshots, scene reels, and complete credit matrices.",
    },
    {
      icon: Globe,
      title: "Custom Domain & SSL Mapping",
      description: "Map your own domain (e.g. artistname.com) with automated zero-downtime HTTPS security certificates and lightning-fast edge CDN.",
    },
    {
      icon: FileText,
      title: "Google Docs Real-Time Sync",
      description: "Manage tour dates, setlists, biographies, and press releases in Google Docs and have your live website update instantly.",
    },
    {
      icon: ShieldCheck,
      title: "Sovereign IP Protection",
      description: "Protect original works, copyright provenance, and authorship timestamps directly through our integrated Sovranly IP partnership.",
    },
  ];

  return (
    <section id="features" className="py-24 px-4 sm:px-6 lg:px-8 bg-muted/30 dark:bg-zinc-950/40 border-y border-border relative">
      <div className="max-w-6xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-gold/10 border border-gold/30 text-gold text-xs font-mono uppercase tracking-widest font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            Powerful Capabilities
          </div>
          <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
            Everything a Professional Creator Needs
          </h2>
          <p className="text-muted-foreground text-sm sm:text-base">
            Engineered specifically for musicians, filmmakers, actors, and writers who demand absolute excellence.
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

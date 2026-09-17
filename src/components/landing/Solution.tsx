import { motion } from "framer-motion";
import { Sparkles, CheckCircle2, ShieldCheck, Zap, Globe, Cpu } from "lucide-react";

export default function Solution() {
  const outcomes = [
    {
      title: "Launch in Minutes with AI Design Studio",
      description: "Describe your aesthetic in plain English or pick a musician, filmmaker, or writer preset. Our AI engine compiles a lightning-fast, high-contrast digital headquarters instantly.",
    },
    {
      title: "100% Data & Revenue Sovereignty",
      description: "Keep 100% of your earnings. Connect your Stripe account directly for ticket sales, merch, and lossless downloads with zero middleman commissions.",
    },
    {
      title: "Real-Time Google Docs Synchronization",
      description: "Update tour dates, setlists, biographies, and press announcements on the go inside Google Docs. Your website updates automatically in real-time.",
    },
    {
      title: "Pristine Media & Screener Portals",
      description: "Host uncompressed 24-bit FLAC audio players, 4K showreels, password-protected festival screeners, and 300DPI press kits with absolute elegance.",
    },
  ];

  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 bg-zinc-950/40 border-y border-white/5 relative">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Column: Copy & Outcomes */}
          <div className="space-y-6">
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-gold/10 border border-gold/30 text-gold text-xs font-mono uppercase tracking-widest">
              <Sparkles className="w-3.5 h-3.5" />
              The Sovereign Solution
            </div>

            <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
              Your Complete Digital Headquarters, Built Without Compromise
            </h2>

            <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
              A-list Websites combines cutting-edge AI design generation with zero-latency edge delivery, giving creators absolute control over their brand, audience, and revenue.
            </p>

            <div className="space-y-4 pt-4">
              {outcomes.map((item, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: idx * 0.1 }}
                  className="flex items-start gap-3.5 p-4 rounded-xl bg-zinc-900/60 border border-white/10"
                >
                  <div className="w-6 h-6 rounded-full bg-gold/20 text-gold flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-semibold text-sm sm:text-base text-foreground">
                      {item.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Right Column: Visual Mockup / Preview Card */}
          <div className="relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-gold/30 to-blue-600/30 rounded-3xl blur-xl opacity-50" />
            
            <div className="relative p-6 sm:p-8 rounded-3xl bg-zinc-900 border border-white/15 shadow-2xl space-y-6">
              <div className="flex items-center justify-between pb-6 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-black/50 border border-gold/40 flex items-center justify-center">
                    <img src="/logo.png" alt="A-list Websites" className="w-6 h-6 object-contain" referrerPolicy="no-referrer" />
                  </div>
                  <div>
                    <h4 className="font-display font-bold text-foreground">Marcus Vance HQ</h4>
                    <p className="text-xs text-gold font-mono">marcusvance.com • Live</p>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-mono uppercase">
                  Edge Secured
                </span>
              </div>

              {/* Mockup audio / video player preview */}
              <div className="p-4 rounded-2xl bg-black/60 border border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-muted-foreground uppercase">Lossless Master Stream</span>
                  <span className="text-xs font-mono text-gold">24-bit / 96kHz FLAC</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gold/20 flex items-center justify-center text-gold font-bold">▶</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">Midnight Symphony (Live at Red Rocks)</p>
                    <p className="text-xs text-muted-foreground">Master Audio • 4:18</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3.5 rounded-xl bg-black/40 border border-white/10">
                  <p className="text-[10px] font-mono text-muted-foreground uppercase">Google Docs Sync</p>
                  <p className="text-xs font-semibold text-foreground mt-1 truncate">Tour_Dates_2026.gdoc</p>
                  <span className="text-[10px] text-emerald-400 font-mono mt-1 block">Synced 2m ago</span>
                </div>
                <div className="p-3.5 rounded-xl bg-black/40 border border-white/10">
                  <p className="text-[10px] font-mono text-muted-foreground uppercase">Direct Subscriptions</p>
                  <p className="text-xs font-semibold text-foreground mt-1">1,420 Active Fans</p>
                  <span className="text-[10px] text-gold font-mono mt-1 block">0% Commission</span>
                </div>
              </div>

              <div className="pt-2 text-center">
                <span className="text-xs text-muted-foreground italic">
                  "The most seamless digital platform I've ever used as an independent touring artist."
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

import { motion } from "framer-motion";
import { AlertTriangle, XCircle, CheckCircle2, Mail, Layers, DollarSign } from "lucide-react";

export default function Problem() {
  const pains = [
    {
      icon: Mail,
      title: "The $7/Seat 'Email Tax'",
      description:
        "Generic builders force you to pay Google Workspace or Microsoft $7.20/month per seat just to have booking@yourband.com or press@filmmaker.com. It's an unnecessary ongoing tax on independent art.",
    },
    {
      icon: Layers,
      title: "Generic AI Output & Compressed Media",
      description:
        "Horizontal builders generate dental-clinic templates. They compress pristine 24-bit WAV masters, fail to handle 4K showreels, and have no concept of an Electronic Press Kit (EPK) or union credits.",
    },
    {
      icon: DollarSign,
      title: "Subscription Chaos ($65+/Month)",
      description:
        "Creators end up juggling 4 separate logins: a site builder, Google Workspace email, Sonicbids for press kits, and Dropbox for stems. You spend more time managing subscriptions than making art.",
    },
  ];

  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 bg-background relative overflow-hidden">
      <div className="max-w-6xl mx-auto space-y-16">
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-mono uppercase tracking-widest">
            <AlertTriangle className="w-3.5 h-3.5" />
            The Creator Subscription Trap
          </div>
          <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
            Why Generic AI Website Builders Fail Serious Artists
          </h2>
          <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
            Musicians, filmmakers, actors, and writers don&apos;t need another SaaS marketing template. They need an integrated operating system built around how creative careers actually work.
          </p>
        </div>

        {/* 3 Core Pains */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {pains.map((pain, idx) => {
            const Icon = pain.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.1 }}
                className="p-8 rounded-2xl bg-card border border-red-500/30 hover:border-red-500/50 transition-all flex flex-col justify-between relative group shadow-lg"
              >
                <div className="space-y-4">
                  <div className="w-12 h-12 rounded-xl bg-red-500/15 text-red-500 dark:text-red-400 flex items-center justify-center border border-red-500/30 group-hover:scale-110 transition-transform">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-display font-bold text-foreground">
                    {pain.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {pain.description}
                  </p>
                </div>

                <div className="pt-6 mt-6 border-t border-border flex items-center gap-2 text-xs text-red-600 dark:text-red-400 font-mono font-medium">
                  <XCircle className="w-4 h-4 shrink-0" />
                  <span>Cost: Fragmented brand & wasted cash</span>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Comparison Box: Old Way vs AlistWebs */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="p-6 sm:p-8 rounded-3xl bg-zinc-950 border border-white/10 shadow-2xl"
        >
          <div className="text-center max-w-xl mx-auto mb-8 space-y-2">
            <h3 className="text-lg sm:text-xl font-bold font-display text-white">
              The Math Is Simple: Stop Paying The Fragmentation Tax
            </h3>
            <p className="text-xs sm:text-sm text-zinc-400">
              Compare juggling four disjointed tools against one unified creative headquarters.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
            {/* The Fragmented Old Way */}
            <div className="p-6 rounded-2xl bg-red-950/20 border border-red-500/30 space-y-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-red-500/20">
                  <span className="text-xs font-mono font-bold text-red-400 uppercase tracking-wider">
                    The Fragmented Old Way
                  </span>
                  <span className="text-lg font-bold text-red-400 font-mono">$65+/month</span>
                </div>

                <ul className="space-y-3 pt-4 text-xs sm:text-sm text-zinc-300">
                  <li className="flex items-center gap-2">
                    <XCircle className="w-4 h-4 text-red-400 shrink-0" />
                    <span>Website Builder (Squarespace / Wix): <strong>$16–$24/mo</strong></span>
                  </li>
                  <li className="flex items-center gap-2">
                    <XCircle className="w-4 h-4 text-red-400 shrink-0" />
                    <span>Google Workspace Custom Email: <strong>$7.20/mo per seat</strong></span>
                  </li>
                  <li className="flex items-center gap-2">
                    <XCircle className="w-4 h-4 text-red-400 shrink-0" />
                    <span>Dedicated EPK Tool (Sonicbids / Bandzoogle): <strong>$15–$20/mo</strong></span>
                  </li>
                  <li className="flex items-center gap-2">
                    <XCircle className="w-4 h-4 text-red-400 shrink-0" />
                    <span>Cloud Storage for Stems / 4K Reels (Dropbox): <strong>$15/mo</strong></span>
                  </li>
                </ul>
              </div>

              <div className="pt-4 border-t border-red-500/20 text-[11px] font-mono text-red-400/90">
                ⚠️ 4 separate logins • 4 invoices • Incompatible media embeds
              </div>
            </div>

            {/* The AlistWebs Sovereign Way */}
            <div className="p-6 rounded-2xl bg-gradient-to-br from-burgundy/30 via-zinc-900 to-gold/10 border border-gold/40 space-y-4 flex flex-col justify-between shadow-xl">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-gold/30">
                  <span className="text-xs font-mono font-bold text-gold uppercase tracking-wider">
                    The AlistWebs Way
                  </span>
                  <span className="text-xl font-bold text-gold-light font-mono">$19/month all-in</span>
                </div>

                <ul className="space-y-3 pt-4 text-xs sm:text-sm text-zinc-200">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-gold shrink-0" />
                    <span><strong>Sovereign Digital HQ</strong> (Edge CDN, mobile-first, no code)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-gold shrink-0" />
                    <span><strong>Native Custom Webmail</strong> (booking@, press@ included)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-gold shrink-0" />
                    <span><strong>Industry EPK Engine</strong> (A&R, festival & agent ready)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-gold shrink-0" />
                    <span><strong>Lossless Media Sync</strong> (Google Drive & Dropbox integration)</span>
                  </li>
                </ul>
              </div>

              <div className="pt-4 border-t border-gold/20 text-[11px] font-mono text-gold flex items-center justify-between">
                <span>✨ 1 subscription • 1 clean dashboard • 100% data ownership</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

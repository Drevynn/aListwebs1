import { motion } from "framer-motion";
import { AlertTriangle, XCircle, DollarSign, Lock, Share2 } from "lucide-react";

export default function Problem() {
  const pains = [
    {
      icon: Share2,
      title: "Algorithmic De-Platforming",
      description: "Social media feeds bury your art unless you pay for reach. You don't own your followers or direct fan data.",
    },
    {
      icon: DollarSign,
      title: "Pompous Commissions & Hidden Fees",
      description: "Traditional portfolio and ticketing builders take a heavy cut of your hard-earned music, merch, and ticket sales.",
    },
    {
      icon: Lock,
      title: "Clunky Code & Fragmented Tools",
      description: "Juggling website builders, separate mailing lists, file storage, and broken mobile layouts wastes days of creative flow.",
    },
  ];

  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 bg-background relative">
      <div className="max-w-6xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-mono uppercase tracking-widest">
            <AlertTriangle className="w-3.5 h-3.5" />
            The Creator Dilemma
          </div>
          <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
            Why Standard Website Builders Fail Creators
          </h2>
          <p className="text-muted-foreground text-sm sm:text-base">
            Musicians, filmmakers, writers, and influencers deserve a sovereign digital headquarters—not rented space on fragile platforms.
          </p>
        </div>

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
                  <span>Result: Lost revenue & zero control</span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

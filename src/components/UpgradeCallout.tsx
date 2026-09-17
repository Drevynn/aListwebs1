import { useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, Zap, Globe, BarChart3, Music, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { startCheckoutSession } from "@/lib/stripe";
import { useAuth } from "@/hooks/useAuth";

const proPerks = [
  { icon: Zap, label: "Advanced AI vibe coding" },
  { icon: Globe, label: "Custom domain + SSL" },
  { icon: Music, label: "Tour dates & merch tools" },
  { icon: BarChart3, label: "Deep fan analytics" },
];

const UpgradeCallout = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleUpgrade = async () => {
    setLoading(true);
    try {
      const res = await startCheckoutSession("starter", user?.email || undefined);
      if (res.needsKey) {
        toast.info("Stripe integration is ready. Configure STRIPE_SECRET_KEY in Settings to process payments.");
        return;
      }
      if (res.error) {
        toast.error(res.error);
        return;
      }
      if (res.url) {
        toast.success("Redirecting to Stripe Checkout...");
        window.location.href = res.url;
      }
    } catch (err) {
      toast.error("Failed to initiate upgrade.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="relative py-20 px-6">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="glass-card p-8 md:p-12 border-gold/30 glow-gold relative overflow-hidden"
        >
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-gold/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative grid md:grid-cols-[1.4fr_1fr] gap-10 items-center">
            <div>
              <span className="inline-flex items-center gap-1.5 bg-gold/15 text-gold text-xs font-semibold px-3 py-1.5 rounded-full mb-4">
                <Sparkles className="w-3 h-3" />
                Upgrade to Starter
              </span>
              <h2 className="font-display text-3xl md:text-4xl font-bold mb-3">
                Unlock the full <span className="text-gold">A List</span> toolkit
              </h2>
              <p className="text-muted-foreground mb-6">
                Starter gives serious creators everything they need to grow: a custom
                domain, advanced AI design, tour & merch tools, and the analytics
                to back it up.
              </p>

              <ul className="grid sm:grid-cols-2 gap-3 mb-8">
                {proPerks.map(({ icon: Icon, label }) => (
                  <li
                    key={label}
                    className="flex items-center gap-3 text-sm text-foreground/90"
                  >
                    <span className="w-8 h-8 rounded-lg bg-gold/15 text-gold flex items-center justify-center flex-shrink-0">
                      <Icon className="w-4 h-4" />
                    </span>
                    {label}
                  </li>
                ))}
              </ul>

              <Button
                variant="hero"
                size="lg"
                disabled={loading}
                onClick={handleUpgrade}
                className="gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-gold" />
                    Connecting to Stripe...
                  </>
                ) : (
                  <>
                    Upgrade to Starter ($19/mo)
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </Button>
            </div>

            <div className="hidden md:flex justify-center">
              <div className="relative">
                <div className="w-44 h-44 rounded-full bg-gradient-to-br from-gold/30 to-primary/20 blur-2xl absolute inset-0" />
                <div className="relative w-44 h-44 rounded-full glass-card flex items-center justify-center border-gold/40">
                  <Sparkles className="w-16 h-16 text-gold" />
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default UpgradeCallout;

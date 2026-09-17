import { motion } from "framer-motion";
import { Sparkles, Hammer, Globe, Rocket, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export default function HowItWorks() {
  const navigate = useNavigate();

  const steps = [
    {
      number: "01",
      icon: Hammer,
      title: "Build & Customize",
      description: "Use the AI Design Studio or Portfolio Generator to pick your creative discipline and assemble your bio, media, and touring schedules in seconds.",
    },
    {
      number: "02",
      icon: Globe,
      title: "Connect & Sync",
      description: "Map your custom domain name with zero-config SSL certificates and link Google Docs for effortless real-time updates.",
    },
    {
      number: "03",
      icon: Rocket,
      title: "Publish & Own",
      description: "Deploy to global edge CDN with instant HTTPS. Accept payments and connect directly with fans with zero middleman commissions.",
    },
  ];

  return (
    <section id="how-it-works" className="py-24 px-4 sm:px-6 lg:px-8 bg-background relative">
      <div className="max-w-6xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-gold/10 border border-gold/30 text-gold text-xs font-mono uppercase tracking-widest">
            <Sparkles className="w-3.5 h-3.5" />
            Simple 3-Step Process
          </div>
          <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
            From Idea to Sovereign Website in Minutes
          </h2>
          <p className="text-muted-foreground text-sm sm:text-base">
            No complicated code, no bloated plugins, and no rented platforms. Just pure creative power.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.1 }}
                className="p-8 rounded-2xl bg-zinc-900/60 border border-white/10 flex flex-col justify-between relative group hover:border-gold/40 transition-all shadow-xl"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-xl bg-gold/10 text-gold flex items-center justify-center border border-gold/20 group-hover:scale-110 transition-transform">
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="font-display text-4xl font-extrabold text-white/10 group-hover:text-gold/20 transition-colors">
                      {step.number}
                    </span>
                  </div>
                  <h3 className="text-xl font-display font-bold text-foreground">
                    {step.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {step.description}
                  </p>
                </div>

                <div className="pt-6 mt-6 border-t border-white/5 flex items-center gap-2 text-xs text-gold font-mono">
                  <span>Step {step.number} of 03</span>
                </div>
              </motion.div>
            );
          })}
        </div>

        <div className="text-center">
          <Button
            variant="hero"
            onClick={() => navigate("/build")}
            className="gap-2 text-sm px-6 py-3"
          >
            <span>Start Building Now</span>
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </section>
  );
}

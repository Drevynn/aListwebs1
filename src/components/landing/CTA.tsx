import { motion } from "framer-motion";
import { Sparkles, ArrowRight, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export default function CTA() {
  const navigate = useNavigate();

  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 bg-background relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-t from-gold/10 via-transparent to-transparent pointer-events-none" />

      <div className="max-w-5xl mx-auto relative z-10">
        <div className="p-10 sm:p-16 rounded-3xl bg-card border border-gold/40 shadow-2xl text-center space-y-6 relative overflow-hidden">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gold/10 border border-gold/30 text-gold text-xs font-mono uppercase tracking-widest mx-auto font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            Claim Your Digital Sovereignty
          </div>

          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-foreground max-w-2xl mx-auto">
            Ready to Build Your Professional Creator Headquarters?
          </h2>

          <p className="text-muted-foreground text-base sm:text-lg max-w-xl mx-auto">
            Join independent musicians, filmmakers, writers, and influencers who own their brand, audience, and revenue.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Button
              variant="hero"
              onClick={() => navigate("/build")}
              className="gap-2 text-sm px-8 py-4 w-full sm:w-auto shadow-lg shadow-gold/20 font-bold"
            >
              <span>SIGN UP / START FREE</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                const elem = document.getElementById("how-it-works");
                if (elem) elem.scrollIntoView({ behavior: "smooth" });
              }}
              className="text-sm px-8 py-4 w-full sm:w-auto border-border hover:bg-muted font-medium"
            >
              SEE HOW IT WORKS / VIEW PRICING
            </Button>
          </div>

          <div className="flex items-center justify-center gap-6 pt-6 text-xs text-muted-foreground font-mono">
            <span className="flex items-center gap-1.5 font-medium">
              <ShieldCheck className="w-4 h-4 text-gold" />
              Zero middleman commissions
            </span>
            <span className="flex items-center gap-1.5 font-medium">
              <Sparkles className="w-4 h-4 text-gold" />
              Instant edge deployment
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

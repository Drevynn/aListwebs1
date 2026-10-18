import { motion } from "framer-motion";
import { Sparkles, ArrowRight, ShieldCheck, CheckCircle2, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export default function CTA() {
  const navigate = useNavigate();

  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 bg-background relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-t from-gold/10 via-burgundy/10 to-transparent pointer-events-none" />

      <div className="max-w-5xl mx-auto relative z-10">
        <div className="p-10 sm:p-16 rounded-3xl bg-card border border-gold/40 shadow-2xl text-center space-y-6 relative overflow-hidden">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gold/10 border border-gold/30 text-gold text-xs font-mono uppercase tracking-widest mx-auto font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            Launch Your Digital Headquarters
          </div>

          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-foreground max-w-2xl mx-auto">
            Stop Fragmenting Your Art Across Four Tools.
          </h2>

          <p className="text-muted-foreground text-base sm:text-lg max-w-xl mx-auto leading-relaxed">
            Get your industry-standard EPK, turnkey custom email (<span className="text-gold font-mono">booking@yourname.com</span>), and lossless media players in one sovereign link.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Button
              variant="hero"
              onClick={() => navigate("/build")}
              className="gap-2 text-sm px-10 py-5 w-full sm:w-auto shadow-xl shadow-gold/25 font-bold rounded-xl bg-gradient-to-r from-burgundy via-burgundy-light to-gold text-white hover:brightness-110 transition-all text-base"
            >
              <span>START FREE / LAUNCH YOUR HQ</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
            <button
              type="button"
              onClick={() => {
                const elem = document.getElementById("how-it-works");
                if (elem) elem.scrollIntoView({ behavior: "smooth" });
              }}
              className="text-xs sm:text-sm font-semibold text-muted-foreground hover:text-gold transition-colors py-3 px-4 inline-flex items-center gap-2 tracking-wider uppercase font-mono"
            >
              <span>SEE HOW IT WORKS / VIEW PRICING</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 pt-6 text-xs text-muted-foreground font-mono border-t border-border/60">
            <span className="flex items-center gap-1.5 font-medium">
              <CheckCircle2 className="w-4 h-4 text-gold" />
              No credit card required
            </span>
            <span className="flex items-center gap-1.5 font-medium">
              <ShieldCheck className="w-4 h-4 text-gold" />
              0% cut on merch & tickets
            </span>
            <span className="flex items-center gap-1.5 font-medium">
              <Star className="w-4 h-4 text-gold" />
              Instant 14-day full access
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

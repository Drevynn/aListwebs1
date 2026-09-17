import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, ArrowRight, CheckCircle2, ShieldCheck, Star, Award, Clapperboard, Film, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import alistLogoTransparent from "@/assets/alistlogo_transparent.png";
import heroBanner from "@/assets/hero_hollywood_banner.jpg";

export default function Hero() {
  const navigate = useNavigate();
  const [activeVisual, setActiveVisual] = useState<"emblem" | "premiere">("emblem");

  const handleSecondaryClick = () => {
    const elem = document.getElementById("how-it-works");
    if (elem) elem.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 px-4 sm:px-6 lg:px-8 overflow-hidden bg-background">
      {/* Hollywood ambient red wallpaper & golden spotlight ambiance */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[650px] bg-gradient-to-b from-red-700/20 via-burgundy/25 to-transparent blur-[140px] pointer-events-none -z-10" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[520px] bg-gradient-to-b from-amber-500/20 via-burgundy-light/20 to-transparent blur-[160px] pointer-events-none rounded-full -z-10" />
      <div className="absolute top-24 right-6 w-96 h-96 bg-red-600/15 blur-[130px] pointer-events-none rounded-full -z-10" />
      <div className="absolute top-36 left-6 w-80 h-80 bg-burgundy/30 blur-[120px] pointer-events-none rounded-full -z-10" />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Column: Headline & Conversion Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-6 xl:col-span-7 space-y-6 text-center lg:text-left"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-burgundy/40 border border-gold/40 text-gold-light text-xs font-mono uppercase tracking-widest mx-auto lg:mx-0 shadow-lg shadow-burgundy/30 backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 text-gold animate-pulse" />
              <span>Hollywood Sovereign Web Presence</span>
            </div>

            <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-foreground leading-[1.08]">
              Step Onto The Red Carpet.{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-gold-light to-amber-500 drop-shadow-sm">
                Own Your Creative Empire.
              </span>
            </h1>

            <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto lg:mx-0 leading-relaxed">
              Designed for Hollywood talent, film crews, actors, musicians, and directors. Launch an elite, sovereign digital headquarters with zero middleman commissions, verified union credits, and instant Hollywood Genius AI intelligence.
            </p>

            {/* Primary & Secondary Action buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
              <Button
                variant="hero"
                onClick={() => navigate("/build")}
                className="gap-2 text-sm px-8 py-4 w-full sm:w-auto shadow-xl shadow-gold/25 font-bold rounded-xl bg-gradient-to-r from-burgundy via-burgundy-light to-gold text-white hover:brightness-110 transition-all"
              >
                <span>SIGN UP / START FREE</span>
                <ArrowRight className="w-4 h-4" />
              </Button>

              <button
                type="button"
                onClick={handleSecondaryClick}
                className="text-xs sm:text-sm font-semibold text-muted-foreground hover:text-gold transition-colors py-3 px-4 inline-flex items-center gap-2 tracking-wider uppercase font-mono"
              >
                <span>SEE HOW IT WORKS / VIEW PRICING</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Trust bullet points */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-6 pt-6 text-xs text-muted-foreground font-mono border-t border-border/80">
              <span className="flex items-center gap-1.5 font-medium">
                <CheckCircle2 className="w-4 h-4 text-gold" />
                No credit card required
              </span>
              <span className="flex items-center gap-1.5 font-medium">
                <ShieldCheck className="w-4 h-4 text-gold" />
                16 Film Departments & IATSE scale
              </span>
              <span className="flex items-center gap-1.5 font-medium">
                <Star className="w-4 h-4 text-gold" />
                Hollywood Genius AI included
              </span>
            </div>
          </motion.div>

          {/* Right Column: Visual Focal Point - Official A LIST WEBS Hero Showcase */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15, ease: "easeOut" }}
            className="lg:col-span-6 xl:col-span-5 relative flex flex-col items-center justify-center"
          >
            {/* Cinematic multi-tier glowing halo */}
            <div
              className="absolute inset-0 max-w-[480px] max-h-[480px] m-auto bg-gradient-to-tr from-burgundy via-red-600/25 to-gold/30 rounded-full blur-3xl pointer-events-none -z-10 animate-pulse"
              style={{ animationDuration: '4s' }}
            />

            {/* View Switcher Tabs: Crest vs Premiere Stage */}
            <div className="flex items-center gap-1 p-1 mb-3 rounded-full bg-zinc-950/80 border border-burgundy/60 backdrop-blur-md z-20 shadow-lg">
              <button
                type="button"
                onClick={() => setActiveVisual("emblem")}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono transition-all ${
                  activeVisual === "emblem"
                    ? "bg-gradient-to-r from-burgundy to-gold text-zinc-950 font-bold shadow-sm"
                    : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                <Crown className="w-3 h-3" />
                <span>Sovereign Crest</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveVisual("premiere")}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono transition-all ${
                  activeVisual === "premiere"
                    ? "bg-gradient-to-r from-burgundy to-gold text-zinc-950 font-bold shadow-sm"
                    : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                <Film className="w-3 h-3" />
                <span>Premiere Stage</span>
              </button>
            </div>

            <div className="relative w-full max-w-[420px] sm:max-w-[480px] p-2 flex items-center justify-center group">
              {/* Floating Top Badge */}
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="absolute -top-3 sm:-top-4 left-4 sm:left-6 z-30 flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-zinc-950/95 border border-gold/50 backdrop-blur-md shadow-xl shadow-burgundy/30"
              >
                <Award className="w-3.5 h-3.5 text-gold animate-bounce" />
                <span className="text-[11px] font-bold text-amber-200 tracking-wide font-mono uppercase">
                  Hollywood Official
                </span>
              </motion.div>

              {/* Floating Bottom Badge */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
                className="absolute -bottom-2 sm:-bottom-3 right-4 sm:right-6 z-30 flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-zinc-950/95 border border-gold/50 backdrop-blur-md shadow-xl shadow-burgundy/30"
              >
                <Clapperboard className="w-3.5 h-3.5 text-gold" />
                <span className="text-[11px] font-bold text-amber-200 tracking-wide font-mono uppercase">
                  Red Carpet Ready
                </span>
              </motion.div>

              {/* Display Area: Animated view switch */}
              <div className="relative w-full aspect-square flex items-center justify-center transition-transform duration-500 group-hover:scale-[1.02]">
                <AnimatePresence mode="wait">
                  {activeVisual === "emblem" ? (
                    <motion.div
                      key="emblem"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.35 }}
                      className="w-full h-full flex items-center justify-center p-2"
                    >
                      <img
                        src={alistLogoTransparent}
                        alt="A List Webs — Official Hollywood Red Carpet Crest"
                        className="w-full h-full object-contain drop-shadow-[0_25px_60px_rgba(245,158,11,0.45)] filter saturate-[1.05]"
                        loading="eager"
                        decoding="async"
                        referrerPolicy="no-referrer"
                      />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="premiere"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.35 }}
                      className="w-full h-full rounded-2xl overflow-hidden border-2 border-gold/60 shadow-2xl shadow-gold/25 relative group/banner bg-zinc-950"
                    >
                      <img
                        src={heroBanner}
                        alt="A List Webs — Hollywood Red Carpet Gala Premiere Stage"
                        className="w-full h-full object-cover object-center transform transition-transform duration-700 group-hover/banner:scale-105"
                        loading="eager"
                        decoding="async"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent pointer-events-none" />
                      <div className="absolute bottom-3 left-4 right-4 text-center">
                        <span className="text-xs font-mono font-bold text-amber-200 tracking-wider uppercase bg-zinc-950/80 px-3 py-1 rounded-full border border-gold/40 backdrop-blur-sm">
                          Premiere Night Atmosphere
                        </span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}


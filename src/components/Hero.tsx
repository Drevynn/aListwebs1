import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, Laptop } from "lucide-react";
import { Link } from "react-router-dom";
import heroPreviewImg from "@/assets/images/hero_website_preview_1788650353569.jpg";

const Hero = () => {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden px-6 pt-24 pb-16">
      {/* Ambient background effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gold/8 rounded-full blur-3xl animate-float" style={{ animationDelay: "-3s" }} />
        <div className="absolute top-1/3 right-1/3 w-64 h-64 bg-gold/5 rounded-full blur-3xl animate-float" style={{ animationDelay: "-5s" }} />
      </div>

      {/* Grid overlay */}
      <div 
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(hsl(var(--foreground)) 1px, transparent 1px),
                           linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)`,
          backgroundSize: "60px 60px"
        }}
      />

      <div className="relative z-10 max-w-5xl mx-auto text-center">
        {/* Brand Emblem Logo Hero Feature */}
        <motion.div
          initial={{ opacity: 0, scale: 0.85, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex justify-center mb-6"
        >
          <img
            src="/logo.png"
            alt="A List Webs Emblem"
            className="w-24 h-24 sm:w-32 sm:h-32 object-contain hover:scale-105 transition-transform duration-500"
            referrerPolicy="no-referrer"
          />
        </motion.div>

        {/* Eyebrow */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gold/10 border border-gold/30 text-gold text-xs font-mono uppercase tracking-widest mb-6"
        >
          Next-Gen Sovereign Web Architecture for Creatives
        </motion.div>

        {/* Main headline */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="font-display text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight mb-6 shiny-gold-header"
        >
          Launch a professional website
          <br />
          <span>built for how creatives work</span>
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="text-lg md:text-2xl text-muted-foreground max-w-3xl mx-auto mb-10 leading-relaxed"
        >
          The AI-powered digital headquarters for <span className="text-white font-medium">Musicians</span>, <span className="text-white font-medium">Filmmakers</span>, <span className="text-white font-medium">Actors</span>, and <span className="text-white font-medium">Writers</span>. Turn your music, 4K showreels, casting headshots, and manuscripts into a sovereign digital monolith—backed by schema-first Google Cloud and Firebase architecture.
        </motion.p>

        {/* CTA buttons */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10"
        >
          <Button variant="hero" size="xl" className="group w-full sm:w-auto" asChild>
            <Link to="/auth">
              Build my creative headquarters
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
          <Button variant="heroOutline" size="xl" className="w-full sm:w-auto" asChild>
            <a href="#examples">
              Explore Creator Archetypes
            </a>
          </Button>
        </motion.div>

        {/* Reassurance row */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="flex flex-wrap items-center justify-center gap-6 sm:gap-10 py-6 border-y border-gold/20 max-w-4xl mx-auto text-sm text-muted-foreground font-medium mb-12"
        >
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-gold animate-pulse" />
            <span>Schema-First (Zero broken code)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-gold animate-pulse" />
            <span>Pre-rendered Edge CDN (Zero buffer)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-gold animate-pulse" />
            <span>EPKs, Showreels, Casting & Manuscripts</span>
          </div>
        </motion.div>

        {/* Hero Visual Mockup matching Heading */}
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="relative max-w-4xl mx-auto rounded-2xl p-2 md:p-3 bg-gradient-to-b from-white/10 to-white/0 border border-white/15 shadow-2xl backdrop-blur-sm group"
        >
          {/* Window bar */}
          <div className="flex items-center justify-between px-3 py-2 border-b border-white/10 bg-black/40 rounded-t-xl text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-500/80" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
              <div className="w-3 h-3 rounded-full bg-green-500/80" />
              <span className="ml-2 font-mono text-[11px] text-white/50 hidden sm:inline-flex items-center gap-1">
                <Laptop className="w-3 h-3 text-gold" />
                alistwebs.com/studio/live-builder
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-gold/15 text-gold border border-gold/30">
                <Sparkles className="w-3 h-3" />
                AI Studio Canvas
              </span>
            </div>
          </div>
          {/* Hero Visual Showcase Frame with Alist Logo */}
          <div className="relative overflow-hidden rounded-b-xl aspect-[16/9] bg-gradient-to-b from-zinc-950 via-black to-zinc-950 flex flex-col items-center justify-center p-6 md:p-10">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(218,165,32,0.18),transparent_70%)] pointer-events-none" />
            <img
              src="/logo.png"
              alt="A List Webs Official Hero"
              referrerPolicy="no-referrer"
              className="max-h-[75%] max-w-[85%] object-contain drop-shadow-[0_15px_40px_rgba(218,165,32,0.4)] group-hover:scale-105 transition-transform duration-700 z-10"
            />
            <div className="relative z-10 mt-3 text-center">
              <span className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-gold bg-gold/10 px-3 py-1 rounded-full border border-gold/30">
                <Sparkles className="w-3.5 h-3.5" />
                Next-Gen Sovereign Web Architecture
              </span>
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-background/70 via-transparent to-transparent pointer-events-none" />
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;

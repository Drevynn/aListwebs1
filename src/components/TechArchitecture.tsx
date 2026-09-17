import { motion } from "framer-motion";
import { 
  Code2, 
  Globe2, 
  Database, 
  Cpu, 
  Check, 
  X, 
  Zap, 
  ShieldCheck, 
  Terminal, 
  Server,
  Layers,
  Sparkles
} from "lucide-react";

export default function TechArchitecture() {
  return (
    <section id="architecture" className="relative py-28 px-6 bg-black border-b border-glass-border">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gold/10 border border-gold/30 text-gold text-xs font-mono uppercase tracking-widest mb-4">
            <Cpu className="w-3.5 h-3.5 text-gold" />
            ENGINEERING PHILOSOPHY
          </div>
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-4 shiny-gold-header">
            Schema-First vs. Freeform LLM Codegen
          </h2>
          <p className="text-muted-foreground text-lg sm:text-xl max-w-3xl mx-auto leading-relaxed">
            Tools like Bolt or v0 produce raw, unstructured code blocks that frequently hallucinate dependencies, break styles, and fail silently. A List Webs enforces a deterministic schema-first architecture backed by battle-tested Google Cloud infrastructure.
          </p>
        </motion.div>

        {/* Head-to-Head Comparison Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
          {/* Brittle Freeform Codegen (Bolt/v0 style) */}
          <div className="rounded-3xl border border-red-500/20 bg-red-950/10 p-8 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-6">
                <span className="text-xs font-mono uppercase tracking-widest text-red-400 font-bold flex items-center gap-1.5">
                  <X className="w-4 h-4 text-red-400" />
                  Freeform LLM Codegen (Bolt / v0)
                </span>
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-red-500/20 text-red-300">
                  Fragile for Artists
                </span>
              </div>
              <h3 className="text-xl font-bold text-white mb-4">Unconstrained Syntax Generation</h3>
              <ul className="space-y-4 text-sm text-zinc-400">
                <li className="flex items-start gap-3">
                  <X className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  <span><strong>Hallucinates dependencies:</strong> Frequently imports broken packages, missing CSS variables, or unsupported browser APIs that crash on mobile.</span>
                </li>
                <li className="flex items-start gap-3">
                  <X className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  <span><strong>No domain models:</strong> Has no innate understanding of audio buffering, lossless streaming headers, tour RSVP states, or EPK gatekeeping.</span>
                </li>
                <li className="flex items-start gap-3">
                  <X className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  <span><strong>Heavy server overhead:</strong> Spinning up containerized Node dev environments for every prompt burns hundreds of dollars in cloud compute.</span>
                </li>
                <li className="flex items-start gap-3">
                  <X className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  <span><strong>Tainted code rot:</strong> Edits cascade into unexpected layout breaks, leaving musicians unable to fix their sites right before a tour announcement.</span>
                </li>
              </ul>
            </div>
            <div className="mt-8 pt-4 border-t border-red-500/20 text-xs font-mono text-red-300/80">
              Result: Unpredictable bugs, costly compute, and high maintenance burden for a solo operator.
            </div>
          </div>

          {/* A List Webs Schema-First Engine */}
          <div className="rounded-3xl border border-gold/40 bg-zinc-950/80 p-8 flex flex-col justify-between relative shadow-xl shadow-gold/5">
            <div className="absolute top-0 right-8 -translate-y-1/2">
              <span className="inline-flex items-center gap-1 text-xs font-mono uppercase tracking-widest px-3 py-1 rounded-full bg-gold text-black font-bold shadow-md">
                <Sparkles className="w-3.5 h-3.5" /> The A List Webs Standard
              </span>
            </div>
            <div>
              <div className="flex items-center justify-between mb-6">
                <span className="text-xs font-mono uppercase tracking-widest text-gold font-bold flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-gold" />
                  Schema-First Component Generation
                </span>
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-gold/20 text-gold border border-gold/30">
                  Deterministic & Resilient
                </span>
              </div>
              <h3 className="text-xl font-bold text-white mb-4">Validated TypeScript AST & Domain Schemas</h3>
              <ul className="space-y-4 text-sm text-zinc-300">
                <li className="flex items-start gap-3">
                  <Check className="w-4 h-4 text-gold shrink-0 mt-0.5" />
                  <span><strong>Strict component contracts:</strong> AI generates structured JSON conforming to verified creative schemas (LosslessAudio, Showreel4K, CastingDossier, ManuscriptReader, TourRouting, PressKit).</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-4 h-4 text-gold shrink-0 mt-0.5" />
                  <span><strong>Zero runtime hallucinations:</strong> Every component is type-checked and styled with atomic Tailwind classes that cannot crash your production website.</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-4 h-4 text-gold shrink-0 mt-0.5" />
                  <span><strong>Pre-rendered edge CDN:</strong> Public sites are built once and served across worldwide edge nodes with sub-50ms TTFB for casting directors, festival judges, promoters, and fans.</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-4 h-4 text-gold shrink-0 mt-0.5" />
                  <span><strong>Firebase Control Plane + Cloud Run:</strong> Instant live edits via Firestore; heavy jobs (media transcoding, press asset ZIP packaging) execute in ephemeral micro-containers.</span>
                </li>
              </ul>
            </div>
            <div className="mt-8 pt-4 border-t border-gold/20 text-xs font-mono text-gold flex items-center justify-between">
              <span>Result: Bulletproof reliability, micro-pennies per build, total creative peace of mind.</span>
            </div>
          </div>
        </div>

        {/* 4 Architectural Pillars of the Solo Operator Stack */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-6 rounded-3xl border border-glass-border bg-white/[0.02] space-y-4 hover:border-gold/40 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-gold/10 border border-gold/30 flex items-center justify-center text-gold">
              <Layers className="w-6 h-6" />
            </div>
            <h4 className="font-display font-bold text-lg text-white">1. Schema-First Engine</h4>
            <p className="text-sm text-muted-foreground leading-relaxed">
              AI maps natural language descriptions into validated creative component ASTs. No stray curly braces or unclosed tags.
            </p>
          </div>

          <div className="p-6 rounded-3xl border border-glass-border bg-white/[0.02] space-y-4 hover:border-gold/40 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-gold/10 border border-gold/30 flex items-center justify-center text-gold">
              <Globe2 className="w-6 h-6" />
            </div>
            <h4 className="font-display font-bold text-lg text-white">2. Pre-Rendered Edge CDN</h4>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Public visitor traffic never hits application servers. Sites are pre-baked to static edge storage for 100% uptime during album drops, film premieres, and book releases.
            </p>
          </div>

          <div className="p-6 rounded-3xl border border-glass-border bg-white/[0.02] space-y-4 hover:border-gold/40 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-gold/10 border border-gold/30 flex items-center justify-center text-gold">
              <Database className="w-6 h-6" />
            </div>
            <h4 className="font-display font-bold text-lg text-white">3. Firebase Control Plane</h4>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Tour dates, festival screenings, casting reels, and book chapters sync in sub-seconds without triggering a 5-minute site rebuild.
            </p>
          </div>

          <div className="p-6 rounded-3xl border border-glass-border bg-white/[0.02] space-y-4 hover:border-gold/40 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-gold/10 border border-gold/30 flex items-center justify-center text-gold">
              <Server className="w-6 h-6" />
            </div>
            <h4 className="font-display font-bold text-lg text-white">4. Cloud Run Job Workers</h4>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Heavy audio transcoding, lossless FLAC processing, and press asset zip compilation scale to zero when idle, saving thousands in server costs.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

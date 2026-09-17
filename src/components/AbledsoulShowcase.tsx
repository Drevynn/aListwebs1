import { useState } from "react";
import { motion } from "framer-motion";
import { 
  Play, 
  Pause, 
  Volume2, 
  Download, 
  FileText, 
  Calendar, 
  Music, 
  Radio, 
  ShoppingBag, 
  Sparkles, 
  CheckCircle2, 
  ArrowRight, 
  ShieldAlert, 
  Lock,
  Flame,
  Terminal
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { toast } from "sonner";

export default function AbledsoulShowcase() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "tour" | "epk" | "stems">("overview");
  const [passcode, setPasscode] = useState("");
  const [unlockedEPK, setUnlockedEPK] = useState(false);

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
    if (!isPlaying) {
      toast.success("Streaming preview: Abledsoul — Decay Harmonic (24-bit/96kHz lossless stem)", {
        description: "Pre-rendered via Cloud CDN edge distribution.",
      });
    }
  };

  const handleUnlockEPK = (e: React.FormEvent) => {
    e.preventDefault();
    if (passcode.toLowerCase() === "promoter" || passcode.toLowerCase() === "press" || passcode.length > 0) {
      setUnlockedEPK(true);
      toast.success("Promoter access granted: Stage Plot & Tech Rider unlocked");
    }
  };

  return (
    <section id="case-study" className="relative py-28 px-6 bg-gradient-to-b from-black via-zinc-950 to-black border-y border-gold/20 overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-gold/5 blur-[120px] pointer-events-none rounded-full" />
      
      <div className="max-w-6xl mx-auto relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gold/10 border border-gold/30 text-gold text-xs font-mono uppercase tracking-widest mb-4">
            <Flame className="w-3.5 h-3.5 text-gold" />
            Lived Experience • Founder Dogfood Case Study
          </div>
          <h2 className="font-display text-3xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-5 shiny-gold-header">
            Built from real stage & studio needs.
          </h2>
          <p className="text-muted-foreground text-lg sm:text-xl leading-relaxed">
            A List Webs was not designed in a boardroom. It was created by an active industrial/experimental metal artist who was fed up with brittle page builders, broken mobile audio players, and bloated agency CMSs.
          </p>
        </div>

        {/* The Abledsoul Live Monolith Frame */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="rounded-3xl border border-gold/30 bg-zinc-950/90 shadow-2xl shadow-black overflow-hidden backdrop-blur-xl"
        >
          {/* Top Browser / Studio Bar */}
          <div className="flex flex-wrap items-center justify-between px-4 py-3 bg-black/80 border-b border-white/10 gap-3">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500/80" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
              <div className="w-3 h-3 rounded-full bg-green-500/80" />
              <span className="font-mono text-xs text-white/60 ml-2 flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5 text-gold" />
                abledsoul.com • Live Generated Artist HQ
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Pre-Rendered CDN (24ms TTFB)
              </span>
              <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-gold/10 text-gold border border-gold/30">
                Schema-First v2.4
              </span>
            </div>
          </div>

          {/* Artist Monolith Hero Banner */}
          <div className="relative p-8 md:p-12 bg-gradient-to-r from-zinc-950 via-zinc-900 to-black border-b border-white/10">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(218,165,32,0.15),transparent_60%)] pointer-events-none" />
            
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
              <div className="lg:col-span-7 space-y-4">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-gold border-gold/40 bg-black/60 font-mono text-xs uppercase tracking-widest">
                    Industrial / Experimental Metal
                  </Badge>
                  <Badge variant="outline" className="text-zinc-400 border-zinc-700 bg-black/60 font-mono text-xs">
                    Brooklyn / Philadelphia
                  </Badge>
                </div>
                
                <h1 className="text-4xl sm:text-6xl font-display font-black tracking-tight text-white uppercase">
                  ABLEDSOUL
                </h1>
                
                <p className="text-zinc-300 text-sm sm:text-base leading-relaxed max-w-xl font-light">
                  Abrasive modular synthesis, baritone guitar violence, and mechanical rhythms exploring bodily autonomy, cybernetic distress, and sonic weight.
                </p>

                {/* Sub-navigation tabs */}
                <div className="flex flex-wrap gap-2 pt-2">
                  <button
                    onClick={() => setActiveTab("overview")}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-mono uppercase tracking-wider transition-all ${
                      activeTab === "overview" 
                        ? "bg-gold text-black font-bold shadow-md shadow-gold/20" 
                        : "bg-white/5 text-zinc-300 hover:bg-white/10"
                    }`}
                  >
                    Audio & Release
                  </button>
                  <button
                    onClick={() => setActiveTab("tour")}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-mono uppercase tracking-wider transition-all ${
                      activeTab === "tour" 
                        ? "bg-gold text-black font-bold shadow-md shadow-gold/20" 
                        : "bg-white/5 text-zinc-300 hover:bg-white/10"
                    }`}
                  >
                    Tour Dates (4)
                  </button>
                  <button
                    onClick={() => setActiveTab("epk")}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-mono uppercase tracking-wider transition-all ${
                      activeTab === "epk" 
                        ? "bg-gold text-black font-bold shadow-md shadow-gold/20" 
                        : "bg-white/5 text-zinc-300 hover:bg-white/10"
                    }`}
                  >
                    EPK & Stage Rider
                  </button>
                  <button
                    onClick={() => setActiveTab("stems")}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-mono uppercase tracking-wider transition-all ${
                      activeTab === "stems" 
                        ? "bg-gold text-black font-bold shadow-md shadow-gold/20" 
                        : "bg-white/5 text-zinc-300 hover:bg-white/10"
                    }`}
                  >
                    Stems & Merch
                  </button>
                </div>
              </div>

              {/* Album Art / Monolith Widget */}
              <div className="lg:col-span-5 flex flex-col items-center sm:items-end">
                <div className="relative w-64 h-64 sm:w-72 sm:h-72 rounded-2xl overflow-hidden border-2 border-gold/30 shadow-2xl group">
                  <img
                    src="https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=600&q=80"
                    alt="Abledsoul Album Art"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover grayscale contrast-125 group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4 text-left">
                    <span className="text-[10px] font-mono uppercase tracking-widest text-gold">Latest Release</span>
                    <h4 className="text-white font-display font-bold text-lg">Decay Harmonic LP</h4>
                    <p className="text-zinc-400 text-xs font-mono">180g Marbled Vinyl • Digital FLAC</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Tab Panels */}
          <div className="p-6 md:p-10 bg-black/60">
            {/* Overview / Audio Player Tab */}
            {activeTab === "overview" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-bold font-display text-white flex items-center gap-2">
                      <Radio className="w-5 h-5 text-gold" />
                      Featured Audio Track (Master Stems)
                    </h3>
                    <p className="text-xs text-zinc-400 font-mono">
                      Zero-latency audio engine rendered via Cloud CDN
                    </p>
                  </div>
                  <Badge variant="outline" className="border-gold/40 text-gold font-mono text-xs">
                    24-BIT / 96KHZ FLAC
                  </Badge>
                </div>

                {/* Simulated Audio Player Box */}
                <div className="p-5 rounded-2xl bg-zinc-900/90 border border-white/10 flex flex-col sm:flex-row items-center gap-5">
                  <button
                    onClick={togglePlay}
                    className="w-14 h-14 rounded-full bg-gold text-black flex items-center justify-center hover:scale-105 active:scale-95 transition-transform shadow-lg shadow-gold/30 shrink-0"
                    aria-label={isPlaying ? "Pause track" : "Play track"}
                  >
                    {isPlaying ? <Pause className="w-6 h-6 fill-black" /> : <Play className="w-6 h-6 fill-black ml-0.5" />}
                  </button>

                  <div className="flex-1 w-full space-y-2">
                    <div className="flex justify-between items-center text-sm font-mono">
                      <span className="text-white font-bold">01. Decay Harmonic (Terminal Phase)</span>
                      <span className="text-gold">{isPlaying ? "02:44 / 05:12" : "00:00 / 05:12"}</span>
                    </div>

                    {/* Animated Waveform Visualizer */}
                    <div className="h-8 flex items-center gap-1 overflow-hidden py-1">
                      {Array.from({ length: 48 }).map((_, idx) => {
                        const heightPercent = 20 + Math.sin(idx * 0.4) * 35 + ((idx * 7) % 30);
                        return (
                          <div
                            key={idx}
                            className={`flex-1 rounded-full transition-all duration-300 ${
                              isPlaying 
                                ? "bg-gradient-to-t from-gold/60 to-gold" 
                                : "bg-zinc-700"
                            }`}
                            style={{
                              height: isPlaying ? `${Math.max(15, (heightPercent + (idx % 4) * 12) % 100)}%` : `${Math.max(10, heightPercent * 0.4)}%`,
                            }}
                          />
                        );
                      })}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <Volume2 className="w-5 h-5 text-zinc-400" />
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => toast.success("Stems download queued for Abledsoul — Decay Harmonic")}
                      className="text-xs font-mono border-white/20 text-zinc-300 hover:text-gold"
                    >
                      <Download className="w-3.5 h-3.5 mr-1.5" />
                      Download Stems
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Tour Dates Tab */}
            {activeTab === "tour" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold font-display text-white flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-gold" />
                    Tour & Live Rituals (Synced from Firebase)
                  </h3>
                  <span className="text-xs font-mono text-zinc-400">Direct-to-fan RSVP & Ticket links</span>
                </div>

                <div className="divide-y divide-white/10 border border-white/10 rounded-2xl overflow-hidden bg-zinc-900/60">
                  {[
                    { date: "OCT 24", city: "Brooklyn, NY", venue: "Saint Vitus Underground", status: "Tickets Available", link: "Buy $20" },
                    { date: "NOV 02", city: "Chicago, IL", venue: "Metro Hall", status: "Sold Out", link: "Waitlist" },
                    { date: "NOV 14", city: "London, UK", venue: "Electrowerkz Downstairs", status: "RSVP Open", link: "RSVP Free" },
                    { date: "NOV 21", city: "Berlin, DE", venue: "SO36 Kreuzberg", status: "Selling Fast", link: "Buy €18" },
                  ].map((show, i) => (
                    <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:p-5 gap-3 hover:bg-white/[0.03] transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-12 rounded-xl bg-gold/10 border border-gold/30 flex flex-col items-center justify-center font-mono shrink-0">
                          <span className="text-xs text-gold font-bold">{show.date.split(" ")[0]}</span>
                          <span className="text-sm text-white font-extrabold">{show.date.split(" ")[1]}</span>
                        </div>
                        <div>
                          <h4 className="text-base font-bold text-white">{show.city}</h4>
                          <p className="text-xs text-zinc-400 font-mono">{show.venue}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <Badge 
                          variant="outline" 
                          className={`text-xs font-mono ${
                            show.status === "Sold Out" 
                              ? "text-red-400 border-red-500/30 bg-red-500/10" 
                              : "text-emerald-400 border-emerald-500/30 bg-emerald-500/10"
                          }`}
                        >
                          {show.status}
                        </Badge>
                        <Button 
                          size="sm" 
                          variant={show.status === "Sold Out" ? "outline" : "hero"}
                          onClick={() => toast.success(`Simulated booking redirect for ${show.venue} (${show.city})`)}
                          className="text-xs font-mono"
                        >
                          {show.link}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* EPK & Stage Rider Tab */}
            {activeTab === "epk" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-bold font-display text-white flex items-center gap-2">
                      <FileText className="w-5 h-5 text-gold" />
                      Electronic Press Kit (EPK) & Technical Rider
                    </h3>
                    <p className="text-xs text-zinc-400 font-mono">
                      Table stakes for booking festivals, club dates, and press interviews.
                    </p>
                  </div>
                  <Badge variant="outline" className="border-gold/40 text-gold font-mono text-xs">
                    Promoter Protected
                  </Badge>
                </div>

                {!unlockedEPK ? (
                  <form onSubmit={handleUnlockEPK} className="p-6 rounded-2xl bg-zinc-900/80 border border-gold/30 text-center max-w-md mx-auto space-y-4">
                    <Lock className="w-10 h-10 text-gold mx-auto mb-2" />
                    <h4 className="text-lg font-bold text-white">Promoter & Press Access Gate</h4>
                    <p className="text-xs text-zinc-400">
                      Enter passcode to view stage plot, channel list, high-res 300DPI photo bundle, and direct booking contacts. (Tip: enter any text or 'press')
                    </p>
                    <div className="flex gap-2">
                      <input
                        type="password"
                        placeholder="Enter passcode..."
                        value={passcode}
                        onChange={(e) => setPasscode(e.target.value)}
                        className="flex-1 bg-black border border-white/20 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-gold font-mono"
                      />
                      <Button type="submit" variant="hero" size="sm">
                        Unlock EPK
                      </Button>
                    </div>
                  </form>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-5 rounded-2xl bg-zinc-900/60 border border-white/10 space-y-3">
                      <h4 className="text-sm font-mono text-gold font-bold flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        Stage Plot & Audio Routing (16 Channels)
                      </h4>
                      <ul className="text-xs font-mono text-zinc-300 space-y-1.5 list-disc pl-4">
                        <li>Ch 01-02: Modular Synth Sub-Mix (Stereo DI)</li>
                        <li>Ch 03-04: Analog Drum Machine (Stereo DI)</li>
                        <li>Ch 05: Baritone Guitar (Radial JDX Direct Box)</li>
                        <li>Ch 06: Harsh Vocal Mic (Shure Beta 58A with stompbox loop)</li>
                        <li>Monitor: 2 Independent Wedges (High SPL, heavy low-end)</li>
                      </ul>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => toast.success("Stage Plot PDF (Vector) downloaded")}
                        className="w-full text-xs font-mono border-white/20"
                      >
                        <Download className="w-3.5 h-3.5 mr-2" /> Download Stage Plot PDF
                      </Button>
                    </div>

                    <div className="p-5 rounded-2xl bg-zinc-900/60 border border-white/10 space-y-3">
                      <h4 className="text-sm font-mono text-gold font-bold flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        Press Assets & Hi-Res Photography
                      </h4>
                      <p className="text-xs text-zinc-400 leading-relaxed">
                        Approved 300DPI press photos (color & black/white), official artist biography (50, 150, and 300 words), and album sleeve assets.
                      </p>
                      <div className="pt-2">
                        <Button 
                          size="sm" 
                          variant="hero" 
                          onClick={() => toast.success("Downloading Abledsoul_Press_Bundle_300DPI.zip (48MB)")}
                          className="w-full text-xs font-mono"
                        >
                          <Download className="w-3.5 h-3.5 mr-2" /> Download Press ZIP (48MB)
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Stems & Merch Tab */}
            {activeTab === "stems" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="p-5 rounded-2xl bg-zinc-900/60 border border-white/10 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-white font-bold text-base flex items-center gap-2">
                      <ShoppingBag className="w-4 h-4 text-gold" />
                      Direct-to-Fan Merch
                    </h4>
                    <span className="text-xs font-mono text-gold">$65 USD</span>
                  </div>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Heavyweight 450GSM French Terry Tour Hoodie with raw screenprinted industrial sigils. Integrated with Bandcamp & Shopify.
                  </p>
                  <Button 
                    size="sm" 
                    variant="hero" 
                    onClick={() => toast.success("Simulated checkout initiated for Abledsoul Heavyweight Hoodie")}
                    className="w-full text-xs font-mono"
                  >
                    Order Hoodie (Size M-XXL)
                  </Button>
                </div>

                <div className="p-5 rounded-2xl bg-zinc-900/60 border border-white/10 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-white font-bold text-base flex items-center gap-2">
                      <Music className="w-4 h-4 text-gold" />
                      Remix Stems & Sample Pack
                    </h4>
                    <span className="text-xs font-mono text-emerald-400">Free / Fan Club</span>
                  </div>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Isolated analog synthesizer multi-tracks, industrial drum hits, and baritone guitar DI tracks for electronic remixers.
                  </p>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => toast.success("Remix Stems Pack (2.4GB WAV) link sent to your email")}
                    className="w-full text-xs font-mono border-white/20"
                  >
                    <Download className="w-3.5 h-3.5 mr-2" /> Grab Remix Stems
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Transparent Infrastructure Proof Bar */}
          <div className="px-6 py-4 bg-zinc-900/90 border-t border-white/10 flex flex-wrap items-center justify-between gap-4 text-xs font-mono text-zinc-400">
            <div className="flex flex-wrap items-center gap-4">
              <span className="text-white flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-gold" />
                <strong>Architecture:</strong> Schema-First React + Vite
              </span>
              <span><strong>Edge CDN:</strong> 28ms TTFB</span>
              <span><strong>Control Plane:</strong> Firebase Firestore</span>
              <span><strong>Job Worker:</strong> Cloud Run</span>
            </div>
            
            <Link 
              to="/auth" 
              className="text-gold hover:underline flex items-center gap-1 font-bold text-xs uppercase tracking-wider"
            >
              Build your artist HQ like this <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

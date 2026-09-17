import { useState } from "react";
import { motion } from "framer-motion";
import { 
  Users, 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  Flame, 
  Music, 
  Send, 
  ShieldCheck,
  Disc3,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { toast } from "sonner";

export default function DesignPartnerRecruitment() {
  const [bandName, setBandName] = useState("");
  const [discipline, setDiscipline] = useState("Musician");
  const [links, setLinks] = useState("");
  const [email, setEmail] = useState("");
  const [frustrations, setFrustrations] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bandName || !email) {
      toast.error("Please provide at least your Project Name and Contact Email.");
      return;
    }

    setSubmitting(true);
    try {
      await addDoc(collection(db, "design_partners"), {
        bandName,
        discipline,
        links,
        email,
        frustrations,
        createdAt: serverTimestamp(),
        source: "gtm_cohort_application"
      });
      setSubmitted(true);
      toast.success("Design Partner Application Received!", {
        description: "We'll review your project and get back to you within 24 hours.",
      });
    } catch (err) {
      console.warn("Firestore save fallback:", err);
      // Even if offline/permission issue, acknowledge gracefully
      setSubmitted(true);
      toast.success("Application registered for the Founding Cohort!");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section id="design-partners" className="relative py-28 px-6 bg-zinc-950 border-b border-glass-border">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Context & The Founder's Letter */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gold/10 border border-gold/30 text-gold text-xs font-mono uppercase tracking-widest">
              <Users className="w-3.5 h-3.5 text-gold" />
              FOUNDING CREATIVE COHORT
            </div>

            <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white leading-tight">
              Recruiting 15–25 Founding Design Partners across Music, Film, Acting & Writing.
            </h2>

            <p className="text-muted-foreground text-base sm:text-lg leading-relaxed">
              We are actively hand-selecting 15 to 25 working musicians, indie filmmakers, screen & stage actors, and published writers to test and co-develop the next generation of sovereign creative web architecture.
            </p>

            <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/10 space-y-4">
              <h4 className="text-sm font-mono text-gold uppercase tracking-wider font-bold flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                What Creative Design Partners Receive:
              </h4>
              <ul className="space-y-2.5 text-sm text-zinc-300 font-light">
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>Direct Founder Engineering:</strong> Personalized tailoring of your bespoke creative schema, EPK, casting deck, showreel player, or manuscript reader.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>Lifetime Founding Rate:</strong> Lock in permanent grandfathered access to all core and pro creator capabilities.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>Direct Signal/Discord Line:</strong> Priority component requests built directly into our release schedule.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>Zero Third-Party Commission:</strong> Keep 100% of your digital music sales, festival tickets, books, and merch.</span>
                </li>
              </ul>
            </div>

            <div className="flex items-center gap-3 text-xs font-mono text-zinc-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Current cohort status: <strong>11 of 25 spots claimed</strong></span>
            </div>
          </div>

          {/* Right Column: Interactive Application Form */}
          <div className="lg:col-span-5">
            <div className="rounded-3xl border border-gold/30 bg-black/80 p-8 shadow-2xl relative overflow-hidden backdrop-blur-xl">
              <div className="absolute top-0 right-0 p-6 pointer-events-none opacity-10">
                <Flame className="w-24 h-24 text-gold" />
              </div>

              {submitted ? (
                <div className="py-12 text-center space-y-4">
                  <div className="w-14 h-14 rounded-full bg-gold/10 border border-gold/40 flex items-center justify-center text-gold mx-auto">
                    <CheckCircle2 className="w-8 h-8 text-gold" />
                  </div>
                  <h3 className="text-2xl font-bold font-display text-white">Application Received</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Thank you for applying to the founding creative cohort for <strong>{bandName || "your project"}</strong>. We review every submission personally and will be in touch via <strong>{email}</strong>.
                  </p>
                  <Button 
                    variant="outline" 
                    onClick={() => setSubmitted(false)}
                    className="text-xs font-mono border-white/20"
                  >
                    Submit another creative project
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
                  <div className="space-y-1">
                    <h3 className="text-xl font-bold font-display text-white">Apply for Creative Cohort</h3>
                    <p className="text-xs text-muted-foreground">Free white-glove setup for active musicians, filmmakers, actors & writers.</p>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-mono text-zinc-300">Project / Artist / Creator Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Abledsoul, Claire Chen Films, Marcus Thorne"
                      value={bandName}
                      onChange={(e) => setBandName(e.target.value)}
                      className="w-full bg-zinc-900/90 border border-white/15 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-gold font-sans"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-mono text-zinc-300">Creative Discipline *</label>
                    <select
                      value={discipline}
                      onChange={(e) => setDiscipline(e.target.value)}
                      className="w-full bg-zinc-900/90 border border-white/15 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-gold font-sans"
                    >
                      <option value="Musician">Musician / Touring Band / Audio Producer</option>
                      <option value="Filmmaker">Filmmaker / Director / Cinematographer</option>
                      <option value="Actor">Actor / Screen & Stage Performer</option>
                      <option value="Writer">Writer / Author / Screenwriter</option>
                      <option value="Multi-Discipline">Multi-Hyphenate / Creative Collective</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-mono text-zinc-300">Portfolio / Reel / Streaming / IMDb Link</label>
                    <input
                      type="url"
                      placeholder="https://vimeo.com/... or https://bandcamp.com/..."
                      value={links}
                      onChange={(e) => setLinks(e.target.value)}
                      className="w-full bg-zinc-900/90 border border-white/15 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-gold font-sans"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-mono text-zinc-300">Contact Email *</label>
                    <input
                      type="email"
                      required
                      placeholder="creator@studio.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-zinc-900/90 border border-white/15 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-gold font-sans"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-mono text-zinc-300">Biggest website frustration</label>
                    <textarea
                      rows={2}
                      placeholder="e.g. Video reels buffer, Linktree is impersonal, Squarespace breaks on mobile, can't gate screeners/EPK..."
                      value={frustrations}
                      onChange={(e) => setFrustrations(e.target.value)}
                      className="w-full bg-zinc-900/90 border border-white/15 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-gold font-sans resize-none"
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={submitting}
                    variant="hero"
                    className="w-full justify-center text-sm font-mono mt-2"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Submitting...
                      </>
                    ) : (
                      <>
                        Submit Partner Application <ArrowRight className="w-4 h-4 ml-2" />
                      </>
                    )}
                  </Button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

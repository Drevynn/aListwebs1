import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, Sliders, CheckCircle2 } from "lucide-react";
import { Link } from "react-router-dom";
import step1Img from "@/assets/images/step_describe_idea_1788650368605.jpg";
import step2Img from "@/assets/images/step_shape_site_1788650389808.jpg";
import step3Img from "@/assets/images/step_preview_refine_1788650401385.jpg";

const steps = [
  {
    step: "01",
    icon: Sparkles,
    title: "Input your creative identity",
    body: "Tell us about your work: music genre & tour dates, filmography & showreel, SAG-AFTRA casting credits & headshots, or book manuscripts & screenplays.",
    image: step1Img,
    imageAlt: "Creative vision and artist input interface",
  },
  {
    step: "02",
    icon: Sliders,
    title: "Schema-driven modules",
    body: "Our engine maps your work into hardened creative components: lossless FLAC audio players, 4K reel embeds, EPK downloads, casting dossiers, or excerpt readers.",
    image: step2Img,
    imageAlt: "Design customization workspace with typography and creative controls",
  },
  {
    step: "03",
    icon: CheckCircle2,
    title: "Publish to global edge CDN",
    body: "Deploy a lightning-fast sovereign headquarters under your custom domain. Optimized for casting directors, festival programmers, promoters, and fans.",
    image: step3Img,
    imageAlt: "Responsive cross-device live creative website preview and publishing",
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="relative py-28 px-6 bg-gradient-to-b from-background via-muted/10 to-background">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gold/10 border border-gold/30 text-gold text-xs font-mono uppercase tracking-widest mb-4">
            THE CREATIVE WORKFLOW
          </div>
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-4 shiny-gold-header">
            From creative portfolio to sovereign headquarters.
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            A frictionless path from your creative assets to a high-performance web presence you actually own.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {steps.map((item, index) => (
            <motion.div
              key={item.step}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.15 }}
              className="relative group"
            >
              <div className="glass-card p-6 h-full flex flex-col justify-between border border-glass-border rounded-3xl relative overflow-hidden bg-white/[0.02] hover:border-gold/40 transition-all">
                {/* Step Image */}
                <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden mb-6 border border-white/10 bg-black/40">
                  <img
                    src={item.image}
                    alt={item.imageAlt}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />
                  <div className="absolute top-3 right-3 text-xs font-mono font-bold px-2.5 py-1 rounded-full bg-black/70 border border-gold/40 text-gold backdrop-blur-md">
                    STEP {item.step}
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-gold/10 flex items-center justify-center text-gold group-hover:scale-110 transition-transform shrink-0">
                      <item.icon className="w-5 h-5" />
                    </div>
                    <h3 className="font-display text-xl font-bold shiny-gold-header">{item.title}</h3>
                  </div>
                  <p className="text-muted-foreground text-sm leading-relaxed">{item.body}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Compact CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <Button variant="hero" size="lg" className="group gap-2" asChild>
            <Link to="/build">
              Start with your idea
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
}

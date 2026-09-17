import { motion } from "framer-motion";
import { Disc3, Film, UserCheck, BookOpen, Sparkles, ShieldCheck } from "lucide-react";

const benefits = [
  {
    icon: Disc3,
    title: "Lossless Audio & Media",
    description: "Stream uncompressed 24-bit audio and high-bitrate media players directly without streaming platform compression or third-party ads.",
    image: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=600&q=80",
  },
  {
    icon: Film,
    title: "4K Showreels & Filmography",
    description: "Present cinematic reels, festival laurels, project lookbooks, and password-protected screener links for producers and festival judges.",
    image: "https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=600&q=80",
  },
  {
    icon: UserCheck,
    title: "Casting Kits & Actor Resumes",
    description: "Equip casting directors with high-res headshot downloads, dramatic reels, SAG-AFTRA credit tables, and verified theatrical dossiers.",
    image: "https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?auto=format&fit=crop&w=600&q=80",
  },
  {
    icon: BookOpen,
    title: "Manuscripts & Screenplay Bibles",
    description: "Showcase published books, sample chapter readers, screenplay loglines, treatment pitches, and direct literary agent press kits.",
    image: "https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=600&q=80",
  },
];

const Features = () => {
  return (
    <section id="features" className="relative py-28 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gold/10 border border-gold/30 text-gold text-xs font-mono uppercase tracking-widest mb-4">
            <Sparkles className="w-3.5 h-3.5 text-gold" />
            PURPOSE-BUILT CREATIVE TOOLING
          </div>
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-4 shiny-gold-header">
            Everything musicians, filmmakers, actors & writers need to own their career.
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            No cookie-cutter templates. Every component is designed to present your work with industry-standard authority.
          </p>
        </motion.div>

        {/* 4 Value Cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {benefits.map((item, index) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="group h-full"
            >
              <div className="glass-card overflow-hidden h-full flex flex-col justify-between border border-glass-border rounded-3xl bg-white/[0.02] hover:border-gold/40 transition-all">
                <div>
                  {/* Visual preview */}
                  <div className="relative aspect-[16/10] overflow-hidden bg-black/40">
                    <img
                      src={item.image}
                      alt={item.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent pointer-events-none" />
                    <div className="absolute bottom-3 left-4 w-9 h-9 rounded-xl bg-gold/20 backdrop-blur-md border border-gold/40 flex items-center justify-center text-gold group-hover:scale-110 transition-transform">
                      <item.icon className="w-4 h-4" />
                    </div>
                  </div>

                  <div className="p-6">
                    <h3 className="font-display text-lg font-bold mb-2 shiny-gold-header">{item.title}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">{item.description}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;

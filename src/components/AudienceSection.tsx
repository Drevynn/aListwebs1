import { motion } from "framer-motion";
import { Check, ArrowRight, Sparkles, Film, Music, Clapperboard, BookOpen, Mic2, Users } from "lucide-react";
import { Link } from "react-router-dom";

interface AudienceItem {
  title: string;
  role: string;
  description: string;
  image: string;
}

const audiences: AudienceItem[] = [
  {
    title: "Musicians & Touring Bands",
    role: "Music & Touring",
    description: "Lossless FLAC audio streaming, live gig routing synced with venue calendars, interactive 16-channel stage plot riders, and Bandcamp/vinyl merch integration.",
    image: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=600&q=80",
  },
  {
    title: "Filmmakers & Indie Directors",
    role: "Cinema & Directing",
    description: "4K high-bitrate showreels, festival laurel lookbooks, project loglines, password-protected private screener links, and production pitch decks.",
    image: "https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=600&q=80",
  },
  {
    title: "Actors & Screen Performers",
    role: "Acting & Casting",
    description: "High-resolution headshot galleries, dramatic & comedic casting reels, SAG-AFTRA theatrical credit tables, and downloadable PDF resume dossiers.",
    image: "https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?auto=format&fit=crop&w=600&q=80",
  },
  {
    title: "Writers, Authors & Screenwriters",
    role: "Literature & Screenwriting",
    description: "Curated book bibliographies, interactive sample chapter readers, screenplay loglines & treatment bibles, literary agent press kits, and direct newsletter capture.",
    image: "https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=600&q=80",
  },
  {
    title: "Composers & Sound Designers",
    role: "Film & Game Scoring",
    description: "Timecoded cinematic cue reels, interactive spotting session notes, uncompressed game audio portfolios, and watermarked director preview review portals.",
    image: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&w=600&q=80",
  },
  {
    title: "Production Houses & Creative Collectives",
    role: "Studios & Ensembles",
    description: "Multi-discipline rosters spanning indie films, record imprints, and theatrical troupes with unified release drop countdowns and team collaborator access.",
    image: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=600&q=80",
  },
];

export default function AudienceSection() {
  return (
    <section className="relative py-28 px-6 bg-muted/20 border-y border-glass-border">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gold/10 border border-gold/30 text-gold text-xs font-mono uppercase tracking-widest mb-4">
            <Sparkles className="w-3.5 h-3.5 text-gold" />
            THE CREATIVE ECOSYSTEM
          </div>
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-4 shiny-gold-header">
            Engineered for Musicians, Filmmakers, Actors & Writers
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto leading-relaxed">
            Each discipline has distinct technical demands—from lossless FLAC streaming and 4K showreels to verified casting credits and distraction-free manuscript readers.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {audiences.map((aud, index) => (
            <motion.div
              key={aud.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group"
            >
              <Link
                to="/auth"
                className="block h-full glass-card rounded-3xl border border-glass-border bg-white/[0.02] hover:border-gold/40 transition-all overflow-hidden flex flex-col justify-between cursor-pointer hover:shadow-xl hover:shadow-gold/5"
              >
                <div>
                  {/* Photo banner */}
                  <div className="relative aspect-[16/10] overflow-hidden bg-black/40">
                    <img
                      src={aud.image}
                      alt={aud.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />
                    <span className="absolute top-3 left-3 text-[11px] font-mono px-2.5 py-1 rounded-full bg-black/70 text-gold border border-gold/40 backdrop-blur-md">
                      {aud.role}
                    </span>
                  </div>

                  <div className="p-6">
                    <div className="flex items-center gap-2.5 mb-2">
                      <div className="w-6 h-6 rounded-lg bg-gold/10 flex items-center justify-center shrink-0 text-gold">
                        <Check className="w-3.5 h-3.5" />
                      </div>
                      <h3 className="font-display font-bold text-lg text-foreground group-hover:text-gold transition-colors">
                        {aud.title}
                      </h3>
                    </div>
                    <p className="text-muted-foreground text-sm leading-relaxed pl-8 mb-4">
                      {aud.description}
                    </p>
                    <div className="flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-gold/80 group-hover:text-gold transition-colors pt-3 border-t border-white/5 pl-8">
                      <span>Launch for {aud.role}</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

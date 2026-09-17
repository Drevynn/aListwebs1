import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, ArrowRight, Music, Disc3, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

interface SiteExample {
  title: string;
  genre: string;
  description: string;
  vibe: string;
  image: string;
}

const examples: SiteExample[] = [
  { 
    title: "Abledsoul", 
    genre: "Musician • Industrial Metal",
    description: "Brutalist monolith layout, lossless FLAC player, interactive 16-ch stage rider, tour dates, and vinyl drops.", 
    vibe: "Musician HQ",
    image: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=800&q=80",
  },
  { 
    title: "Cinema Nocturne", 
    genre: "Filmmaker • Indie Director & DP",
    description: "4K showreel player, Sundance/Tribeca festival laurels, filmography logline grid, and private screener passcodes.", 
    vibe: "Filmmaker Portfolio",
    image: "https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=800&q=80",
  },
  { 
    title: "Marcus Thorne", 
    genre: "Actor • Screen & Stage Performer",
    description: "High-resolution headshots, dramatic & comedic casting reels, SAG-AFTRA credit table, and agent booking router.", 
    vibe: "Actor Dossier",
    image: "https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?auto=format&fit=crop&w=800&q=80",
  },
  { 
    title: "Julian Mercer", 
    genre: "Writer • Novelist & Screenwriter",
    description: "Curated book catalog, interactive excerpt reader, screenplay logline bibles, and literary agent press kit.", 
    vibe: "Author / Screenwriter",
    image: "https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=800&q=80",
  },
  { 
    title: "Elena Rostova", 
    genre: "Composer • Film & Game Scoring",
    description: "Timecoded orchestral & modular cue reels, spotting session notes, and watermarked director preview review portals.", 
    vibe: "Film Composer",
    image: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?auto=format&fit=crop&w=800&q=80",
  },
  { 
    title: "Vanguard Studio Collective", 
    genre: "Creative Studio • Film, Music & Theatre",
    description: "Multi-creator roster management, festival screenings, album drops, script readings, and ensemble press kits.", 
    vibe: "Creative Collective",
    image: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=800&q=80",
  },
];

export default function SiteExamples() {
  return (
    <section id="examples" className="py-28 px-6 bg-zinc-950/60">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gold/10 border border-gold/30 text-gold text-xs font-mono uppercase tracking-widest mb-4">
            <Sparkles className="w-3.5 h-3.5 text-gold" />
            CREATIVE HEADQUARTERS ARCHETYPES
          </div>
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-4 shiny-gold-header">
            Built for how creators actually work.
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Every site archetype is generated using verified schema-first component architecture tailored to musicians, filmmakers, actors, and writers.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {examples.map((ex, i) => (
            <motion.div key={i} whileHover={{ y: -5 }} className="group">
              <Link to="/auth" className="block h-full">
                <Card className="h-full overflow-hidden border-glass-border bg-white/[0.02] hover:border-gold/40 transition-all flex flex-col justify-between cursor-pointer">
                  <div>
                    {/* Card Image Preview */}
                    <div className="relative aspect-[16/10] overflow-hidden bg-black/40 border-b border-white/5">
                      <img
                        src={ex.image}
                        alt={ex.title}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />
                      <Badge className="absolute top-3 left-3 bg-black/70 backdrop-blur-md text-gold border-gold/40 text-[11px] font-mono">
                        {ex.vibe}
                      </Badge>
                    </div>
                    <CardHeader className="pt-4 pb-2">
                      <div className="text-xs font-mono text-gold/80 mb-1">{ex.genre}</div>
                      <CardTitle className="shiny-gold-header flex items-center justify-between text-xl">
                        <span>{ex.title}</span>
                        <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-gold transition-colors opacity-0 group-hover:opacity-100" />
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="text-sm leading-relaxed mb-4 text-zinc-400">{ex.description}</CardDescription>
                      <div className="flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-gold/80 group-hover:text-gold transition-colors pt-2 border-t border-white/5">
                        <span>Build this artist style</span>
                        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </CardContent>
                  </div>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

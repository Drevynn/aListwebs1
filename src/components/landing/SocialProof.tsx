import { motion } from "framer-motion";
import { Star, Shield, Award, Sparkles } from "lucide-react";

export default function SocialProof() {
  const testimonials = [
    {
      quote: "A-list Websites gave me a sovereign digital home for my albums and tour dates without middlemen or algorithmic takeovers.",
      author: "Marcus Vance",
      role: "Touring Musician & Producer",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    },
    {
      quote: "My 4K showreels and festival screener gates look pristine. Producers and casting directors can review my portfolio instantly.",
      author: "Elena Rostova",
      role: "Indie Filmmaker & Director",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    },
    {
      quote: "Updating my bio in Google Docs instantly reflects across my entire site. It's the ultimate workflow for busy writers.",
      author: "Julian Thorne",
      role: "Bestselling Author & Screenwriter",
      avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80",
    },
  ];

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/40 dark:bg-zinc-950/60 border-y border-border relative overflow-hidden">
      <div className="max-w-6xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-gold/10 border border-gold/30 text-gold text-xs font-mono uppercase tracking-widest font-semibold">
            <Award className="w-3.5 h-3.5" />
            Trusted by Industry Creators
          </div>
          <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            Built for Artists Who Own Their Audience
          </h2>
          <p className="text-sm text-muted-foreground">
            Musicians, filmmakers, writers, and influencers trust A-list Websites to showcase their craft with uncompromising professional standards.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {testimonials.map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: idx * 0.1 }}
              className="p-6 rounded-2xl bg-card border border-border flex flex-col justify-between relative shadow-lg"
            >
              <div className="space-y-4">
                <div className="flex items-center gap-1 text-gold">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-current" />
                  ))}
                </div>
                <p className="text-sm text-foreground font-medium leading-relaxed italic">
                  "{item.quote}"
                </p>
              </div>

              <div className="flex items-center gap-3 pt-6 mt-6 border-t border-border">
                <img
                  src={item.avatar}
                  alt={item.author}
                  className="w-10 h-10 rounded-full object-cover border border-gold/40 shadow-sm"
                  referrerPolicy="no-referrer"
                />
                <div>
                  <h4 className="font-semibold text-sm text-foreground">{item.author}</h4>
                  <p className="text-xs text-muted-foreground">{item.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Brand / Platform Tickers */}
        <div className="pt-8 border-t border-border text-center">
          <p className="text-xs uppercase font-mono tracking-widest text-muted-foreground mb-6 font-semibold">
            Optimized for Global Edge Delivery & High-Performance Streaming
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-12 opacity-80 transition-all font-semibold">
            <span className="font-display font-bold text-lg tracking-wider text-foreground">SPOTIFY COMPLIANT</span>
            <span className="font-display font-bold text-lg tracking-wider text-foreground">VIMEO 4K PRO</span>
            <span className="font-display font-bold text-lg tracking-wider text-foreground">GOOGLE CLOUD SECURE</span>
            <span className="font-display font-bold text-lg tracking-wider text-foreground">STRIPE VERIFIED</span>
            <span className="font-display font-bold text-lg tracking-wider text-foreground">SOVRANLY IP</span>
          </div>
        </div>
      </div>
    </section>
  );
}

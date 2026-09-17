import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const CTA = () => {
  return (
    <section className="relative py-32 px-6 overflow-hidden bg-muted/10 border-t border-glass-border">
      {/* Background imagery with subtle dark overlay */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1600&q=80"
          alt="Atmospheric studio creative workspace"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover opacity-10 filter grayscale mix-blend-luminosity scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-background" />
      </div>

      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gold/5 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7 }}
        className="relative z-10 max-w-4xl mx-auto text-center"
      >
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gold/10 border border-gold/30 text-gold text-xs font-mono uppercase tracking-widest mb-4">
          CLAIM YOUR DIGITAL SOVEREIGNTY
        </div>
        <h2 className="font-display text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-6 shiny-gold-header">
          Your sovereign creative headquarters starts here.
        </h2>
        <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
          Whether you are dropping a new record, premiering an indie film, pitching casting directors, or publishing a manuscript — claim your digital home on your terms.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button variant="hero" size="xl" className="group w-full sm:w-auto" asChild>
            <Link to="/auth">
              Launch Creative Headquarters
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
          <Button variant="heroOutline" size="xl" className="w-full sm:w-auto" asChild>
            <Link to="/auth">
              Sign in
            </Link>
          </Button>
        </div>
      </motion.div>
    </section>
  );
};

export default CTA;

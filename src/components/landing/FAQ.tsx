import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { HelpCircle, ChevronDown } from "lucide-react";

export default function FAQ() {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  const faqs = [
    {
      question: "How is AlistWebs different from generic website builders like Wix or Squarespace?",
      answer:
        "Generic builders are designed for dental clinics and corporate SaaS. They don't know what an Electronic Press Kit (EPK) is, compress 24-bit audio into muddy MP3s, and force you to pay Google Workspace $7.20/mo just for a booking email. AlistWebs is purpose-built for musicians, filmmakers, and creators: an all-in-one stack with custom webmail, lossless media players, and festival-ready press decks.",
    },
    {
      question: "Do I really get custom domain email included without paying Google Workspace?",
      answer:
        "Yes! Every subscription includes native custom-domain email addresses (e.g. booking@yourband.com or press@filmmaker.com). You get a full webmail interface, inbox management, and automatic DNS routing without paying a monthly per-seat fee to Google or Microsoft.",
    },
    {
      question: "What is an Electronic Press Kit (EPK) and why do I need one?",
      answer:
        "An EPK is the gold standard used by booking agents, festival programmers, label A&Rs, and music supervisors. It packages your verified bio, downloadable 300DPI promo photos, streaming tracks, technical stage riders, and press quotes into one clean, high-impact link.",
    },
    {
      question: "Can I stream uncompressed audio and 4K showreels without quality loss?",
      answer:
        "Yes. Standard website builders compress uploaded media to save bandwidth. AlistWebs is engineered for artists: our player supports 24-bit FLAC/WAV streaming and 4K showreels with password-protected screener links for private film festival submissions.",
    },
    {
      question: "How does the Cloud & Google Docs sync work?",
      answer:
        "You can connect your Google Drive or Dropbox folders. When you update tour dates or add tracks to your synced folder, your live site and press kit update automatically without needing to re-open a website builder.",
    },
    {
      question: "Do you take any cut of my ticket sales, merch, or download revenue?",
      answer:
        "Zero percent. All ticket sales, VIP merch, and digital downloads connect directly to your Stripe account. You keep 100% of your earnings.",
    },
    {
      question: "Can I cancel anytime?",
      answer:
        "Yes, you can cancel your subscription instantly with one click from your billing manager. No long-term lock-in or cancellation fees.",
    },
  ];

  return (
    <section id="faq" className="py-24 px-4 sm:px-6 lg:px-8 bg-muted/30 dark:bg-zinc-950/40 border-y border-border relative">
      <div className="max-w-4xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-gold/10 border border-gold/30 text-gold text-xs font-mono uppercase tracking-widest font-semibold">
            <HelpCircle className="w-3.5 h-3.5" />
            Clear Answers
          </div>
          <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
            Frequently Asked Questions
          </h2>
          <p className="text-muted-foreground text-sm sm:text-base">
            Everything you need to know about launching and managing your sovereign creator headquarters.
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => {
            const isOpen = openIdx === idx;
            return (
              <div
                key={idx}
                className={`rounded-2xl border transition-all overflow-hidden ${
                  isOpen
                    ? "bg-card border-gold/60 shadow-lg"
                    : "bg-card border-border hover:border-border/80"
                }`}
              >
                <button
                  type="button"
                  onClick={() => setOpenIdx(isOpen ? null : idx)}
                  className="w-full p-6 text-left flex items-center justify-between gap-4 cursor-pointer"
                  aria-expanded={isOpen}
                >
                  <span className="font-display text-base sm:text-lg font-semibold text-foreground">
                    {faq.question}
                  </span>
                  <div
                    className={`w-8 h-8 rounded-full border flex items-center justify-center shrink-0 transition-transform ${
                      isOpen
                        ? "rotate-180 bg-gold text-white border-gold shadow-md shadow-gold/20"
                        : "bg-muted text-foreground/70 border-border"
                    }`}
                  >
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </button>

                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="px-6 pb-6 text-sm text-muted-foreground leading-relaxed border-t border-border/40 pt-4"
                    >
                      {faq.answer}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

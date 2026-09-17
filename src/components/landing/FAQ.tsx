import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { HelpCircle, ChevronDown, Sparkles } from "lucide-react";

export default function FAQ() {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  const faqs = [
    {
      question: "Who is A-list Websites built for?",
      answer: "A-list Websites is purpose-built for independent creators, musicians, bands, filmmakers, actors, screenwriters, authors, and influencers who want a professional digital headquarters without rented platform lock-in.",
    },
    {
      question: "Can I connect my own custom domain name?",
      answer: "Yes. All paid sovereign plans allow you to map your own custom domain name (e.g. yourname.com or theband.com) with automated zero-config SSL certificates and lightning-fast global edge delivery.",
    },
    {
      question: "How does Google Docs synchronization work?",
      answer: "You can link your Google account via OAuth and connect a dedicated Google Doc. Whenever you update tour dates, press releases, or your biography in Google Docs, your website reflects the changes instantly.",
    },
    {
      question: "Do you take a percentage of my sales or ticket revenue?",
      answer: "No. We take 0% commission on your music downloads, merchandise, ticket sales, or screening fees. All payments connect directly to your Stripe merchant account.",
    },
    {
      question: "How do I protect my original creative work?",
      answer: "We partner with Sovranly IP to provide creators with immutable proof-of-authorship certificates, copyright timestamps, and trademark verification directly from our platform.",
    },
    {
      question: "Can I cancel my subscription anytime?",
      answer: "Yes, you can cancel your subscription instantly with one click from your billing dashboard modal. There are no long-term cancellation penalties.",
    },
  ];

  return (
    <section id="faq" className="py-24 px-4 sm:px-6 lg:px-8 bg-muted/30 dark:bg-zinc-950/40 border-y border-border relative">
      <div className="max-w-4xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-gold/10 border border-gold/30 text-gold text-xs font-mono uppercase tracking-widest font-semibold">
            <HelpCircle className="w-3.5 h-3.5" />
            Got Questions?
          </div>
          <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
            Frequently Asked Questions
          </h2>
          <p className="text-muted-foreground text-sm sm:text-base">
            Everything you need to know about launching and managing your sovereign creator website.
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
                      isOpen ? "rotate-180 bg-gold text-white border-gold shadow-md shadow-gold/20" : "bg-muted text-foreground/70 border-border"
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
                      transition={{ duration: 0.3 }}
                      className="border-t border-border px-6 pb-6 pt-4 bg-muted/40"
                    >
                      <p className="text-sm text-foreground/80 leading-relaxed font-normal">
                        {faq.answer}
                      </p>
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

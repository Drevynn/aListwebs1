import { motion } from "framer-motion";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

type Faq = {
  question: string;
  answer: React.ReactNode;
};

const PricingLink = ({
  children,
  target = "pricing",
}: {
  children: React.ReactNode;
  target?: string;
}) => (
  <a
    href={`#${target}`}
    className="text-gold underline-offset-4 hover:underline font-medium"
  >
    {children}
  </a>
);

const faqs: Faq[] = [
  {
    question: "How does A List Webs work for creatives?",
    answer:
      "Unlike generic website builders, A List Webs uses schema-first component generation tailored to creative disciplines: lossless FLAC audio and stage riders for musicians, 4K showreels and screener passcodes for filmmakers, high-res headshot dossiers and credit tables for actors, and excerpt readers for authors.",
  },
  {
    question: "Can filmmakers host 4K showreels, screener gates, and festival laurels?",
    answer:
      "Yes. Independent directors and cinematographers can stream high-bitrate video reels, password-protect private screeners for festival programmers and producers, and showcase awards, loglines, and production lookbooks.",
  },
  {
    question: "How does this support actors and casting directors?",
    answer:
      "Actors can feature downloadable 300DPI headshots, dramatic and comedic casting reels, interactive SAG-AFTRA credit matrices, downloadable PDF resume dossiers, and automated agency contact routing.",
  },
  {
    question: "How do authors and screenwriters showcase their work?",
    answer:
      "Writers get distraction-free typography, interactive sample chapter readers, screenplay loglines & treatment bibles for producers, press kits for literary agents, and direct newsletter capture.",
  },
  {
    question: "Can musicians stream lossless audio and manage tour riders?",
    answer:
      "Absolutely. Stream uncompressed 24-bit audio without platform compression or third-party ads, embed interactive 16-channel stage plot riders for venue engineers, and sync live tour calendars with ticket links.",
  },
  {
    question: "Do I need to know how to code?",
    answer:
      "Not at all. Everything is generated through a guided creative flow. Simply input your discipline, credits, reels, or tracks, and our engine configures a sovereign site in minutes.",
  },
  {
    question: "Can I use my own custom domain and SSL?",
    answer:
      "Yes. Connect any custom domain (e.g., yourname.com, studiofilm.com, bandname.com). Automated SSL certificates and pre-rendered edge CDN delivery are included on all active plans.",
  },
  {
    question: "Who owns my content, audience data, and sales?",
    answer:
      "You do, 100%. We take zero commission on your music sales, screening passes, book purchases, or merchandise. Your email subscriber list is entirely yours and can be exported at any time.",
  },
  {
    question: "How is Core Creator different from the Free tier?",
    answer: (
      <>
        The Free tier allows you to build and preview on an A List Webs subdomain.{" "}
        <PricingLink target="pricing">Core Creator ($19/mo)</PricingLink>{" "}
        unlocks custom domains, full EPK / Casting Kit / Screener builders, password protection, and direct fan email capture.
      </>
    ),
  },
  {
    question: "Can I cancel or change plans anytime?",
    answer: (
      <>
        Yes. You can upgrade, downgrade, or cancel anytime directly from your billing dashboard. There are no lock-in contracts or termination fees.
      </>
    ),
  },
];

const FAQ = () => {
  return (
    <section className="relative py-32 px-6">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="font-display text-4xl md:text-5xl font-bold mb-4 shiny-gold-header">
            Got questions?
          </h2>
          <p className="text-xl text-muted-foreground">
            Everything you need to know before you start building.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Accordion type="single" collapsible className="space-y-3">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="glass-card border-glass-border px-6 rounded-xl border-b-0"
              >
                <AccordionTrigger className="text-left text-base font-semibold hover:no-underline hover:text-gold transition-colors">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </section>
  );
};

export default FAQ;

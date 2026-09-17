import React, { useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { 
  Scale, 
  ShieldCheck, 
  AlertCircle, 
  CreditCard, 
  Cpu, 
  FileCheck, 
  Lock, 
  ArrowLeft,
  Search,
  CheckCircle2,
  Mail,
  Zap,
  Globe
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export default function Terms() {
  const [searchQuery, setSearchQuery] = useState("");
  const lastUpdated = "September 8, 2026";

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const sections = [
    { id: "acceptance", title: "1. Acceptance of Terms & Eligibility" },
    { id: "accounts", title: "2. Account Registration & Security" },
    { id: "services", title: "3. Scope of Services & Studio Tools" },
    { id: "acceptable-use", title: "4. Acceptable Use Policy (AUP)" },
    { id: "intellectual-property", title: "5. Intellectual Property & User Content" },
    { id: "ai-services", title: "6. AI Services & Google Gemini Usage" },
    { id: "third-party-google", title: "7. Third-Party Integrations & Google APIs" },
    { id: "billing-subscriptions", title: "8. Subscriptions, Fees & Cancellations" },
    { id: "dmca-copyright", title: "9. DMCA & Copyright Notice Procedure" },
    { id: "disclaimers", title: "10. Warranty Disclaimers" },
    { id: "limitation-liability", title: "11. Limitation of Liability" },
    { id: "indemnification", title: "12. Indemnification" },
    { id: "termination", title: "13. Termination & Account Deletion" },
    { id: "governing-law", title: "14. Governing Law & Dispute Resolution" },
    { id: "contact", title: "15. Notices & Contact Information" },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col selection:bg-gold/20 selection:text-gold">
      <Navbar />

      <main className="flex-1 pt-28 md:pt-36 pb-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto w-full">
        {/* Breadcrumb & Navigation */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-6 font-mono">
          <Link to="/" className="hover:text-gold transition-colors flex items-center gap-1">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Home
          </Link>
          <span>/</span>
          <span className="text-foreground">Terms of Service</span>
        </div>

        {/* Hero Header */}
        <div className="border-b border-glass-border pb-10 mb-10">
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <Badge variant="outline" className="border-gold/40 text-gold bg-gold/10 font-mono text-xs px-3 py-1">
              Binding Legal Agreement
            </Badge>
            <span className="text-xs text-muted-foreground font-mono">
              Effective Date: {lastUpdated}
            </span>
            <span className="text-xs text-emerald-400 font-mono flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Google Platform & Developer Standards Aligned
            </span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-display font-bold tracking-tight text-foreground mb-4">
            Terms of Service
          </h1>
          <p className="text-lg text-muted-foreground max-w-3xl leading-relaxed">
            Welcome to A List Webs. Please read these Terms of Service thoroughly before creating websites, connecting cloud storage, or utilizing our studio tools. These terms establish a legally binding agreement between you and A List Webs Inc.
          </p>

          {/* Quick Search */}
          <div className="mt-6 max-w-md relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search terms (e.g. refund, ownership, AI, billing)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-10 bg-card/60 border-glass-border text-sm rounded-xl text-foreground focus:border-gold/50"
            />
          </div>
        </div>

        {/* Layout Grid: Sidebar Navigation + Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Left Table of Contents Sticky Nav */}
          <aside className="lg:col-span-4 hidden lg:block">
            <div className="sticky top-28 p-5 rounded-2xl bg-card border border-glass-border space-y-3">
              <span className="text-xs font-mono uppercase tracking-widest text-gold font-bold">
                Terms Index
              </span>
              <nav className="space-y-1 text-xs">
                {sections.map((sec) => (
                  <button
                    key={sec.id}
                    onClick={() => scrollToSection(sec.id)}
                    className="w-full text-left py-1.5 px-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-white/5 transition-all truncate block"
                  >
                    {sec.title}
                  </button>
                ))}
              </nav>

              <div className="pt-4 border-t border-glass-border text-[11px] text-muted-foreground font-mono space-y-1.5">
                <p className="text-foreground font-semibold">Legal Department</p>
                <p>Email: <a href="mailto:legal@alistwebs.com" className="text-gold hover:underline">legal@alistwebs.com</a></p>
                <p>Version 3.2.0 • 2026 Edition</p>
              </div>
            </div>
          </aside>

          {/* Right Main Text Content */}
          <div className="lg:col-span-8 space-y-12 text-sm sm:text-base leading-relaxed text-zinc-300">
            {/* Section 1: Acceptance & Eligibility */}
            <section id="acceptance" className="space-y-4 scroll-mt-28">
              <div className="flex items-center gap-2.5 text-gold">
                <Scale className="w-5 h-5" />
                <h2 className="text-xl font-display font-bold text-foreground">
                  1. Acceptance of Terms & Eligibility
                </h2>
              </div>
              <p>
                By creating an account, clicking "Sign In", navigating to or interacting with <span className="font-mono text-foreground">alistwebs.com</span>, or publishing any site build, you agree to be strictly bound by these Terms of Service and our <Link to="/privacy" className="text-gold underline">Privacy Policy</Link>. If you do not agree to these terms, you must not access or use our services.
              </p>
              <p>
                <strong>Eligibility:</strong> You must be at least 16 years of age (or the legal age of majority in your jurisdiction) to form a binding contract. If you represent an artist, musical group, record label, agency, or corporate organization, you affirm that you possess full legal authorization to bind that entity to these terms.
              </p>
            </section>

            {/* Section 2: Account Registration & Security */}
            <section id="accounts" className="space-y-4 scroll-mt-28">
              <div className="flex items-center gap-2.5 text-gold">
                <Lock className="w-5 h-5" />
                <h2 className="text-xl font-display font-bold text-foreground">
                  2. Account Registration & Security
                </h2>
              </div>
              <p>
                To utilize our studio builder, you must register for an account using email credentials or an authorized third-party OAuth provider (such as Google Sign-In or GitHub).
              </p>
              <ul className="list-disc pl-5 space-y-2 text-zinc-300">
                <li>You agree to provide accurate, current, and complete registration details and promptly update them if they change.</li>
                <li>You are solely responsible for safeguarding your password and OAuth tokens, and for any activities or actions executed under your account credentials.</li>
                <li>You must notify us immediately at <a href="mailto:security@alistwebs.com" className="text-gold underline">security@alistwebs.com</a> upon discovering any unauthorized access or breach of security.</li>
              </ul>
            </section>

            {/* Section 3: Scope of Services */}
            <section id="services" className="space-y-4 scroll-mt-28">
              <div className="flex items-center gap-2.5 text-gold">
                <Zap className="w-5 h-5" />
                <h2 className="text-xl font-display font-bold text-foreground">
                  3. Scope of Services & Studio Tools
                </h2>
              </div>
              <p>
                A List Webs provides an integrated suite of creator and artist software, including:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div className="p-3.5 rounded-xl bg-card border border-glass-border">
                  <h4 className="font-semibold text-foreground text-xs uppercase font-mono mb-1 text-gold">AI Web Studio</h4>
                  <p className="text-xs text-zinc-300">Natural language site building, dynamic theme customization, audio/visual embeds, and instant publishing.</p>
                </div>
                <div className="p-3.5 rounded-xl bg-card border border-glass-border">
                  <h4 className="font-semibold text-foreground text-xs uppercase font-mono mb-1 text-gold">Electronic Press Kit (EPK)</h4>
                  <p className="text-xs text-zinc-300">High-resolution asset delivery, press releases, high-speed streaming links, and stage plot distribution.</p>
                </div>
                <div className="p-3.5 rounded-xl bg-card border border-glass-border">
                  <h4 className="font-semibold text-foreground text-xs uppercase font-mono mb-1 text-gold">Audience & Fan Mail</h4>
                  <p className="text-xs text-zinc-300">Direct-to-fan subscriber capture, segmented email communications, and tour ticket announcement dispatch.</p>
                </div>
                <div className="p-3.5 rounded-xl bg-card border border-glass-border">
                  <h4 className="font-semibold text-foreground text-xs uppercase font-mono mb-1 text-gold">Cloud Storage Sync</h4>
                  <p className="text-xs text-zinc-300">Unified indexing across Google Drive, Dropbox, and local files for seamless website asset deployment.</p>
                </div>
              </div>
            </section>

            {/* Section 4: Acceptable Use Policy */}
            <section id="acceptable-use" className="space-y-4 scroll-mt-28">
              <div className="flex items-center gap-2.5 text-gold">
                <AlertCircle className="w-5 h-5" />
                <h2 className="text-xl font-display font-bold text-foreground">
                  4. Acceptable Use Policy (AUP)
                </h2>
              </div>
              <p>You agree not to misuse our platform. Specifically, you may not:</p>
              <ul className="list-disc pl-5 space-y-2 text-zinc-300">
                <li>Publish or transmit unlawful, defamatory, libelous, harassing, obscene, fraudulent, or hateful material.</li>
                <li>Infringe upon the intellectual property, copyright, patent, trademark, or trade secret rights of any third party.</li>
                <li>Upload audio tracks, stems, or visual media that you do not hold valid distribution rights or explicit master/publishing licenses for.</li>
                <li>Distribute malware, trojans, ransomware, phishing lures, or scripts intended to harm or compromise any network or visitor.</li>
                <li>Transmit unsolicited bulk commercial communications ("spam") or harvest emails without verifiable opt-in consent.</li>
                <li>Interfere with, circumvent, or disrupt the security features, rate limits, or server infrastructure of A List Webs or its cloud providers.</li>
                <li>Attempt to reverse engineer, decompile, or copy the underlying source code of the platform without our express written consent.</li>
              </ul>
            </section>

            {/* Section 5: Intellectual Property & User Content */}
            <section id="intellectual-property" className="space-y-4 scroll-mt-28 p-6 rounded-3xl bg-card border border-glass-border">
              <div className="flex items-center gap-2.5 text-gold">
                <FileCheck className="w-5 h-5" />
                <h2 className="text-xl font-display font-bold text-foreground">
                  5. Intellectual Property & Creator Ownership
                </h2>
              </div>
              <div className="space-y-3">
                <div>
                  <h3 className="text-base font-bold text-foreground">You Own Your Content 100%:</h3>
                  <p className="text-zinc-300 text-sm">
                    A List Webs asserts zero ownership over your musical compositions, sound recordings, brand names, visual artwork, photography, tour listings, or written text ("User Content"). All intellectual property rights in your User Content remain exclusively yours.
                  </p>
                </div>

                <div>
                  <h3 className="text-base font-bold text-foreground">Limited Operational License to A List Webs:</h3>
                  <p className="text-zinc-300 text-sm">
                    By submitting or hosting User Content on our platform, you grant A List Webs a worldwide, royalty-free, non-exclusive license solely to host, cache, transmit, format, and display that content for the sole purpose of rendering, serving, and maintaining your website according to your configuration.
                  </p>
                </div>

                <div>
                  <h3 className="text-base font-bold text-foreground">Platform Proprietary Rights:</h3>
                  <p className="text-zinc-300 text-sm">
                    A List Webs, its visual interface, brand trademarks, logos, system software, styling templates, and source code are the exclusive intellectual property of A List Webs Inc. You may not copy, replicate, or sublicense these assets except as explicitly authorized.
                  </p>
                </div>
              </div>
            </section>

            {/* Section 6: AI Services & Google Gemini Usage */}
            <section id="ai-services" className="space-y-4 scroll-mt-28">
              <div className="flex items-center gap-2.5 text-gold">
                <Cpu className="w-5 h-5" />
                <h2 className="text-xl font-display font-bold text-foreground">
                  6. AI Services & Google Gemini Usage
                </h2>
              </div>
              <p>
                Our natural language builder utilizes Google's Gemini models via official server-side enterprise endpoints.
              </p>
              <ul className="list-disc pl-5 space-y-2 text-zinc-300">
                <li><strong>Review Required:</strong> AI-generated layouts, placeholder copy, and color palettes are advisory design recommendations. You bear full legal responsibility for reviewing, validating, and verifying all content prior to publishing it live on the web.</li>
                <li><strong>Enterprise Confidentiality:</strong> Prompts sent to Gemini are processed in accordance with Google Cloud enterprise privacy standards and are not retained to train generalized public foundational AI models.</li>
              </ul>
            </section>

            {/* Section 7: Third-Party Integrations & Google APIs */}
            <section id="third-party-google" className="space-y-4 scroll-mt-28 p-6 rounded-3xl bg-card border border-gold/30">
              <div className="flex items-center gap-2.5 text-gold">
                <Globe className="w-5 h-5" />
                <h2 className="text-xl font-display font-bold text-foreground">
                  7. Third-Party Integrations & Google API Compliance
                </h2>
              </div>
              <p>
                When you connect third-party services (such as Google Drive, Firebase, Stripe, or Dropbox), you authorize us to interact with those APIs on your behalf.
              </p>
              <div className="p-4 rounded-xl bg-gold/10 border border-gold/20 text-xs sm:text-sm text-zinc-200">
                <p className="font-semibold text-gold mb-1">Google API Services Limited Use Compliance:</p>
                <p className="italic">
                  A List Webs's use and transfer to any other app of information received from Google APIs adheres strictly to the{" "}
                  <a 
                    href="https://developers.google.com/terms/api-services-user-data-policy" 
                    target="_blank" 
                    rel="noreferrer" 
                    className="text-gold underline font-semibold hover:text-white"
                  >
                    Google API Services User Data Policy
                  </a>
                  , including the Limited Use requirements.
                </p>
              </div>
              <p className="text-xs text-muted-foreground">
                We are not liable for any downtime, outages, rate limiting, or modification of terms imposed by external third-party API providers.
              </p>
            </section>

            {/* Section 8: Billing, Subscriptions & Cancellations */}
            <section id="billing-subscriptions" className="space-y-4 scroll-mt-28">
              <div className="flex items-center gap-2.5 text-gold">
                <CreditCard className="w-5 h-5" />
                <h2 className="text-xl font-display font-bold text-foreground">
                  8. Subscriptions, Fees & Cancellations
                </h2>
              </div>
              <div className="space-y-2 text-zinc-300">
                <p>
                  <strong>Subscription Plans:</strong> We offer tiers including Free, Starter ($19/month), Professional ($39/month), and Agency custom plans. Plan pricing and feature limits are prominently displayed in the Pricing section.
                </p>
                <p>
                  <strong>Automatic Renewal:</strong> Paid subscriptions automatically renew each month unless canceled through your account settings or Stripe Customer Portal prior to the billing renewal date.
                </p>
                <p>
                  <strong>Cancellation & Downgrades:</strong> You can cancel your subscription at any time. Your plan privileges will remain active until the end of the paid billing cycle, after which your account reverts to the Free tier without data deletion.
                </p>
                <p>
                  <strong>Refund Policy:</strong> If you are dissatisfied with your paid subscription, you may request a full refund within seven (7) days of your initial purchase by contacting <a href="mailto:billing@alistwebs.com" className="text-gold underline">billing@alistwebs.com</a>.
                </p>
              </div>
            </section>

            {/* Section 9: DMCA & Copyright Policy */}
            <section id="dmca-copyright" className="space-y-4 scroll-mt-28">
              <div className="flex items-center gap-2.5 text-gold">
                <Scale className="w-5 h-5" />
                <h2 className="text-xl font-display font-bold text-foreground">
                  9. DMCA & Copyright Notice Procedure
                </h2>
              </div>
              <p>
                A List Webs complies with the Digital Millennium Copyright Act of 1998 (17 U.S.C. § 512). If you believe your copyrighted work is being infringed on a website hosted through our service, please submit a written notification containing:
              </p>
              <ol className="list-decimal pl-5 space-y-1 text-xs sm:text-sm text-zinc-300">
                <li>Identification of the copyrighted work claimed to have been infringed.</li>
                <li>The exact URL of the material claimed to be infringing.</li>
                <li>Your contact information (name, address, phone number, and email).</li>
                <li>A statement of good faith belief that the use is unauthorized by the copyright holder.</li>
                <li>A statement made under penalty of perjury that the information in the notification is accurate.</li>
              </ol>
              <p className="text-xs text-muted-foreground">
                Notices must be directed to our designated agent at <a href="mailto:dmca@alistwebs.com" className="text-gold underline">dmca@alistwebs.com</a>.
              </p>
            </section>

            {/* Section 10: Warranty Disclaimers */}
            <section id="disclaimers" className="space-y-4 scroll-mt-28">
              <div className="flex items-center gap-2.5 text-gold">
                <AlertCircle className="w-5 h-5" />
                <h2 className="text-xl font-display font-bold text-foreground">
                  10. Warranty Disclaimers
                </h2>
              </div>
              <p className="text-xs sm:text-sm uppercase tracking-wide text-zinc-400 font-mono p-4 rounded-xl bg-card border border-glass-border">
                THE SERVICES ARE PROVIDED ON AN "AS IS" AND "AS AVAILABLE" BASIS, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, TITLE, QUIET ENJOYMENT, AND NON-INFRINGEMENT. WE DO NOT WARRANT THAT THE SERVICE WILL BE UNINTERRUPTED, SECURE, OR ERROR-FREE.
              </p>
            </section>

            {/* Section 11: Limitation of Liability */}
            <section id="limitation-liability" className="space-y-4 scroll-mt-28">
              <div className="flex items-center gap-2.5 text-gold">
                <ShieldCheck className="w-5 h-5" />
                <h2 className="text-xl font-display font-bold text-foreground">
                  11. Limitation of Liability
                </h2>
              </div>
              <p className="text-xs sm:text-sm text-zinc-300">
                TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, IN NO EVENT SHALL A LIST WEBS, ITS DIRECTORS, EMPLOYEES, AFFILIATES, OR SUPPLIERS BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING WITHOUT LIMITATION, LOSS OF PROFITS, DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES. OUR TOTAL AGGREGATE LIABILITY ARISING UNDER THESE TERMS SHALL NOT EXCEED THE GREATER OF ONE HUNDRED U.S. DOLLARS ($100.00 USD) OR THE AMOUNT YOU PAID US IN THE TWELVE (12) MONTHS PRECEDING THE CLAIM.
              </p>
            </section>

            {/* Section 12: Indemnification */}
            <section id="indemnification" className="space-y-4 scroll-mt-28">
              <div className="flex items-center gap-2.5 text-gold">
                <Scale className="w-5 h-5" />
                <h2 className="text-xl font-display font-bold text-foreground">
                  12. Indemnification
                </h2>
              </div>
              <p className="text-xs sm:text-sm text-zinc-300">
                You agree to defend, indemnify, and hold harmless A List Webs Inc. and its officers, directors, contractors, and employees from and against any claims, liabilities, damages, judgments, awards, losses, costs, expenses, or reasonable legal fees resulting from your violation of these Terms, your User Content, or your infringement of any third-party rights.
              </p>
            </section>

            {/* Section 13: Termination */}
            <section id="termination" className="space-y-4 scroll-mt-28">
              <div className="flex items-center gap-2.5 text-gold">
                <AlertCircle className="w-5 h-5" />
                <h2 className="text-xl font-display font-bold text-foreground">
                  13. Termination & Account Deletion
                </h2>
              </div>
              <p className="text-zinc-300">
                You may terminate your account at any time by requesting deletion at <a href="mailto:privacy@alistwebs.com" className="text-gold underline">privacy@alistwebs.com</a>. We reserve the right to suspend or terminate accounts that breach these Terms, engage in malicious spamming, distribute copyright-infringing content, or present security risks to our platform, with written notification.
              </p>
            </section>

            {/* Section 14: Governing Law */}
            <section id="governing-law" className="space-y-4 scroll-mt-28">
              <div className="flex items-center gap-2.5 text-gold">
                <Scale className="w-5 h-5" />
                <h2 className="text-xl font-display font-bold text-foreground">
                  14. Governing Law & Dispute Resolution
                </h2>
              </div>
              <p className="text-zinc-300">
                These Terms shall be governed by and construed in accordance with the laws of the State of California, United States, without regard to its conflict of law provisions. Any dispute arising out of or relating to these Terms shall be resolved first through informal good-faith negotiations, and if unresolved, through binding individual arbitration administered by JAMS in San Francisco, California.
              </p>
            </section>

            {/* Section 15: Contact */}
            <section id="contact" className="space-y-4 scroll-mt-28 p-6 rounded-3xl bg-card border border-glass-border">
              <div className="flex items-center gap-2.5 text-gold">
                <Mail className="w-5 h-5" />
                <h2 className="text-xl font-display font-bold text-foreground">
                  15. Notices & Legal Contact Information
                </h2>
              </div>
              <p className="text-zinc-300">
                For questions regarding these Terms or legal notices, please reach out directly:
              </p>
              <div className="font-mono text-xs text-zinc-300 space-y-1.5 p-4 rounded-xl bg-white/[0.02] border border-white/5">
                <p><strong className="text-foreground">Corporate Name:</strong> A List Webs Inc.</p>
                <p><strong className="text-foreground">Legal Inquiries:</strong> <a href="mailto:legal@alistwebs.com" className="text-gold hover:underline">legal@alistwebs.com</a></p>
                <p><strong className="text-foreground">Billing Department:</strong> <a href="mailto:billing@alistwebs.com" className="text-gold hover:underline">billing@alistwebs.com</a></p>
                <p><strong className="text-foreground">DMCA Agent:</strong> <a href="mailto:dmca@alistwebs.com" className="text-gold hover:underline">dmca@alistwebs.com</a></p>
                <p><strong className="text-foreground">Postal Address:</strong> A List Webs Legal, 548 Market St, Suite 39200, San Francisco, CA 94104</p>
              </div>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

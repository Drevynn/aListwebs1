import React, { useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { 
  Shield, 
  Lock, 
  Eye, 
  Database, 
  RefreshCw, 
  FileText, 
  ExternalLink, 
  CheckCircle2, 
  Mail, 
  ArrowLeft,
  Search,
  Globe,
  HardDrive,
  Cpu
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function Privacy() {
  const [searchQuery, setSearchQuery] = useState("");
  const lastUpdated = "September 8, 2026";

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const sections = [
    { id: "introduction", title: "1. Overview & Commitment" },
    { id: "google-data-policy", title: "2. Google API Services & Limited Use (Critical)" },
    { id: "information-we-collect", title: "3. Information We Collect" },
    { id: "how-we-use-information", title: "4. How We Use Your Data" },
    { id: "sharing-disclosure", title: "5. Data Sharing & Third Parties" },
    { id: "retention-deletion", title: "6. Data Retention & Deletion Policy" },
    { id: "security-safeguards", title: "7. Security Safeguards & Encryption" },
    { id: "user-rights", title: "8. Your Privacy Rights (GDPR, UK & CCPA/CPRA)" },
    { id: "cookies-tracking", title: "9. Cookies & Local Storage" },
    { id: "children", title: "10. Children's Privacy" },
    { id: "changes", title: "11. Changes to this Policy" },
    { id: "contact-us", title: "12. Contact & Data Protection Officer" },
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
          <span className="text-foreground">Privacy Policy</span>
        </div>

        {/* Hero Header */}
        <div className="border-b border-glass-border pb-10 mb-10">
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <Badge variant="outline" className="border-gold/40 text-gold bg-gold/10 font-mono text-xs px-3 py-1">
              Legal Document
            </Badge>
            <span className="text-xs text-muted-foreground font-mono">
              Effective Date: {lastUpdated}
            </span>
            <span className="text-xs text-emerald-400 font-mono flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Google API Standards Compliant
            </span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-display font-bold tracking-tight text-foreground mb-4">
            Privacy Policy
          </h1>
          <p className="text-lg text-muted-foreground max-w-3xl leading-relaxed">
            At A List Webs, we hold sovereign creator rights, data privacy, and ethical transparency as foundational principles. This Privacy Policy details how we collect, process, store, protect, and delete your personal information when you build websites, integrate cloud storage, and leverage our creator studio tools.
          </p>

          {/* Quick Search */}
          <div className="mt-6 max-w-md relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Filter policy topics (e.g. Google, deletion, cookies)..."
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
                Table of Contents
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
                <p className="text-foreground font-semibold">Data Protection Officer</p>
                <p>Email: <a href="mailto:privacy@alistwebs.com" className="text-gold hover:underline">privacy@alistwebs.com</a></p>
                <p>Google OAuth Project Verified</p>
              </div>
            </div>
          </aside>

          {/* Right Main Text Content */}
          <div className="lg:col-span-8 space-y-12 text-sm sm:text-base leading-relaxed text-zinc-300">
            {/* Section 1: Overview */}
            <section id="introduction" className="space-y-4 scroll-mt-28">
              <div className="flex items-center gap-2.5 text-gold">
                <Shield className="w-5 h-5" />
                <h2 className="text-xl font-display font-bold text-foreground">
                  1. Overview & Commitment
                </h2>
              </div>
              <p>
                A List Webs Inc. ("A List Webs", "we", "us", or "our") operates the web platform and associated creative software located at <span className="text-foreground font-mono">alistwebs.com</span>. We provide AI-assisted website creation, electronic press kit (EPK) builders, custom domain routing, media hosting, fan contact management, and storage synchronization for independent musicians, artists, and creators.
              </p>
              <p>
                We believe you own your work, your audience relationships, and your data. We do not sell your personal data to third-party data brokers, and we process your information strictly to provide, maintain, and enhance your digital presence.
              </p>
            </section>

            {/* Section 2: Google API Services & Limited Use Policy */}
            <section id="google-data-policy" className="space-y-4 scroll-mt-28 p-6 rounded-3xl bg-card border border-gold/30 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gold/5 rounded-full blur-2xl pointer-events-none" />
              
              <div className="flex items-center gap-2.5 text-gold">
                <Globe className="w-5 h-5" />
                <h2 className="text-xl font-display font-bold text-foreground">
                  2. Google API Services & Limited Use Disclosure
                </h2>
              </div>

              <div className="p-4 rounded-xl bg-gold/10 border border-gold/20 text-xs sm:text-sm text-zinc-200 space-y-2">
                <p className="font-semibold text-gold">Mandatory Compliance Statement:</p>
                <p className="italic">
                  "A List Webs's use and transfer to any other app of information received from Google APIs will adhere to the{" "}
                  <a 
                    href="https://developers.google.com/terms/api-services-user-data-policy" 
                    target="_blank" 
                    rel="noreferrer" 
                    className="text-gold underline font-semibold hover:text-white"
                  >
                    Google API Services User Data Policy
                  </a>
                  , including the Limited Use requirements."
                </p>
              </div>

              <h3 className="text-base font-bold text-foreground pt-2">How We Access and Use Google User Data:</h3>
              <ul className="list-disc pl-5 space-y-2 text-zinc-300">
                <li>
                  <strong className="text-foreground">Google Identity & Sign-In:</strong> When you choose to authenticate via "Sign in with Google", we receive your basic profile information (email address, full name, and avatar image) provided through Google OAuth. This is used exclusively to establish and secure your A List Webs user account.
                </li>
                <li>
                  <strong className="text-foreground">Google Drive API (Cloud Storage Synchronization):</strong> When you explicitly connect your Google Drive account within the Storage Dashboard or Cloud Connections module, we request user authorization to browse and select specific folders or files (such as audio stems, photography, stage plots, or EPK PDFs) that you choose to publish on your website.
                </li>
                <li>
                  <strong className="text-foreground">No Generalized AI Model Training:</strong> We explicitly warrant that no Google user data or private Google Drive documents received through Google APIs are ever transferred, used, or contributed to train, fine-tune, or retrain generalized artificial intelligence, deep learning, or large language models.
                </li>
                <li>
                  <strong className="text-foreground">No Advertising or Transfer:</strong> Google user data is strictly prohibited from being sold, rented, leased, or transferred to third-party ad networks, data brokers, or behavioral analytics providers.
                </li>
                <li>
                  <strong className="text-foreground">Human Access Limitations:</strong> No employee, contractor, or representative of A List Webs will inspect or read your private Google files unless you explicitly authorize us to do so in response to a written technical support request, it is necessary to troubleshoot a specific bug with your consent, or we are compelled to comply with applicable statutory law.
                </li>
              </ul>

              <div className="pt-2">
                <h4 className="text-sm font-semibold text-foreground mb-1">Revoking Google Permissions:</h4>
                <p className="text-xs text-muted-foreground">
                  You can revoke A List Webs's access to your Google account at any time either by clicking "Disconnect" in your A List Webs Storage Dashboard or by visiting your{" "}
                  <a 
                    href="https://myaccount.google.com/permissions" 
                    target="_blank" 
                    rel="noreferrer" 
                    className="text-gold underline inline-flex items-center gap-0.5"
                  >
                    Google Account Security Settings <ExternalLink className="w-3 h-3 inline" />
                  </a>
                  . Upon revocation, all stored tokens are permanently wiped from our databases.
                </p>
              </div>
            </section>

            {/* Section 3: Information We Collect */}
            <section id="information-we-collect" className="space-y-4 scroll-mt-28">
              <div className="flex items-center gap-2.5 text-gold">
                <Database className="w-5 h-5" />
                <h2 className="text-xl font-display font-bold text-foreground">
                  3. Information We Collect
                </h2>
              </div>
              <p>We collect information in three ways: directly from you, automatically through your interaction with our services, and through authorized third-party integrations.</p>
              
              <div className="space-y-3">
                <div className="p-4 rounded-xl bg-card border border-glass-border">
                  <h3 className="font-semibold text-foreground text-sm mb-1">A. Information You Provide Directly</h3>
                  <ul className="list-disc pl-5 space-y-1 text-xs sm:text-sm text-zinc-300">
                    <li><strong>Account Credentials:</strong> Email address, encrypted authentication hashes, and display name.</li>
                    <li><strong>Creator Profile & Content:</strong> Band name, biographical text, tour dates, discography links, press kits, photographs, audio files, and styling preferences submitted to the builder.</li>
                    <li><strong>Audience & Fan Mailings:</strong> Email addresses and names of fans who subscribe to your website contact forms or mailing lists.</li>
                    <li><strong>Customer Support Communications:</strong> Messages, logs, and attachments sent to our support desk.</li>
                  </ul>
                </div>

                <div className="p-4 rounded-xl bg-card border border-glass-border">
                  <h3 className="font-semibold text-foreground text-sm mb-1">B. Automatically Collected Technical Data</h3>
                  <ul className="list-disc pl-5 space-y-1 text-xs sm:text-sm text-zinc-300">
                    <li><strong>Device & Log Information:</strong> IP address, browser type and version, operating system, referral URLs, device identifiers, and timestamps.</li>
                    <li><strong>Usage Telemetry:</strong> Website build actions, template interactions, and dashboard performance metrics to prevent latency and abuse.</li>
                  </ul>
                </div>

                <div className="p-4 rounded-xl bg-card border border-glass-border">
                  <h3 className="font-semibold text-foreground text-sm mb-1">C. Payment Information (Stripe)</h3>
                  <p className="text-xs sm:text-sm text-zinc-300">
                    All payment processing is handled through our PCI-DSS Level 1 compliant partner, <strong>Stripe Inc.</strong> We never store full credit or debit card numbers on A List Webs servers. Stripe handles card details through client-side tokenization and returns secure subscription IDs and invoice records.
                  </p>
                </div>
              </div>
            </section>

            {/* Section 4: How We Use Information */}
            <section id="how-we-use-information" className="space-y-4 scroll-mt-28">
              <div className="flex items-center gap-2.5 text-gold">
                <Cpu className="w-5 h-5" />
                <h2 className="text-xl font-display font-bold text-foreground">
                  4. How We Use Your Data
                </h2>
              </div>
              <p>We process your data strictly on legitimate legal grounds (contractual necessity, consent, and legitimate interests):</p>
              <ul className="list-disc pl-5 space-y-2 text-zinc-300">
                <li><strong>Rendering & Publishing Websites:</strong> Generating responsive web layouts, hosting public domain endpoints, and distributing media files via global CDNs.</li>
                <li><strong>AI Design Generation:</strong> Utilizing the Google Gemini API to translate your natural language descriptions into custom web designs, color palettes, and structured layouts. Prompts sent to Gemini are processed server-side in accordance with Google Enterprise AI data privacy covenants.</li>
                <li><strong>Cloud Synchronization:</strong> Indexing file counts, folder structures, and asset metadata across your connected Google Drive, Dropbox, or studio storage.</li>
                <li><strong>Mailing List Infrastructure:</strong> Managing fan subscriber records and dispatching verified emails on behalf of your artist domain.</li>
                <li><strong>Security & Abuse Prevention:</strong> Enforcing rate limits, preventing denial-of-service attempts, auditing fraud, and protecting creators against malicious access.</li>
              </ul>
            </section>

            {/* Section 5: Data Sharing & Third Parties */}
            <section id="sharing-disclosure" className="space-y-4 scroll-mt-28">
              <div className="flex items-center gap-2.5 text-gold">
                <Eye className="w-5 h-5" />
                <h2 className="text-xl font-display font-bold text-foreground">
                  5. Data Sharing & Third-Party Service Providers
                </h2>
              </div>
              <p>
                We do not sell, monetize, or broker personal information. We share personal information only with vetted infrastructure sub-processors who perform essential operational functions on our behalf:
              </p>
              <div className="overflow-x-auto">
                <table className="w-full text-xs sm:text-sm border border-glass-border rounded-xl overflow-hidden text-left">
                  <thead className="bg-card text-foreground font-mono">
                    <tr className="border-b border-glass-border">
                      <th className="p-3">Partner / Service</th>
                      <th className="p-3">Purpose</th>
                      <th className="p-3">Data Handled</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-glass-border">
                    <tr>
                      <td className="p-3 font-semibold text-foreground">Google Cloud Platform & Firebase</td>
                      <td className="p-3">Database (Firestore), Authentication, Hosting</td>
                      <td className="p-3">User profiles, site records, tokens</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-semibold text-foreground">Google Gemini API</td>
                      <td className="p-3">AI Website & Layout Generation</td>
                      <td className="p-3">User design prompts (ephemeral)</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-semibold text-foreground">Stripe, Inc.</td>
                      <td className="p-3">Subscription Billing & Invoicing</td>
                      <td className="p-3">Customer email, billing address, tokens</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-semibold text-foreground">Dropbox Inc. (Optional)</td>
                      <td className="p-3">User-Linked Storage Sync</td>
                      <td className="p-3">Media filenames, sizes, tokens</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p className="text-xs text-muted-foreground">
                All sub-processors are bound by strict Data Processing Addendums (DPAs) requiring equal or greater data protection standards than those outlined in this policy.
              </p>
            </section>

            {/* Section 6: Data Retention & Deletion */}
            <section id="retention-deletion" className="space-y-4 scroll-mt-28">
              <div className="flex items-center gap-2.5 text-gold">
                <RefreshCw className="w-5 h-5" />
                <h2 className="text-xl font-display font-bold text-foreground">
                  6. Data Retention & Deletion Policy
                </h2>
              </div>
              <p>
                We retain your personal data only as long as your account remains active or as needed to provide you with services, fulfill legal obligations, resolve disputes, and enforce our agreements.
              </p>
              <div className="p-4 rounded-xl bg-card border border-glass-border space-y-2">
                <h3 className="font-semibold text-foreground text-sm">How to Request Permanent Account and Data Deletion:</h3>
                <p className="text-xs sm:text-sm text-zinc-300">
                  You have the absolute right to delete your data at any time. You can initiate full deletion by:
                </p>
                <ol className="list-decimal pl-5 space-y-1 text-xs sm:text-sm text-zinc-300">
                  <li>Sending an email from your registered account address to <a href="mailto:privacy@alistwebs.com" className="text-gold underline">privacy@alistwebs.com</a> with the subject line <strong>"Permanent Account Deletion Request"</strong>.</li>
                  <li>Our compliance team will authenticate your identity and execute permanent deletion of all Firestore documents, site builds, connected OAuth tokens, and fan contacts within <strong>30 calendar days</strong>.</li>
                  <li>You will receive a cryptographically signed deletion certificate confirming full purging across active production systems and database replicas.</li>
                </ol>
              </div>
            </section>

            {/* Section 7: Security Safeguards */}
            <section id="security-safeguards" className="space-y-4 scroll-mt-28">
              <div className="flex items-center gap-2.5 text-gold">
                <Lock className="w-5 h-5" />
                <h2 className="text-xl font-display font-bold text-foreground">
                  7. Security Safeguards & Encryption
                </h2>
              </div>
              <p>
                We implement state-of-the-art administrative, physical, and technical safeguards engineered to prevent unauthorized access, alteration, disclosure, or destruction of your personal data:
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-zinc-300 text-xs sm:text-sm">
                <li><strong>Encryption in Transit:</strong> All HTTP traffic is secured via mandatory TLS 1.3 encryption with strict HTTPS enforcement and HSTS preloading.</li>
                <li><strong>Encryption at Rest:</strong> All database stores, persistent disks, and backup volumes are encrypted at rest with AES-256 cipher specifications.</li>
                <li><strong>Granular Firestore Security Rules:</strong> Database document queries are locked down at the engine level so that users can only read and mutate documents belonging specifically to their authenticated UID.</li>
                <li><strong>Secret Isolation:</strong> All sensitive API keys, OAuth client secrets, and Stripe tokens are held strictly in server-side environment containers and are never leaked to client browsers.</li>
              </ul>
            </section>

            {/* Section 8: Your Privacy Rights */}
            <section id="user-rights" className="space-y-4 scroll-mt-28">
              <div className="flex items-center gap-2.5 text-gold">
                <Shield className="w-5 h-5" />
                <h2 className="text-xl font-display font-bold text-foreground">
                  8. Your Privacy Rights (GDPR, UK GDPR & CCPA/CPRA)
                </h2>
              </div>
              <p>Depending on your jurisdiction, you enjoy robust legal rights concerning your personal data:</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div className="p-3.5 rounded-xl bg-card border border-glass-border">
                  <h4 className="font-semibold text-foreground text-xs uppercase font-mono mb-1 text-gold">EU / UK Residents (GDPR)</h4>
                  <ul className="text-xs space-y-1 text-zinc-300">
                    <li>• Right of Access & Data Portability</li>
                    <li>• Right to Rectification of inaccurate records</li>
                    <li>• Right to Erasure ("Right to be Forgotten")</li>
                    <li>• Right to Restrict or Object to processing</li>
                    <li>• Right to lodge a complaint with your supervisory authority</li>
                  </ul>
                </div>

                <div className="p-3.5 rounded-xl bg-card border border-glass-border">
                  <h4 className="font-semibold text-foreground text-xs uppercase font-mono mb-1 text-gold">California Residents (CCPA/CPRA)</h4>
                  <ul className="text-xs space-y-1 text-zinc-300">
                    <li>• Right to Know categories of personal info collected</li>
                    <li>• Right to Delete personal information</li>
                    <li>• Right to Correct inaccurate personal information</li>
                    <li>• Non-Discrimination for exercising your rights</li>
                    <li>• <strong>Notice of No Sale:</strong> We do NOT sell or share personal data</li>
                  </ul>
                </div>
              </div>
              <p className="text-xs text-muted-foreground pt-1">
                To exercise any of these statutory rights, please submit a request to <a href="mailto:privacy@alistwebs.com" className="text-gold underline">privacy@alistwebs.com</a>. We respond to all verified consumer requests within 30 days without charging any administrative fees.
              </p>
            </section>

            {/* Section 9: Cookies & Local Storage */}
            <section id="cookies-tracking" className="space-y-4 scroll-mt-28">
              <div className="flex items-center gap-2.5 text-gold">
                <HardDrive className="w-5 h-5" />
                <h2 className="text-xl font-display font-bold text-foreground">
                  9. Cookies & Local Storage
                </h2>
              </div>
              <p>
                We use strictly necessary session cookies and browser <span className="font-mono text-foreground">localStorage</span> tokens solely to maintain your authentication state across page reloads, remember your visual theme preferences (dark/light), and safeguard your in-progress builder drafts. We do not place third-party advertising tracking cookies or invasive canvas fingerprinting scripts on your devices.
              </p>
            </section>

            {/* Section 10: Children's Privacy */}
            <section id="children" className="space-y-4 scroll-mt-28">
              <div className="flex items-center gap-2.5 text-gold">
                <FileText className="w-5 h-5" />
                <h2 className="text-xl font-display font-bold text-foreground">
                  10. Children's Privacy
                </h2>
              </div>
              <p>
                A List Webs services are strictly directed to individuals aged 16 and older (or 13 where permitted by applicable local laws). We do not knowingly collect, solicit, or maintain personal information from children under the age of 13. If we become aware that a child under 13 has provided us with personal information, we immediately delete such records.
              </p>
            </section>

            {/* Section 11: Changes */}
            <section id="changes" className="space-y-4 scroll-mt-28">
              <div className="flex items-center gap-2.5 text-gold">
                <RefreshCw className="w-5 h-5" />
                <h2 className="text-xl font-display font-bold text-foreground">
                  11. Changes to this Privacy Policy
                </h2>
              </div>
              <p>
                We may revise this Privacy Policy periodically to reflect changes in regulatory standards, Google API verification guidelines, or platform features. When material modifications occur, we will provide prominent notice via email or a notification banner inside your Studio dashboard at least 14 calendar days prior to the effective date.
              </p>
            </section>

            {/* Section 12: Contact Us */}
            <section id="contact-us" className="space-y-4 scroll-mt-28 p-6 rounded-3xl bg-card border border-glass-border">
              <div className="flex items-center gap-2.5 text-gold">
                <Mail className="w-5 h-5" />
                <h2 className="text-xl font-display font-bold text-foreground">
                  12. Contact & Data Protection Officer
                </h2>
              </div>
              <p className="text-zinc-300">
                If you have questions, inquiries, or requests regarding this Privacy Policy or our compliance with the Google API Services User Data Policy, please contact our Legal & Privacy Operations team:
              </p>
              <div className="font-mono text-xs text-zinc-300 space-y-1.5 p-4 rounded-xl bg-white/[0.02] border border-white/5">
                <p><strong className="text-foreground">Entity:</strong> A List Webs Inc.</p>
                <p><strong className="text-foreground">Privacy Office:</strong> <a href="mailto:privacy@alistwebs.com" className="text-gold hover:underline">privacy@alistwebs.com</a></p>
                <p><strong className="text-foreground">Legal & OAuth Inquiries:</strong> <a href="mailto:legal@alistwebs.com" className="text-gold hover:underline">legal@alistwebs.com</a></p>
                <p><strong className="text-foreground">Technical Support:</strong> <a href="mailto:support@alistwebs.com" className="text-gold hover:underline">support@alistwebs.com</a></p>
                <p><strong className="text-foreground">Mailing Address:</strong> A List Webs Privacy Operations, 548 Market St, Suite 39200, San Francisco, CA 94104</p>
              </div>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

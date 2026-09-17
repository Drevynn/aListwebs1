import { PortfolioData } from "@/types/portfolio";
import { generateSEOSchema, auditSEOSchema } from "@/lib/seoSchemaGenerator";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Code2, 
  Copy, 
  Check, 
  Download, 
  ExternalLink, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle,
  Sparkles,
  ShieldCheck,
  Video,
  Music,
  User,
  Image as ImageIcon
} from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface SEOSchemaViewerProps {
  portfolio: PortfolioData;
}

export default function SEOSchemaViewer({ portfolio }: SEOSchemaViewerProps) {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<"script" | "raw">("script");

  const schema = generateSEOSchema(portfolio);
  const audit = auditSEOSchema(portfolio);

  const formattedJson = JSON.stringify(schema, null, 2);
  const scriptTagCode = `<script type="application/ld+json">\n${formattedJson}\n</script>`;

  const copyToClipboard = () => {
    const textToCopy = activeTab === "script" ? scriptTagCode : formattedJson;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    toast({
      title: "Schema Copied to Clipboard",
      description: "Ready to paste into your website's <head> or HTML entry point.",
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadJson = () => {
    const blob = new Blob([formattedJson], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${portfolio.profile.stageName.toLowerCase().replace(/\s+/g, "-")}-seo-schema.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8">
      {/* Audit Scorecard Header */}
      <div className="p-6 rounded-2xl bg-zinc-900/80 border border-white/10 space-y-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold/10 border border-gold/30 text-gold text-xs font-mono uppercase tracking-widest mb-2">
              <Sparkles className="w-3.5 h-3.5" /> High-Performance Google Schema
            </div>
            <h3 className="font-display font-bold text-2xl text-white">
              SEO & Rich Results Audit Engine
            </h3>
            <p className="text-xs text-muted-foreground mt-1 max-w-xl">
              Structured according to Schema.org standards (MusicGroup, Person, VideoObject, ImageObject) for Google Search, Knowledge Graph, and Bing Indexing.
            </p>
          </div>

          {/* Score Circle */}
          <div className="flex items-center gap-4 bg-black/40 border border-white/10 px-5 py-3 rounded-2xl">
            <div className="text-right">
              <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest block">
                Schema Health
              </span>
              <span className="text-2xl font-bold font-mono text-gold">
                {audit.score}%
              </span>
            </div>
            <div className="w-12 h-12 rounded-full border-4 border-gold/20 flex items-center justify-center relative">
              <div 
                className="absolute inset-0 rounded-full border-4 border-gold transition-all duration-700"
                style={{
                  clipPath: `polygon(0 0, 100% 0, 100% ${audit.score}%, 0 ${audit.score}%)`
                }}
              />
              <span className="text-xs font-bold text-white">
                {audit.score >= 80 ? "A+" : audit.score >= 60 ? "B" : "C"}
              </span>
            </div>
          </div>
        </div>

        {/* Rich Results Eligibility Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          <div className={`p-3 rounded-xl border flex flex-col gap-1 ${
            audit.richResultsEligible.videoCarousel 
              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
              : "bg-white/5 border-white/10 text-zinc-400"
          }`}>
            <div className="flex items-center gap-1.5 text-xs font-semibold">
              <Video className="w-3.5 h-3.5" /> Video Carousel
            </div>
            <span className="text-[10px] font-mono">
              {audit.richResultsEligible.videoCarousel ? "✓ Eligible (VideoObject)" : "○ Needs reel + thumb"}
            </span>
          </div>

          <div className={`p-3 rounded-xl border flex flex-col gap-1 ${
            audit.richResultsEligible.personActorKnowledgeCard
              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
              : "bg-white/5 border-white/10 text-zinc-400"
          }`}>
            <div className="flex items-center gap-1.5 text-xs font-semibold">
              <User className="w-3.5 h-3.5" /> Person Knowledge Card
            </div>
            <span className="text-[10px] font-mono">
              {audit.richResultsEligible.personActorKnowledgeCard ? "✓ Eligible (Person)" : "○ Needs IMDb/headshot"}
            </span>
          </div>

          <div className={`p-3 rounded-xl border flex flex-col gap-1 ${
            audit.richResultsEligible.musicAlbumKnowledgePanel
              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
              : "bg-white/5 border-white/10 text-zinc-400"
          }`}>
            <div className="flex items-center gap-1.5 text-xs font-semibold">
              <Music className="w-3.5 h-3.5" /> Album & Discography
            </div>
            <span className="text-[10px] font-mono">
              {audit.richResultsEligible.musicAlbumKnowledgePanel ? "✓ Eligible (MusicAlbum)" : "○ Needs release"}
            </span>
          </div>

          <div className={`p-3 rounded-xl border flex flex-col gap-1 ${
            audit.richResultsEligible.imageLicensing
              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
              : "bg-white/5 border-white/10 text-zinc-400"
          }`}>
            <div className="flex items-center gap-1.5 text-xs font-semibold">
              <ImageIcon className="w-3.5 h-3.5" /> Image Licensing
            </div>
            <span className="text-[10px] font-mono">
              {audit.richResultsEligible.imageLicensing ? "✓ Eligible (ImageObject)" : "○ Add photo credit"}
            </span>
          </div>
        </div>

        {/* Detailed Criteria Checklist */}
        <div className="space-y-2 pt-2 border-t border-white/10">
          <h4 className="text-xs font-mono uppercase tracking-wider text-zinc-400">
            Schema Validation Breakdown
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {audit.items.map((item) => (
              <div
                key={item.key}
                className="p-2.5 rounded-xl bg-black/40 border border-white/5 flex items-start gap-2.5 text-xs"
              >
                {item.status === "passed" ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                ) : item.status === "warning" ? (
                  <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                )}
                <div>
                  <span className="font-semibold text-white block">{item.label}</span>
                  <span className="text-zinc-400 text-[11px] leading-relaxed">{item.message}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Code Inspector & Copy Box */}
      <div className="p-6 rounded-2xl bg-zinc-900/60 border border-white/10 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab("script")}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all ${
                activeTab === "script"
                  ? "bg-gold/20 text-gold border border-gold/30 font-semibold"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              &lt;script type="application/ld+json"&gt;
            </button>
            <button
              onClick={() => setActiveTab("raw")}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all ${
                activeTab === "raw"
                  ? "bg-gold/20 text-gold border border-gold/30 font-semibold"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              Raw Schema.org JSON
            </button>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={downloadJson}
              className="text-xs border-white/20 h-8"
            >
              <Download className="w-3.5 h-3.5 mr-1" /> Download JSON
            </Button>
            <Button
              variant="hero"
              size="sm"
              onClick={copyToClipboard}
              className="text-xs h-8"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 mr-1 text-black" /> Copied!
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 mr-1" /> Copy Code
                </>
              )}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => window.open("https://search.google.com/test/rich-results", "_blank")}
              className="text-xs text-zinc-400 hover:text-white h-8"
              title="Validate on Google Rich Results Test"
            >
              <ExternalLink className="w-3.5 h-3.5 mr-1" /> Google Test Tool
            </Button>
          </div>
        </div>

        {/* Code Display */}
        <div className="relative rounded-xl overflow-hidden bg-black/80 border border-white/10">
          <pre className="p-4 text-xs font-mono text-zinc-300 overflow-x-auto max-h-[480px] leading-relaxed select-all">
            {activeTab === "script" ? scriptTagCode : formattedJson}
          </pre>
        </div>
      </div>
    </div>
  );
}

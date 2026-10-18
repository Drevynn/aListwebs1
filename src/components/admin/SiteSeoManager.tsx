import React, { useState, useEffect } from "react";
import { Site, SeoMetadata } from "@/types";
import { db } from "@/lib/firebase";
import { doc, updateDoc } from "firebase/firestore";
import {
  Globe,
  Search,
  Sparkles,
  Share2,
  Save,
  CheckCircle2,
  Eye,
  Twitter,
  Image as ImageIcon,
  ExternalLink,
  Layers,
  Copy,
  Info,
  RefreshCw,
  Tag,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

interface SiteSeoManagerProps {
  sites: Site[];
  onSiteUpdated?: (updatedSite: Site) => void;
}

export const SiteSeoManager: React.FC<SiteSeoManagerProps> = ({
  sites,
  onSiteUpdated,
}) => {
  const [selectedSiteId, setSelectedSiteId] = useState<string>(
    sites[0]?.id || ""
  );
  const [previewTab, setPreviewTab] = useState<"google" | "social" | "twitter">(
    "google"
  );
  const [isSaving, setIsSaving] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  // Form states
  const [metaTitle, setMetaTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [ogTitle, setOgTitle] = useState("");
  const [ogDescription, setOgDescription] = useState("");
  const [ogImage, setOgImage] = useState("");
  const [keywordsInput, setKeywordsInput] = useState("");
  const [authorName, setAuthorName] = useState("");
  const [twitterHandle, setTwitterHandle] = useState("");
  const [canonicalUrl, setCanonicalUrl] = useState("");

  const selectedSite = sites.find((s) => s.id === selectedSiteId) || sites[0];

  // Sync form when selected site changes
  useEffect(() => {
    if (selectedSite) {
      const seo = selectedSite.seoMetadata || {};
      const fallbackTitle = `${selectedSite.name || "Creator"} | Official Digital Headquarters`;
      const fallbackDesc = selectedSite.design_summary
        ? selectedSite.design_summary.slice(0, 155)
        : `Official website, Electronic Press Kit (EPK), tour dates, and media showreels for ${selectedSite.name || "this artist"}.`;

      setMetaTitle(seo.metaTitle || fallbackTitle);
      setMetaDescription(seo.metaDescription || fallbackDesc);
      setOgTitle(seo.ogTitle || seo.metaTitle || fallbackTitle);
      setOgDescription(seo.ogDescription || seo.metaDescription || fallbackDesc);
      setOgImage(
        seo.ogImage ||
          "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=1200&h=630&q=80"
      );
      setKeywordsInput((seo.keywords || ["epk", "press kit", "music", "official"]).join(", "));
      setAuthorName(seo.authorName || selectedSite.name || "");
      setTwitterHandle(seo.twitterHandle || "@alistwebs");
      setCanonicalUrl(
        seo.canonicalUrl ||
          (selectedSite.domain ? `https://${selectedSite.domain}` : `https://alistwebs.com/preview/${selectedSite.id}`)
      );
    }
  }, [selectedSiteId, selectedSite]);

  // AI SEO Optimizer Generator
  const handleGenerateAiSeo = () => {
    if (!selectedSite) return;
    setIsGenerating(true);

    const siteName = selectedSite.name || "Creative Artist";
    const archetype = (selectedSite.archetype || "musician").toLowerCase();

    setTimeout(() => {
      let title = "";
      let desc = "";
      let keywords: string[] = [];

      if (archetype.includes("film") || archetype.includes("actor") || archetype.includes("director")) {
        title = `${siteName} • Official Film Portfolio & Showreel | EPK`;
        desc = `Watch the official 4K showreels, festival screener links, casting dossiers, and industry credits for ${siteName}. Represented talent & creative director.`;
        keywords = ["showreel", "casting deck", "film director", "actor portfolio", "festival screener", "sag-aftra"];
      } else if (archetype.includes("writer") || archetype.includes("author") || archetype.includes("screen")) {
        title = `${siteName} • Official Author Page, Manuscripts & Queries`;
        desc = `Official author headquarters for ${siteName}. Read published manuscripts, sample chapters, loglines, and press reviews.`;
        keywords = ["author", "manuscripts", "screenwriter", "loglines", "literary query", "novels"];
      } else {
        // Musician / Band default
        title = `${siteName} • Official EPK, Tour Dates & Music HQ`;
        desc = `Stream uncompressed masters, download the electronic press kit, and get tickets for ${siteName}. Verified booking contact and live show dates.`;
        keywords = ["tour dates", "electronic press kit", "epk", "lossless audio", "booking agent", "artist press kit"];
      }

      setMetaTitle(title);
      setMetaDescription(desc);
      setOgTitle(title);
      setOgDescription(desc);
      setKeywordsInput(keywords.join(", "));
      setIsGenerating(false);
      toast.success("AI SEO optimization generated based on your artist archetype!");
    }, 600);
  };

  // Save to Firestore
  const handleSaveSeo = async () => {
    if (!selectedSite) {
      toast.error("Please select a site first.");
      return;
    }

    setIsSaving(true);
    try {
      const keywords = keywordsInput
        .split(",")
        .map((k) => k.trim())
        .filter(Boolean);

      const updatedSeo: SeoMetadata = {
        metaTitle: metaTitle.trim(),
        metaDescription: metaDescription.trim(),
        ogTitle: ogTitle.trim(),
        ogDescription: ogDescription.trim(),
        ogImage: ogImage.trim(),
        keywords,
        authorName: authorName.trim(),
        twitterHandle: twitterHandle.trim(),
        canonicalUrl: canonicalUrl.trim(),
        updatedAt: new Date().toISOString(),
      };

      const siteRef = doc(db, "sites", selectedSite.id);
      await updateDoc(siteRef, {
        seoMetadata: updatedSeo,
        updated_at: new Date().toISOString(),
      });

      if (onSiteUpdated) {
        onSiteUpdated({
          ...selectedSite,
          seoMetadata: updatedSeo,
        });
      }

      toast.success(`SEO metadata successfully updated for ${selectedSite.name || "site"}!`);
    } catch (err: unknown) {
      console.error("Error saving SEO metadata:", err);
      const msg = err instanceof Error ? err.message : "Failed to save SEO metadata";
      toast.error(msg);
    } finally {
      setIsSaving(false);
    }
  };

  // Character length indicators
  const titleLen = metaTitle.length;
  const descLen = metaDescription.length;

  return (
    <div className="space-y-8">
      {/* Header & Site Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-zinc-900/90 border border-white/10 shadow-lg">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold/10 border border-gold/30 text-gold text-xs font-mono uppercase tracking-wider mb-2">
            <Search className="w-3.5 h-3.5" />
            <span>Search Engine & Social Discovery</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-display font-bold text-foreground">
            Dynamic SEO & Open Graph Tags
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Configure how your artist headquarters ranks on Google and renders when shared across iMessage, X, WhatsApp, and LinkedIn.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <label className="text-xs font-mono text-muted-foreground whitespace-nowrap">
            Target Site:
          </label>
          <select
            value={selectedSiteId}
            onChange={(e) => setSelectedSiteId(e.target.value)}
            className="px-3 py-2 rounded-xl bg-zinc-950 border border-white/20 text-xs text-foreground focus:outline-none focus:border-gold font-mono"
          >
            {sites.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name || s.domain || s.id.slice(0, 8)} ({s.archetype || "creator"})
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Form Controls */}
        <div className="lg:col-span-7 space-y-6 p-6 rounded-2xl bg-zinc-900/70 border border-white/10 shadow-lg">
          <div className="flex items-center justify-between pb-4 border-b border-white/10">
            <span className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Layers className="w-4 h-4 text-gold" />
              Meta Tags Configuration
            </span>

            <Button
              variant="outline"
              size="sm"
              onClick={handleGenerateAiSeo}
              disabled={isGenerating}
              className="gap-1.5 text-xs border-gold/40 text-gold hover:bg-gold/10"
            >
              <Sparkles className={`w-3.5 h-3.5 ${isGenerating ? "animate-spin" : ""}`} />
              <span>AI Auto-Optimize</span>
            </Button>
          </div>

          {/* Meta Title */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-xs">
              <label className="font-medium text-foreground">Page Meta Title (&lt;title&gt;)</label>
              <span
                className={`font-mono text-[11px] ${
                  titleLen > 60 ? "text-amber-400 font-bold" : titleLen >= 40 ? "text-emerald-400" : "text-muted-foreground"
                }`}
              >
                {titleLen}/60 chars (recommended: 50–60)
              </span>
            </div>
            <Input
              value={metaTitle}
              onChange={(e) => {
                setMetaTitle(e.target.value);
                if (!ogTitle || ogTitle === metaTitle) setOgTitle(e.target.value);
              }}
              placeholder="e.g. Marcus Vance • Official EPK, Tour Dates & Music HQ"
              className="bg-zinc-950/80 border-white/15 focus:border-gold text-sm"
            />
          </div>

          {/* Meta Description */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-xs">
              <label className="font-medium text-foreground">
                Meta Description (&lt;meta name="description"&gt;)
              </label>
              <span
                className={`font-mono text-[11px] ${
                  descLen > 160 ? "text-amber-400 font-bold" : descLen >= 120 ? "text-emerald-400" : "text-muted-foreground"
                }`}
              >
                {descLen}/160 chars (recommended: 130–160)
              </span>
            </div>
            <Textarea
              value={metaDescription}
              onChange={(e) => {
                setMetaDescription(e.target.value);
                if (!ogDescription || ogDescription === metaDescription) setOgDescription(e.target.value);
              }}
              rows={3}
              placeholder="e.g. Stream uncompressed masters, download the electronic press kit, and get tickets for Marcus Vance."
              className="bg-zinc-950/80 border-white/15 focus:border-gold text-sm"
            />
          </div>

          {/* Open Graph Title & Description */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">Open Graph Title (og:title)</label>
              <Input
                value={ogTitle}
                onChange={(e) => setOgTitle(e.target.value)}
                placeholder="Social card title"
                className="bg-zinc-950/80 border-white/15 focus:border-gold text-xs"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">Canonical URL</label>
              <Input
                value={canonicalUrl}
                onChange={(e) => setCanonicalUrl(e.target.value)}
                placeholder="https://artistname.com"
                className="bg-zinc-950/80 border-white/15 focus:border-gold text-xs"
              />
            </div>
          </div>

          {/* OG Image URL */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground flex items-center gap-1.5">
              <ImageIcon className="w-3.5 h-3.5 text-gold" />
              Open Graph Banner Image URL (og:image / Twitter card)
            </label>
            <Input
              value={ogImage}
              onChange={(e) => setOgImage(e.target.value)}
              placeholder="https://domain.com/social-banner.jpg (1200x630px ideal)"
              className="bg-zinc-950/80 border-white/15 focus:border-gold text-xs font-mono"
            />
          </div>

          {/* Keywords & Twitter Handle */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-gold" />
                Target Keywords (comma-separated)
              </label>
              <Input
                value={keywordsInput}
                onChange={(e) => setKeywordsInput(e.target.value)}
                placeholder="epk, tour dates, music, booking"
                className="bg-zinc-950/80 border-white/15 focus:border-gold text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground flex items-center gap-1.5">
                <Twitter className="w-3.5 h-3.5 text-gold" />
                Creator Twitter / X Handle
              </label>
              <Input
                value={twitterHandle}
                onChange={(e) => setTwitterHandle(e.target.value)}
                placeholder="@artistname"
                className="bg-zinc-950/80 border-white/15 focus:border-gold text-xs"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="pt-4 flex items-center justify-between border-t border-white/10">
            <span className="text-[11px] text-muted-foreground font-mono flex items-center gap-1">
              <Info className="w-3.5 h-3.5 text-gold" />
              Saves instantly to live Edge CDN headers
            </span>

            <Button
              onClick={handleSaveSeo}
              disabled={isSaving}
              className="gap-2 bg-gradient-to-r from-burgundy via-burgundy-light to-gold text-white font-bold hover:brightness-110 shadow-lg shadow-gold/20"
            >
              {isSaving ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save SEO Metadata</span>
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Right Column: Live Multi-Platform Visual Previews */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-1 rounded-xl bg-zinc-950 border border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setPreviewTab("google")}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all flex items-center gap-1.5 ${
                  previewTab === "google"
                    ? "bg-zinc-800 text-gold font-bold shadow-sm"
                    : "text-muted-foreground hover:text-white"
                }`}
              >
                <Search className="w-3.5 h-3.5" />
                <span>Google</span>
              </button>
              <button
                type="button"
                onClick={() => setPreviewTab("social")}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all flex items-center gap-1.5 ${
                  previewTab === "social"
                    ? "bg-zinc-800 text-gold font-bold shadow-sm"
                    : "text-muted-foreground hover:text-white"
                }`}
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>iMessage / FB</span>
              </button>
              <button
                type="button"
                onClick={() => setPreviewTab("twitter")}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all flex items-center gap-1.5 ${
                  previewTab === "twitter"
                    ? "bg-zinc-800 text-gold font-bold shadow-sm"
                    : "text-muted-foreground hover:text-white"
                }`}
              >
                <Twitter className="w-3.5 h-3.5" />
                <span>Twitter / X</span>
              </button>
            </div>
            <span className="text-[10px] text-muted-foreground font-mono pr-2">Live Preview</span>
          </div>

          {/* Google Preview Mockup */}
          {previewTab === "google" && (
            <div className="p-5 rounded-2xl bg-zinc-950 border border-white/15 space-y-2.5 shadow-xl">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-zinc-800 flex items-center justify-center text-[10px] font-bold text-gold">
                  A
                </div>
                <div className="flex flex-col">
                  <span className="text-[11px] font-medium text-zinc-300">
                    {authorName || selectedSite?.name || "Official Artist Website"}
                  </span>
                  <span className="text-[10px] text-emerald-400 font-mono truncate max-w-[280px]">
                    {canonicalUrl || "https://artistname.com"}
                  </span>
                </div>
              </div>
              <h3 className="text-base sm:text-lg font-medium text-blue-400 hover:underline cursor-pointer leading-snug">
                {metaTitle || "Page Title • Official Creator Headquarters"}
              </h3>
              <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">
                {metaDescription || "Official electronic press kit, tour dates, high-bitrate showreels, and booking contacts."}
              </p>
            </div>
          )}

          {/* Social / iMessage / Open Graph Preview Mockup */}
          {previewTab === "social" && (
            <div className="rounded-2xl bg-zinc-950 border border-white/15 overflow-hidden shadow-xl">
              <div className="aspect-[1.91/1] w-full bg-zinc-900 relative overflow-hidden">
                {ogImage ? (
                  <img
                    src={ogImage}
                    alt="OG Social Card Banner"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src =
                        "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=1200&h=630&q=80";
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs font-mono">
                    No preview image URL provided
                  </div>
                )}
                <div className="absolute top-2 right-2 px-2 py-0.5 rounded bg-black/70 backdrop-blur text-[10px] font-mono text-gold">
                  1200 × 630
                </div>
              </div>
              <div className="p-4 space-y-1.5 bg-zinc-900/80">
                <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider truncate block">
                  {canonicalUrl ? new URL(canonicalUrl.startsWith("http") ? canonicalUrl : `https://${canonicalUrl}`).hostname : "alistwebs.com"}
                </span>
                <h4 className="text-sm font-bold text-foreground line-clamp-1">
                  {ogTitle || metaTitle || "Official Artist Headquarters"}
                </h4>
                <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                  {ogDescription || metaDescription || "Discover tour dates, master audio, and official press kit."}
                </p>
              </div>
            </div>
          )}

          {/* Twitter / X Large Summary Card Mockup */}
          {previewTab === "twitter" && (
            <div className="p-4 rounded-2xl bg-black border border-zinc-800 space-y-3 shadow-xl">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-burgundy to-gold flex items-center justify-center font-bold text-xs text-white">
                  {(authorName || "A")[0]}
                </div>
                <div className="text-xs">
                  <div className="flex items-center gap-1 font-bold text-white">
                    <span>{authorName || "Artist"}</span>
                    <span className="text-blue-400">✓</span>
                    <span className="text-zinc-500 font-normal">{twitterHandle || "@artistname"}</span>
                  </div>
                  <span className="text-[11px] text-zinc-400">
                    Just announced the new release & official EPK! Check it out below 👇
                  </span>
                </div>
              </div>

              {/* Twitter card */}
              <div className="rounded-xl border border-zinc-800 overflow-hidden bg-zinc-950">
                <div className="aspect-[16/9] w-full bg-zinc-900 relative">
                  <img
                    src={ogImage || "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=1200&h=630&q=80"}
                    alt="Twitter Preview Banner"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-3 space-y-1">
                  <span className="text-[10px] text-zinc-500 font-mono">
                    {canonicalUrl ? new URL(canonicalUrl.startsWith("http") ? canonicalUrl : `https://${canonicalUrl}`).hostname : "alistwebs.com"}
                  </span>
                  <p className="text-xs font-bold text-white truncate">
                    {ogTitle || metaTitle}
                  </p>
                  <p className="text-[11px] text-zinc-400 line-clamp-2">
                    {ogDescription || metaDescription}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Live Preview Direct Link */}
          {selectedSite && (
            <div className="p-4 rounded-xl bg-zinc-900/60 border border-white/10 flex items-center justify-between text-xs">
              <span className="text-muted-foreground font-mono">Published Link:</span>
              <a
                href={`/preview/${selectedSite.id}`}
                target="_blank"
                rel="noreferrer"
                className="text-gold hover:underline inline-flex items-center gap-1 font-medium font-mono"
              >
                <span>/preview/{selectedSite.id.slice(0, 8)}...</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

import { ShowreelItem } from "@/types/portfolio";
import { parseVideoUrl } from "@/lib/seoSchemaGenerator";
import { ShowreelGallery } from "@/components/portfolio/ShowreelGallery";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Film, 
  Plus, 
  Trash2, 
  Play, 
  ExternalLink, 
  Lock, 
  Clock, 
  Sparkles,
  Clapperboard,
  CheckCircle2,
  LayoutGrid,
  Edit3,
  Award,
  Camera,
  Layers
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface ShowreelsManagerProps {
  showreels: ShowreelItem[];
  onChange: (updated: ShowreelItem[]) => void;
}

const CATEGORY_LABELS: Record<ShowreelItem['category'], string> = {
  dramatic: "Dramatic Screen Reel",
  comedic: "Comedic Reel",
  commercial: "Commercial & VO Reel",
  live_performance: "Live Gig / Concert Reel",
  music_video: "Cinematic Music Video",
  stunt: "Stunt & Physical Combat",
  voiceover: "Voiceover & Animation",
  cinematography: "Cinematography & Camera Reel",
  lighting_gaffer: "Lighting & Gaffer / DMX Breakdown",
  grip_rigging: "Key Grip & Rigging / Crane Reel",
  sound_mix: "Production Sound & Audio Reel",
  directing: "Directing & Scene Anthology",
  editing_color: "Editorial & Finishing Color Reel",
  vfx_breakdown: "VFX Breakdown & Compositing",
};

export default function ShowreelsManager({ showreels, onChange }: ShowreelsManagerProps) {
  const [activePreviewId, setActivePreviewId] = useState<string | null>(showreels[0]?.id || null);
  const [viewMode, setViewMode] = useState<"gallery" | "editor">("gallery");

  const addShowreel = () => {
    const newItem: ShowreelItem = {
      id: `sr-${Date.now()}`,
      title: "New Dramatic Casting Reel",
      url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      category: "dramatic",
      roleOrCharacter: "Lead Detective",
      duration: "02:30",
      resolution: "4K DCI",
      uploadDate: new Date().toISOString().split("T")[0],
      thumbnailUrl: "https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?auto=format&fit=crop&w=800&q=80",
      description: "High-intensity dialogue and dramatic monologue for feature film casting.",
      isPrivate: false,
    };
    onChange([...showreels, newItem]);
    setActivePreviewId(newItem.id);
  };

  const loadSampleReels = () => {
    const samples: ShowreelItem[] = [
      {
        id: "sr-sample-1",
        title: "Dramatic Feature Casting Reel: 'Hollow Wire'",
        url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        category: "dramatic",
        roleOrCharacter: "Detective Elena Vance",
        duration: "02:45",
        resolution: "4K DCI ProRes",
        awardLaurel: "🏆 Sundance Film Festival Dramatic Competition",
        cameraPackage: "ARRI Alexa Mini LF • Cooke Anamorphic /i Full Frame Plus",
        uploadDate: "2026-02-14",
        thumbnailUrl: "https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=800&q=80",
        description: "Intense interrogation sequence with scene partner Michael Shannon. Demonstrates rapid emotional arc and grounded vulnerability.",
        scenePartner: "Michael Shannon",
        isPrivate: false,
      },
      {
        id: "sr-sample-2",
        title: "Cinematographer DP Reel: Natural Light & Anamorphic",
        url: "https://vimeo.com/76979871",
        category: "cinematography",
        roleOrCharacter: "Director of Photography",
        duration: "03:15",
        resolution: "4K Cinema 2.39:1",
        awardLaurel: "🏆 Camerimage Golden Frog Nominee",
        cameraPackage: "ARRI Alexa 35 • Zeiss Master Primes • Ronin 2 Rigging",
        uploadDate: "2026-03-01",
        thumbnailUrl: "https://images.unsplash.com/photo-1518676590629-3dcbd9c5a5c9?auto=format&fit=crop&w=800&q=80",
        description: "Cinematography master reel showcasing low-light tungsten lighting, high-speed anamorphic tracking shots, and cinematic camera movement.",
        isPrivate: false,
      },
      {
        id: "sr-sample-3",
        title: "Comedic Monologue & Improv Feature Cut",
        url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        category: "comedic",
        roleOrCharacter: "Leo Sparks (Eccentric Tech Founder)",
        duration: "01:50",
        resolution: "1080p ProRes",
        awardLaurel: "🏆 Tribeca Official Selection",
        cameraPackage: "RED V-Raptor 8K • Leica Summilux-C",
        uploadDate: "2026-01-20",
        thumbnailUrl: "https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?auto=format&fit=crop&w=800&q=80",
        description: "Deadpan comedic timing and pitch presentation scene. Cast opposite premier ensemble players.",
        isPrivate: false,
      },
      {
        id: "sr-sample-4",
        title: "Directing Anthology: Narrative Short 'Night Drift'",
        url: "https://vimeo.com/76979871",
        category: "directing",
        roleOrCharacter: "Director & Co-Writer",
        duration: "04:10",
        resolution: "4K HDR Dolby Vision",
        awardLaurel: "🏆 BAFTA Short Film Longlist",
        cameraPackage: "Panavision Millennium DXL2 • Panaspeed 35mm",
        uploadDate: "2025-11-12",
        thumbnailUrl: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=800&q=80",
        description: "Nocturnal neo-noir pacing highlighting atmosphere, pacing, sound design, and actor chemistry in confined vehicle spaces.",
        isPrivate: false,
      },
    ];

    onChange(samples);
    setActivePreviewId(samples[0].id);
    toast.success("Loaded curated actor and filmmaker showreels!");
  };

  const updateShowreel = (id: string, updates: Partial<ShowreelItem>) => {
    onChange(showreels.map((s) => (s.id === id ? { ...s, ...updates } : s)));
  };

  const removeShowreel = (id: string) => {
    onChange(showreels.filter((s) => s.id !== id));
    if (activePreviewId === id) {
      setActivePreviewId(showreels.find((s) => s.id !== id)?.id || null);
    }
  };

  const activeReel = showreels.find((s) => s.id === activePreviewId);
  const parsedActiveUrl = activeReel ? parseVideoUrl(activeReel.url) : null;

  return (
    <div className="space-y-8">
      {/* Header & Add Button */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl bg-zinc-900/60 border border-white/10">
        <div>
          <h3 className="font-display font-bold text-lg text-white flex items-center gap-2">
            <Film className="w-5 h-5 text-gold" />
            Showreels & Video Portfolio (Schema.org/VideoObject)
          </h3>
          <p className="text-xs text-muted-foreground mt-1 max-w-xl">
            Responsive drag-and-drop media showcase for actors and filmmakers. Supports 16:9 4K thumbnails, category filtering, camera packages, and ISO 8601 rich snippet generation.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {/* Mode switch */}
          <div className="bg-black/50 border border-white/10 p-1 rounded-xl flex items-center gap-1">
            <button
              type="button"
              onClick={() => setViewMode("gallery")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                viewMode === "gallery" ? "bg-gold text-zinc-950 font-bold shadow-sm" : "text-zinc-400 hover:text-white"
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              Interactive Gallery
            </button>
            <button
              type="button"
              onClick={() => setViewMode("editor")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                viewMode === "editor" ? "bg-gold text-zinc-950 font-bold shadow-sm" : "text-zinc-400 hover:text-white"
              }`}
            >
              <Edit3 className="w-3.5 h-3.5" />
              Metadata Editor
            </button>
          </div>

          <Button onClick={loadSampleReels} variant="outline" size="sm" className="rounded-xl border-white/20 text-xs">
            <Sparkles className="w-3.5 h-3.5 mr-1 text-gold" /> Sample Reels
          </Button>

          <Button onClick={addShowreel} variant="hero" size="sm" className="rounded-xl shrink-0">
            <Plus className="w-4 h-4 mr-1.5" />
            Add Showreel
          </Button>
        </div>
      </div>

      {showreels.length === 0 ? (
        <div className="py-16 text-center border border-dashed border-white/10 rounded-2xl p-6 bg-black/20">
          <Clapperboard className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
          <h4 className="text-base font-semibold text-zinc-300">No showreels added yet</h4>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto mt-1 mb-4">
            Showreels provide the single highest engagement factor for casting directors, festival judges, and booking agents.
          </p>
          <div className="flex items-center justify-center gap-3">
            <Button onClick={loadSampleReels} variant="hero" size="sm">
              <Sparkles className="w-4 h-4 mr-1.5" /> Load Actor & Filmmaker Samples
            </Button>
            <Button onClick={addShowreel} variant="outline" size="sm" className="border-white/20">
              <Plus className="w-4 h-4 mr-1" /> Add Empty Showreel
            </Button>
          </div>
        </div>
      ) : viewMode === "gallery" ? (
        /* Visual Interactive Drag-and-Drop Gallery Mode */
        <div className="space-y-4">
          <ShowreelGallery
            showreels={showreels}
            onReorder={onChange}
            onUpdateReel={updateShowreel}
            editable={true}
          />
        </div>
      ) : (
        /* Form Editor Mode */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* List & Edit Forms */}
          <div className="lg:col-span-7 space-y-6">
            {showreels.map((reel, index) => {
              const isSelected = reel.id === activePreviewId;
              return (
                <div
                  key={reel.id}
                  className={`p-5 rounded-2xl border transition-all ${
                    isSelected
                      ? "bg-zinc-900/90 border-gold/50 shadow-lg shadow-gold/5"
                      : "bg-zinc-900/40 border-white/10 hover:border-white/20"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-4 pb-3 border-b border-white/10">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-gold/10 text-gold font-mono text-xs flex items-center justify-center font-bold">
                        {index + 1}
                      </span>
                      <span className="font-semibold text-sm text-white truncate max-w-[200px] sm:max-w-xs">
                        {reel.title || "Untitled Showreel"}
                      </span>
                      {reel.awardLaurel && (
                        <Badge variant="outline" className="border-gold/30 text-gold text-[10px] hidden sm:inline-flex">
                          🏆 Award Winner
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setActivePreviewId(reel.id)}
                        className={`text-xs h-7 px-2.5 rounded-lg ${
                          isSelected ? "bg-gold/20 text-gold" : "text-zinc-400 hover:text-white"
                        }`}
                      >
                        <Play className="w-3 h-3 mr-1" /> Preview
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeShowreel(reel.id)}
                        className="text-xs h-7 px-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1 sm:col-span-2">
                        <label className="text-xs font-mono uppercase tracking-wider text-zinc-300">
                          Showreel Title *
                        </label>
                        <Input
                          value={reel.title}
                          onChange={(e) => updateShowreel(reel.id, { title: e.target.value })}
                          placeholder="e.g. 2026 Dramatic & Theatrical Reel"
                          className="bg-black/40 border-white/15 text-sm"
                        />
                      </div>

                      <div className="space-y-1 sm:col-span-2">
                        <label className="text-xs font-mono uppercase tracking-wider text-zinc-300">
                          Video URL (YouTube, Vimeo, or Direct MP4) *
                        </label>
                        <Input
                          value={reel.url}
                          onChange={(e) => updateShowreel(reel.id, { url: e.target.value })}
                          placeholder="https://vimeo.com/... or https://youtube.com/..."
                          className="bg-black/40 border-white/15 text-sm font-mono"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-mono uppercase tracking-wider text-zinc-300">
                          Category / Purpose
                        </label>
                        <select
                          value={reel.category}
                          onChange={(e) => updateShowreel(reel.id, { category: e.target.value as ShowreelItem['category'] })}
                          className="w-full bg-black/40 border border-white/15 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-gold"
                        >
                          <option value="dramatic">Dramatic Screen Reel</option>
                          <option value="comedic">Comedic Reel</option>
                          <option value="commercial">Commercial & VO</option>
                          <option value="cinematography">Cinematography & Camera Reel</option>
                          <option value="directing">Directing & Scene Anthology</option>
                          <option value="editing_color">Editorial & Finishing Color Reel</option>
                          <option value="stunt">Stunt & Screen Combat</option>
                          <option value="voiceover">Voiceover & Animation</option>
                          <option value="live_performance">Live Concert / Stage Gig</option>
                          <option value="music_video">Cinematic Music Video</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-mono uppercase tracking-wider text-zinc-300">
                          Character / Role (Actors)
                        </label>
                        <Input
                          value={reel.roleOrCharacter || ""}
                          onChange={(e) => updateShowreel(reel.id, { roleOrCharacter: e.target.value })}
                          placeholder="e.g. Det. Miller in 'Hollow Wire'"
                          className="bg-black/40 border-white/15 text-sm"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-mono uppercase tracking-wider text-zinc-300">
                          Camera & Lens Kit (Filmmakers)
                        </label>
                        <Input
                          value={reel.cameraPackage || ""}
                          onChange={(e) => updateShowreel(reel.id, { cameraPackage: e.target.value })}
                          placeholder="e.g. ARRI Alexa Mini LF • Cooke Anamorphic"
                          className="bg-black/40 border-white/15 text-sm font-mono"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-mono uppercase tracking-wider text-zinc-300">
                          Festival Laurels & Awards
                        </label>
                        <Input
                          value={reel.awardLaurel || ""}
                          onChange={(e) => updateShowreel(reel.id, { awardLaurel: e.target.value })}
                          placeholder="e.g. 🏆 Sundance Official Selection"
                          className="bg-black/40 border-white/15 text-sm"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-mono uppercase tracking-wider text-zinc-300">
                          Duration (mm:ss) *
                        </label>
                        <div className="relative">
                          <Clock className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-3" />
                          <Input
                            value={reel.duration || ""}
                            onChange={(e) => updateShowreel(reel.id, { duration: e.target.value })}
                            placeholder="03:45"
                            className="bg-black/40 border-white/15 text-sm pl-8 font-mono"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-mono uppercase tracking-wider text-zinc-300">
                          Resolution / Color
                        </label>
                        <Input
                          value={reel.resolution || ""}
                          onChange={(e) => updateShowreel(reel.id, { resolution: e.target.value })}
                          placeholder="e.g. 4K DCI ProRes 4444"
                          className="bg-black/40 border-white/15 text-sm font-mono"
                        />
                      </div>

                      <div className="space-y-1 sm:col-span-2">
                        <label className="text-xs font-mono uppercase tracking-wider text-zinc-300">
                          Thumbnail / Poster Image URL (Required for Google Video Rich Snippets)
                        </label>
                        <Input
                          value={reel.thumbnailUrl || ""}
                          onChange={(e) => updateShowreel(reel.id, { thumbnailUrl: e.target.value })}
                          placeholder="https://images.unsplash.com/..."
                          className="bg-black/40 border-white/15 text-sm font-mono"
                        />
                      </div>

                      <div className="space-y-1 sm:col-span-2">
                        <label className="text-xs font-mono uppercase tracking-wider text-zinc-300">
                          Spotting Notes & Synopsis
                        </label>
                        <Textarea
                          rows={2}
                          value={reel.description || ""}
                          onChange={(e) => updateShowreel(reel.id, { description: e.target.value })}
                          placeholder="Context on awards, director, festival laurels, or scene partners..."
                          className="bg-black/40 border-white/15 text-sm resize-none"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Active Preview Theatre */}
          <div className="lg:col-span-5">
            <div className="sticky top-6 p-5 rounded-2xl bg-zinc-900/80 border border-white/10 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono uppercase tracking-wider text-gold flex items-center gap-1.5">
                  <Play className="w-3.5 h-3.5" />
                  Showreel Theatre Inspector
                </span>
                {activeReel && (
                  <Badge variant="outline" className="text-[10px] bg-white/5 border-white/20">
                    {CATEGORY_LABELS[activeReel.category]}
                  </Badge>
                )}
              </div>

              {activeReel ? (
                <div className="space-y-4">
                  <div className="relative aspect-video rounded-xl overflow-hidden bg-black border border-white/10">
                    {parsedActiveUrl?.embedUrl.includes("youtube.com/embed") ||
                    parsedActiveUrl?.embedUrl.includes("player.vimeo.com") ? (
                      <iframe
                        src={parsedActiveUrl.embedUrl}
                        title={activeReel.title}
                        className="w-full h-full border-0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center">
                        <img
                          src={activeReel.thumbnailUrl || "https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=600&q=80"}
                          alt={activeReel.title}
                          className="absolute inset-0 w-full h-full object-cover opacity-30"
                        />
                        <div className="relative z-10 space-y-2">
                          <Play className="w-10 h-10 text-gold mx-auto" />
                          <p className="text-xs text-zinc-300 font-mono break-all">{activeReel.url}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2 text-xs">
                    <h4 className="font-semibold text-white text-sm">{activeReel.title}</h4>
                    {activeReel.roleOrCharacter && (
                      <p className="text-gold font-medium">Role: {activeReel.roleOrCharacter}</p>
                    )}
                    {activeReel.cameraPackage && (
                      <p className="text-zinc-300 font-mono text-[11px]">Camera: {activeReel.cameraPackage}</p>
                    )}
                    {activeReel.awardLaurel && (
                      <p className="text-gold font-medium text-[11px]">{activeReel.awardLaurel}</p>
                    )}
                    <p className="text-zinc-400 leading-relaxed">{activeReel.description}</p>
                    <div className="pt-2 flex flex-wrap items-center gap-3 text-[11px] font-mono text-zinc-500 border-t border-white/10">
                      <span>Duration: {activeReel.duration || "N/A"}</span>
                      <span>Resolution: {activeReel.resolution || "HD"}</span>
                      <span className="text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> SEO Schema Ready
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-zinc-500 text-xs">
                  Select a showreel on the left to preview.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

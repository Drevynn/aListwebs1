import { HeadshotItem } from "@/types/portfolio";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Camera, 
  Plus, 
  Trash2, 
  Star, 
  Sparkles, 
  ExternalLink, 
  CheckCircle2,
  ZoomIn,
  Download,
  Image as ImageIcon
} from "lucide-react";
import { useState } from "react";

interface HeadshotsManagerProps {
  headshots: HeadshotItem[];
  onChange: (updated: HeadshotItem[]) => void;
}

const SHOT_TYPE_LABELS: Record<HeadshotItem['shotType'], string> = {
  theatrical: "Theatrical (Film / Drama)",
  commercial: "Commercial & Television",
  dramatic_closeup: "Dramatic Close-Up",
  full_body: "Full Body / Character",
  live_stage: "Live Stage / In Action",
  editorial: "Editorial / Press Kit",
};

export default function HeadshotsManager({ headshots, onChange }: HeadshotsManagerProps) {
  const [zoomedImage, setZoomedImage] = useState<HeadshotItem | null>(null);

  const addHeadshot = () => {
    const newHeadshot: HeadshotItem = {
      id: `hs-${Date.now()}`,
      imageUrl: "https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?auto=format&fit=crop&w=1200&q=85",
      shotType: "theatrical",
      resolution: "300 DPI 4K Print-Ready",
      photographerCredit: "Studio Photography NYC",
      year: new Date().getFullYear().toString(),
      isPrimary: headshots.length === 0,
      caption: "Primary Theatrical Casting Headshot",
    };
    onChange([...headshots, newHeadshot]);
  };

  const updateHeadshot = (id: string, updates: Partial<HeadshotItem>) => {
    onChange(headshots.map((h) => (h.id === id ? { ...h, ...updates } : h)));
  };

  const setAsPrimary = (id: string) => {
    onChange(headshots.map((h) => ({ ...h, isPrimary: h.id === id })));
  };

  const removeHeadshot = (id: string) => {
    const remaining = headshots.filter((h) => h.id !== id);
    // If the removed one was primary and there are remaining items, make first primary
    if (remaining.length > 0 && !remaining.some((h) => h.isPrimary)) {
      remaining[0].isPrimary = true;
    }
    onChange(remaining);
  };

  return (
    <div className="space-y-8">
      {/* Header & Add Button */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl bg-zinc-900/60 border border-white/10">
        <div>
          <h3 className="font-display font-bold text-lg text-white flex items-center gap-2">
            <Camera className="w-5 h-5 text-gold" />
            Headshots & Press Photography (Schema.org/ImageObject)
          </h3>
          <p className="text-xs text-muted-foreground mt-1 max-w-xl">
            High-res casting dossiers and editorial press photos. Mapped to Google Image licensing metadata, photographer attribution, and knowledge panel primaries.
          </p>
        </div>
        <Button onClick={addHeadshot} variant="hero" size="sm" className="rounded-xl shrink-0">
          <Plus className="w-4 h-4 mr-1.5" />
          Add Headshot
        </Button>
      </div>

      {headshots.length === 0 ? (
        <div className="py-16 text-center border border-dashed border-white/10 rounded-2xl p-6 bg-black/20">
          <Camera className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
          <h4 className="text-base font-semibold text-zinc-300">No headshots added yet</h4>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto mt-1 mb-4">
            Casting directors review hundreds of headshots daily. Ensure high-resolution (300 DPI) images with photographer credits are provided.
          </p>
          <Button onClick={addHeadshot} variant="outline" size="sm" className="border-white/20">
            <Plus className="w-4 h-4 mr-1" /> Add Primary Headshot
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {headshots.map((item, index) => (
            <div
              key={item.id}
              className={`p-5 rounded-2xl border transition-all flex flex-col justify-between ${
                item.isPrimary
                  ? "bg-zinc-900/90 border-gold/60 shadow-lg shadow-gold/10"
                  : "bg-zinc-900/40 border-white/10 hover:border-white/20"
              }`}
            >
              <div className="space-y-4">
                {/* Image & Primary Indicator */}
                <div className="relative aspect-[4/5] rounded-xl overflow-hidden bg-black border border-white/10 group">
                  <img
                    src={item.imageUrl}
                    alt={item.caption || "Headshot"}
                    className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-4 flex flex-col justify-between">
                    <div className="flex justify-between items-start">
                      <Badge className="bg-black/60 backdrop-blur-md border-white/20 text-[10px]">
                        {item.resolution || "300 DPI"}
                      </Badge>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => setZoomedImage(item)}
                        className="h-8 w-8 rounded-full bg-black/60 text-white hover:bg-black"
                      >
                        <ZoomIn className="w-4 h-4" />
                      </Button>
                    </div>

                    <p className="text-xs text-zinc-300 font-mono">
                      {item.photographerCredit ? `Photo: ${item.photographerCredit}` : "Photo Credit Unspecified"}
                    </p>
                  </div>

                  {item.isPrimary && (
                    <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-gold text-black font-semibold text-xs flex items-center gap-1 shadow-md">
                      <Star className="w-3 h-3 fill-black" /> Primary Knowledge Card
                    </div>
                  )}
                </div>

                {/* Meta Inputs */}
                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-xs font-mono uppercase tracking-wider text-zinc-300">
                      High-Resolution Image URL *
                    </label>
                    <Input
                      value={item.imageUrl}
                      onChange={(e) => updateHeadshot(item.id, { imageUrl: e.target.value })}
                      placeholder="https://..."
                      className="bg-black/40 border-white/15 text-xs font-mono"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-xs font-mono uppercase tracking-wider text-zinc-300">
                        Shot Type
                      </label>
                      <select
                        value={item.shotType}
                        onChange={(e) => updateHeadshot(item.id, { shotType: e.target.value as HeadshotItem['shotType'] })}
                        className="w-full bg-black/40 border border-white/15 rounded-xl px-2.5 py-2 text-xs text-white focus:outline-none focus:border-gold"
                      >
                        <option value="theatrical">Theatrical (Drama/Film)</option>
                        <option value="commercial">Commercial & TV</option>
                        <option value="dramatic_closeup">Dramatic Close-Up</option>
                        <option value="full_body">Full Body / Wardrobe</option>
                        <option value="live_stage">Live Stage / Gig</option>
                        <option value="editorial">Editorial / Press</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-mono uppercase tracking-wider text-zinc-300">
                        Resolution Tag
                      </label>
                      <Input
                        value={item.resolution || ""}
                        onChange={(e) => updateHeadshot(item.id, { resolution: e.target.value })}
                        placeholder="300 DPI 4K Master"
                        className="bg-black/40 border-white/15 text-xs"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div className="col-span-2 space-y-1">
                      <label className="text-xs font-mono uppercase tracking-wider text-zinc-300">
                        Photographer Credit (Schema.org/author)
                      </label>
                      <Input
                        value={item.photographerCredit || ""}
                        onChange={(e) => updateHeadshot(item.id, { photographerCredit: e.target.value })}
                        placeholder="e.g. Elena Rostova Studio"
                        className="bg-black/40 border-white/15 text-xs"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-mono uppercase tracking-wider text-zinc-300">
                        Year Taken
                      </label>
                      <Input
                        value={item.year || ""}
                        onChange={(e) => updateHeadshot(item.id, { year: e.target.value })}
                        placeholder="2026"
                        className="bg-black/40 border-white/15 text-xs font-mono"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-mono uppercase tracking-wider text-zinc-300">
                      Alt Caption / Casting Dossier Note
                    </label>
                    <Input
                      value={item.caption || ""}
                      onChange={(e) => updateHeadshot(item.id, { caption: e.target.value })}
                      placeholder="e.g. Lead Dramatic Look - Studio Lighting"
                      className="bg-black/40 border-white/15 text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 mt-4 border-t border-white/10 flex items-center justify-between">
                {!item.isPrimary ? (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setAsPrimary(item.id)}
                    className="text-xs text-zinc-400 hover:text-gold"
                  >
                    <Star className="w-3.5 h-3.5 mr-1" /> Make Primary
                  </Button>
                ) : (
                  <span className="text-xs text-gold flex items-center gap-1 font-mono">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Primary Representative
                  </span>
                )}

                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeHeadshot(item.id)}
                  className="text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10 h-8 px-2"
                >
                  <Trash2 className="w-3.5 h-3.5 mr-1" /> Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Zoom Lightbox Modal */}
      {zoomedImage && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setZoomedImage(null)}
        >
          <div
            className="max-w-3xl w-full bg-zinc-900 border border-white/20 rounded-2xl overflow-hidden shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative aspect-[4/5] max-h-[70vh] bg-black">
              <img
                src={zoomedImage.imageUrl}
                alt={zoomedImage.caption || "Full resolution headshot"}
                className="w-full h-full object-contain"
              />
            </div>
            <div className="p-4 flex items-center justify-between bg-zinc-950 border-t border-white/10">
              <div>
                <p className="text-sm font-semibold text-white">{zoomedImage.caption || "High Resolution Headshot"}</p>
                <p className="text-xs text-zinc-400 font-mono">
                  {zoomedImage.photographerCredit && `Photo by ${zoomedImage.photographerCredit} • `}
                  {zoomedImage.resolution || "300 DPI Print-Ready"}
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(zoomedImage.imageUrl, "_blank")}
                  className="text-xs border-white/20"
                >
                  <Download className="w-3.5 h-3.5 mr-1" /> Full Asset
                </Button>
                <Button
                  variant="hero"
                  size="sm"
                  onClick={() => setZoomedImage(null)}
                  className="text-xs"
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

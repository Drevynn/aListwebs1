import React, { useState, useRef, useMemo } from "react";
import { ShowreelItem } from "@/types/portfolio";
import { parseVideoUrl } from "@/lib/seoSchemaGenerator";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Film,
  Play,
  GripVertical,
  Upload,
  Sparkles,
  Lock,
  Clock,
  Video,
  Award,
  Clapperboard,
  Maximize2,
  X,
  ChevronLeft,
  ChevronRight,
  Copy,
  Check,
  Search,
  SlidersHorizontal,
  MoveUp,
  MoveDown,
  Camera,
  User,
  Shield,
  Layers
} from "lucide-react";
import { toast } from "sonner";

interface ShowreelGalleryProps {
  showreels: ShowreelItem[];
  onReorder?: (newOrder: ShowreelItem[]) => void;
  onUpdateReel?: (id: string, updates: Partial<ShowreelItem>) => void;
  onSelectReel?: (reel: ShowreelItem) => void;
  editable?: boolean;
  className?: string;
  defaultPerspective?: "all" | "actor" | "filmmaker";
}

const CATEGORY_META: Record<
  ShowreelItem["category"],
  { label: string; group: "actor" | "filmmaker" | "all"; color: string }
> = {
  dramatic: { label: "Dramatic Screen Reel", group: "actor", color: "text-amber-400 bg-amber-500/10 border-amber-500/20" },
  comedic: { label: "Comedic Monologue & Scene", group: "actor", color: "text-yellow-400 bg-yellow-500/10 border-yellow-500/20" },
  commercial: { label: "Commercial & VO", group: "actor", color: "text-blue-400 bg-blue-500/10 border-blue-500/20" },
  live_performance: { label: "Live Stage / Concert", group: "all", color: "text-purple-400 bg-purple-500/10 border-purple-500/20" },
  music_video: { label: "Cinematic Music Video", group: "filmmaker", color: "text-rose-400 bg-rose-500/10 border-rose-500/20" },
  stunt: { label: "Stunt & Combat Action", group: "actor", color: "text-orange-400 bg-orange-500/10 border-orange-500/20" },
  voiceover: { label: "Voiceover & Animation", group: "actor", color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" },
  cinematography: { label: "Cinematography (DP)", group: "filmmaker", color: "text-gold bg-gold/10 border-gold/20" },
  lighting_gaffer: { label: "Gaffer & Lighting DMX", group: "filmmaker", color: "text-amber-300 bg-amber-400/10 border-amber-400/20" },
  grip_rigging: { label: "Key Grip & Crane Rigging", group: "filmmaker", color: "text-zinc-300 bg-zinc-700/20 border-zinc-500/20" },
  sound_mix: { label: "Production Sound & Mix", group: "filmmaker", color: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20" },
  directing: { label: "Directing Anthology", group: "filmmaker", color: "text-red-400 bg-red-500/10 border-red-500/20" },
  editing_color: { label: "Editorial & Color Grade", group: "filmmaker", color: "text-indigo-400 bg-indigo-500/10 border-indigo-500/20" },
  vfx_breakdown: { label: "VFX & CGI Breakdown", group: "filmmaker", color: "text-teal-400 bg-teal-500/10 border-teal-500/20" },
};

export const ShowreelGallery: React.FC<ShowreelGalleryProps> = ({
  showreels,
  onReorder,
  onUpdateReel,
  onSelectReel,
  editable = false,
  className = "",
  defaultPerspective = "all",
}) => {
  const [activeReelIndex, setActiveReelIndex] = useState<number | null>(null);
  const [isTheaterOpen, setIsTheaterOpen] = useState(false);
  const [perspective, setPerspective] = useState<"all" | "actor" | "filmmaker">(defaultPerspective);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Drag and drop reordering states
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [dragHoveringFileId, setDragHoveringFileId] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [targetUploadId, setTargetUploadId] = useState<string | null>(null);

  // Filtered reels based on search, perspective, and category
  const filteredReels = useMemo(() => {
    return showreels.filter((reel) => {
      const meta = CATEGORY_META[reel.category] || { group: "all" };
      
      // Perspective filter
      if (perspective === "actor" && meta.group !== "actor" && meta.group !== "all") {
        return false;
      }
      if (perspective === "filmmaker" && meta.group !== "filmmaker" && meta.group !== "all") {
        return false;
      }

      // Category filter
      if (selectedCategory !== "all" && reel.category !== selectedCategory) {
        return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchTitle = reel.title.toLowerCase().includes(query);
        const matchRole = reel.roleOrCharacter?.toLowerCase().includes(query);
        const matchDesc = reel.description?.toLowerCase().includes(query);
        const matchCamera = reel.cameraPackage?.toLowerCase().includes(query);
        const matchAward = reel.awardLaurel?.toLowerCase().includes(query);
        return matchTitle || matchRole || matchDesc || matchCamera || matchAward;
      }

      return true;
    });
  }, [showreels, perspective, selectedCategory, searchQuery]);

  // Active playing reel in theater modal
  const activeTheaterReel = activeReelIndex !== null ? showreels[activeReelIndex] : null;
  const parsedVideo = activeTheaterReel ? parseVideoUrl(activeTheaterReel.url) : null;

  // Handle Drag Reorder events
  const handleDragStart = (e: React.DragEvent, index: number) => {
    if (!editable) return;
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = "move";
    // Set transparent image or drag data
    e.dataTransfer.setData("text/plain", `${index}`);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (!editable || draggedIndex === null || draggedIndex === index) return;
    setDragOverIndex(index);
    e.dataTransfer.dropEffect = "move";
  };

  const handleDragLeave = (_e: React.DragEvent, index: number) => {
    if (dragOverIndex === index) {
      setDragOverIndex(null);
    }
  };

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    if (!editable || draggedIndex === null) return;

    if (draggedIndex !== targetIndex && onReorder) {
      const newItems = [...showreels];
      const [movedItem] = newItems.splice(draggedIndex, 1);
      newItems.splice(targetIndex, 0, movedItem);

      // Update explicit order field
      const orderedItems = newItems.map((item, idx) => ({
        ...item,
        order: idx + 1,
      }));

      onReorder(orderedItems);
      toast.success(`Reordered "${movedItem.title}" to position #${targetIndex + 1}`);
    }

    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  // Keyboard Reordering Fallback for Accessibility
  const moveReel = (currentIndex: number, direction: "up" | "down") => {
    if (!editable || !onReorder) return;
    const targetIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= showreels.length) return;

    const newItems = [...showreels];
    const [movedItem] = newItems.splice(currentIndex, 1);
    newItems.splice(targetIndex, 0, movedItem);

    const orderedItems = newItems.map((item, idx) => ({
      ...item,
      order: idx + 1,
    }));

    onReorder(orderedItems);
    toast.success(`Moved "${movedItem.title}" to position #${targetIndex + 1}`);
  };

  // Media Drag-and-Drop Thumbnail Upload onto Card
  const handleMediaDragOver = (e: React.DragEvent, reelId: string) => {
    if (e.dataTransfer.types.includes("Files")) {
      e.preventDefault();
      e.stopPropagation();
      setDragHoveringFileId(reelId);
    }
  };

  const handleMediaDragLeave = (e: React.DragEvent, reelId: string) => {
    if (dragHoveringFileId === reelId) {
      setDragHoveringFileId(null);
    }
  };

  const handleMediaDrop = (e: React.DragEvent, reelId: string) => {
    e.preventDefault();
    e.stopPropagation();
    setDragHoveringFileId(null);

    const files = e.dataTransfer.files;
    if (files && files[0] && files[0].type.startsWith("image/")) {
      handleThumbnailFile(files[0], reelId);
    } else {
      toast.error("Please drop an image file (PNG, JPG, WebP) for the video thumbnail.");
    }
  };

  const handleThumbnailFile = (file: File, reelId: string) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl && onUpdateReel) {
        onUpdateReel(reelId, { thumbnailUrl: dataUrl });
        toast.success("Updated high-definition showreel thumbnail!");
      }
    };
    reader.readAsDataURL(file);
  };

  const triggerFileInput = (reelId: string) => {
    setTargetUploadId(reelId);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
      fileInputRef.current.click();
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && targetUploadId) {
      handleThumbnailFile(file, targetUploadId);
    }
  };

  // Open Theater Lightbox
  const openTheater = (reel: ShowreelItem) => {
    const index = showreels.findIndex((r) => r.id === reel.id);
    setActiveReelIndex(index !== -1 ? index : 0);
    setIsTheaterOpen(true);
    if (onSelectReel) {
      onSelectReel(reel);
    }
  };

  const closeTheater = () => {
    setIsTheaterOpen(false);
  };

  const nextTheaterReel = () => {
    if (activeReelIndex !== null && activeReelIndex < showreels.length - 1) {
      setActiveReelIndex(activeReelIndex + 1);
    } else {
      setActiveReelIndex(0);
    }
  };

  const prevTheaterReel = () => {
    if (activeReelIndex !== null && activeReelIndex > 0) {
      setActiveReelIndex(activeReelIndex - 1);
    } else {
      setActiveReelIndex(showreels.length - 1);
    }
  };

  const copyScreenerLink = (reel: ShowreelItem) => {
    navigator.clipboard.writeText(reel.url);
    setCopiedId(reel.id);
    toast.success("Copied showreel screener link to clipboard!");
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div id="showreel-gallery-container" className={`space-y-6 ${className}`}>
      {/* Hidden file input for thumbnail upload */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileInputChange}
        accept="image/*"
        className="hidden"
      />

      {/* Top Filter & Mode Ribbon */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-5 rounded-3xl bg-zinc-950/70 border border-border/50 backdrop-blur-md shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Film className="w-5 h-5 text-gold animate-pulse" />
            <h3 className="font-display font-bold text-lg text-foreground tracking-tight flex items-center gap-2">
              Cinema Showreel Gallery
              <Badge variant="outline" className="border-gold/30 text-gold text-[10px] font-mono">
                16:9 DCI ProRes
              </Badge>
            </h3>
          </div>
          <p className="text-xs text-muted-foreground">
            Curated theatrical casting reels, directing anthologies, and cinematography camera packages.
            {editable && " Drag items to prioritize order for casting directors."}
          </p>
        </div>

        {/* Perspective switcher (All / Actor / Filmmaker) */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <div className="bg-background/80 border border-border/60 p-1 rounded-2xl flex items-center gap-1 shadow-inner">
            <button
              onClick={() => setPerspective("all")}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                perspective === "all"
                  ? "bg-gold text-zinc-950 font-bold shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              All Works ({showreels.length})
            </button>
            <button
              onClick={() => setPerspective("actor")}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                perspective === "actor"
                  ? "bg-gold text-zinc-950 font-bold shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
              }`}
            >
              <User className="w-3.5 h-3.5" />
              Actor Reels
            </button>
            <button
              onClick={() => setPerspective("filmmaker")}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                perspective === "filmmaker"
                  ? "bg-gold text-zinc-950 font-bold shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
              }`}
            >
              <Camera className="w-3.5 h-3.5" />
              Filmmaker & Crew
            </button>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" />
          <Input
            type="text"
            placeholder="Search showreels by character, role, camera package, or award..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-10 bg-card/60 border-border/60 text-xs rounded-xl focus:border-gold"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Category Pills Selector */}
        <div className="flex items-center gap-1.5 overflow-x-auto max-w-full pb-1 sm:pb-0 scrollbar-none">
          <button
            onClick={() => setSelectedCategory("all")}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
              selectedCategory === "all"
                ? "bg-muted text-foreground font-bold border border-border"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
            }`}
          >
            All Categories
          </button>
          {["dramatic", "comedic", "cinematography", "directing", "stunt", "commercial"].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-2.5 py-1.5 rounded-xl text-xs whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? "bg-gold/20 text-gold border border-gold/40 font-bold"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/30"
              }`}
            >
              {CATEGORY_META[cat as ShowreelItem["category"]]?.label.split(" ")[0]}
            </button>
          ))}
        </div>
      </div>

      {/* Reordering Instructions Banner (when editable) */}
      {editable && (
        <div className="text-[11px] text-muted-foreground bg-muted/20 border border-border/40 px-4 py-2.5 rounded-2xl flex items-center justify-between gap-2">
          <span className="flex items-center gap-2">
            <GripVertical className="w-3.5 h-3.5 text-gold shrink-0" />
            <span>
              <strong>Drag & Drop Media Priority:</strong> Drag any card by its handle or thumbnail to reorder. Drop an image directly on any reel to replace its 4K thumbnail.
            </span>
          </span>
          <span className="font-mono text-gold font-semibold shrink-0">
            {showreels.length} Reels in Master Dossier
          </span>
        </div>
      )}

      {/* Showreels Gallery Grid */}
      {filteredReels.length === 0 ? (
        <div className="py-20 text-center border border-dashed border-border/60 rounded-3xl bg-card/20 p-8 space-y-3">
          <Clapperboard className="w-12 h-12 text-muted-foreground mx-auto stroke-1" />
          <h4 className="text-base font-bold text-foreground">No showreels match your selection</h4>
          <p className="text-xs text-muted-foreground max-w-md mx-auto">
            {searchQuery
              ? `No results found for "${searchQuery}". Clear your search query or reset category filters.`
              : "No reels in this category yet. Add dramatic audition clips or cinematographer reels to showcase your craft."}
          </p>
          {(searchQuery || selectedCategory !== "all") && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("all");
              }}
              className="mt-2 text-xs rounded-xl"
            >
              Reset Filters
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredReels.map((reel, displayIndex) => {
            const masterIndex = showreels.findIndex((r) => r.id === reel.id);
            const isDraggingThis = draggedIndex === masterIndex;
            const isTargeted = dragOverIndex === masterIndex;
            const isFileHovering = dragHoveringFileId === reel.id;
            const catMeta = CATEGORY_META[reel.category] || {
              label: reel.category,
              color: "text-zinc-300 bg-zinc-800/40",
            };

            const defaultThumb =
              reel.thumbnailUrl ||
              "https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?auto=format&fit=crop&w=800&q=80";

            return (
              <div
                key={reel.id}
                draggable={editable}
                onDragStart={(e) => handleDragStart(e, masterIndex)}
                onDragOver={(e) => {
                  handleDragOver(e, masterIndex);
                  handleMediaDragOver(e, reel.id);
                }}
                onDragLeave={(e) => {
                  handleDragLeave(e, masterIndex);
                  handleMediaDragLeave(e, reel.id);
                }}
                onDrop={(e) => {
                  if (e.dataTransfer.types.includes("Files")) {
                    handleMediaDrop(e, reel.id);
                  } else {
                    handleDrop(e, masterIndex);
                  }
                }}
                onDragEnd={handleDragEnd}
                className={`group relative rounded-3xl border transition-all duration-300 flex flex-col justify-between overflow-hidden backdrop-blur-xl ${
                  isDraggingThis
                    ? "opacity-40 scale-95 border-dashed border-gold"
                    : isTargeted
                    ? "border-gold shadow-2xl shadow-gold/20 scale-[1.02] bg-gold/5"
                    : isFileHovering
                    ? "border-emerald-500 shadow-2xl shadow-emerald-500/20 bg-emerald-500/10"
                    : "bg-card/70 border-border/50 hover:border-gold/50 hover:shadow-2xl hover:shadow-gold/5"
                }`}
              >
                {/* File Drop Overlay Warning */}
                {isFileHovering && (
                  <div className="absolute inset-0 z-30 bg-emerald-950/80 backdrop-blur-md flex flex-col items-center justify-center text-center p-4 space-y-2 border-2 border-emerald-400 rounded-3xl animate-in fade-in duration-200">
                    <Upload className="w-8 h-8 text-emerald-400 animate-bounce" />
                    <p className="text-sm font-bold text-white">Drop to Replace 4K Thumbnail</p>
                    <span className="text-[11px] text-emerald-300">Accepts PNG, JPG, WebP</span>
                  </div>
                )}

                {/* Card Top / Thumbnail Container */}
                <div>
                  <div className="relative aspect-video w-full overflow-hidden bg-zinc-950">
                    {/* Thumbnail Image */}
                    <img
                      src={defaultThumb}
                      alt={reel.title}
                      className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                      loading="lazy"
                    />

                    {/* Dark gradient vignette */}
                    <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent opacity-90" />

                    {/* Top Status Bar: Order Badge + Private Status */}
                    <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10">
                      <div className="flex items-center gap-1.5">
                        <Badge
                          variant="outline"
                          className="bg-black/80 text-gold border-gold/40 font-mono text-[10px] font-bold backdrop-blur-md px-2 py-0.5"
                        >
                          #{masterIndex + 1} {masterIndex === 0 ? "Featured" : ""}
                        </Badge>
                        {reel.isPrivate && (
                          <Badge
                            variant="outline"
                            className="bg-red-500/20 text-red-300 border-red-500/30 text-[10px] font-mono backdrop-blur-md gap-1"
                          >
                            <Lock className="w-2.5 h-2.5" /> Private Screener
                          </Badge>
                        )}
                      </div>

                      <div className="flex items-center gap-1">
                        {reel.resolution && (
                          <Badge
                            variant="outline"
                            className="bg-black/70 text-zinc-300 border-white/20 text-[9px] font-mono backdrop-blur-md"
                          >
                            {reel.resolution}
                          </Badge>
                        )}
                        {reel.duration && (
                          <span className="bg-black/80 text-white font-mono text-[10px] px-2 py-0.5 rounded-md backdrop-blur-md flex items-center gap-1">
                            <Clock className="w-2.5 h-2.5 text-gold" />
                            {reel.duration}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Play Button Overlay */}
                    <div
                      onClick={() => openTheater(reel)}
                      className="absolute inset-0 flex items-center justify-center cursor-pointer group/play"
                    >
                      <div className="w-13 h-13 rounded-full bg-gold/90 text-zinc-950 flex items-center justify-center shadow-xl shadow-gold/30 transition-all duration-300 group-hover/play:scale-115 group-hover/play:bg-gold">
                        <Play className="w-6 h-6 ml-0.5 fill-zinc-950" />
                      </div>
                    </div>

                    {/* Award Laurel Ribbon */}
                    {reel.awardLaurel && (
                      <div className="absolute bottom-2.5 left-3 right-3 flex items-center gap-1.5 bg-black/80 border border-gold/30 px-2.5 py-1 rounded-lg backdrop-blur-md">
                        <Award className="w-3.5 h-3.5 text-gold shrink-0" />
                        <span className="text-[10px] font-mono text-gold truncate font-semibold">
                          {reel.awardLaurel}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Body Content */}
                  <div className="p-5 space-y-3">
                    <div className="space-y-1">
                      <div className="flex items-center justify-between gap-2">
                        <Badge variant="outline" className={`text-[10px] font-mono px-2 py-0.5 ${catMeta.color}`}>
                          {catMeta.label}
                        </Badge>
                        {reel.uploadDate && (
                          <span className="text-[10px] font-mono text-muted-foreground">
                            {reel.uploadDate}
                          </span>
                        )}
                      </div>

                      <h4 className="font-display font-bold text-base text-foreground group-hover:text-gold transition-colors leading-snug line-clamp-1">
                        {reel.title}
                      </h4>
                    </div>

                    {/* Character / Role or Camera Package Metadata */}
                    <div className="space-y-1.5 text-xs">
                      {reel.roleOrCharacter && (
                        <div className="flex items-center gap-1.5 text-foreground/90 font-medium">
                          <User className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          <span className="truncate">
                            <strong className="text-muted-foreground">Role:</strong> {reel.roleOrCharacter}
                          </span>
                        </div>
                      )}

                      {reel.cameraPackage && (
                        <div className="flex items-center gap-1.5 text-foreground/90 font-mono text-[11px]">
                          <Camera className="w-3.5 h-3.5 text-gold shrink-0" />
                          <span className="truncate">
                            <strong className="text-muted-foreground">Package:</strong> {reel.cameraPackage}
                          </span>
                        </div>
                      )}

                      {reel.scenePartner && (
                        <div className="text-[11px] text-muted-foreground">
                          Scene partner: <span className="text-foreground">{reel.scenePartner}</span>
                        </div>
                      )}

                      {reel.description && (
                        <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed pt-1">
                          {reel.description}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Footer Controls / Drag Handlers */}
                <div className="p-4 pt-0 border-t border-border/40 mt-3 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => openTheater(reel)}
                      className="text-xs h-8 px-2.5 rounded-xl text-gold hover:bg-gold/10 font-semibold"
                    >
                      <Play className="w-3 h-3 mr-1 fill-current" />
                      Watch Reel
                    </Button>

                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => copyScreenerLink(reel)}
                      className="text-xs h-8 px-2 rounded-xl text-muted-foreground hover:text-foreground"
                      title="Copy Screener Link"
                    >
                      {copiedId === reel.id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </Button>

                    {editable && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => triggerFileInput(reel.id)}
                        className="text-xs h-8 px-2 rounded-xl text-muted-foreground hover:text-gold"
                        title="Upload Custom 4K Thumbnail"
                      >
                        <Upload className="w-3.5 h-3.5" />
                      </Button>
                    )}
                  </div>

                  {/* Reordering Controls (Only in Edit Mode) */}
                  {editable && (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => moveReel(masterIndex, "up")}
                        disabled={masterIndex === 0}
                        className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 disabled:opacity-30 disabled:hover:bg-transparent"
                        title="Move Up in Priority"
                        aria-label={`Move ${reel.title} up`}
                      >
                        <MoveUp className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => moveReel(masterIndex, "down")}
                        disabled={masterIndex === showreels.length - 1}
                        className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 disabled:opacity-30 disabled:hover:bg-transparent"
                        title="Move Down in Priority"
                        aria-label={`Move ${reel.title} down`}
                      >
                        <MoveDown className="w-3.5 h-3.5" />
                      </button>

                      <div
                        className="cursor-grab active:cursor-grabbing p-1.5 rounded-lg text-gold hover:bg-gold/10 ml-0.5"
                        title="Drag to reorder"
                      >
                        <GripVertical className="w-4 h-4" />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* CINEMATIC THEATER LIGHTBOX MODAL */}
      {isTheaterOpen && activeTheaterReel && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-2xl flex items-center justify-center p-4 sm:p-6 lg:p-10 animate-in fade-in duration-300"
        >
          {/* Close button */}
          <button
            onClick={closeTheater}
            className="absolute top-4 right-4 z-50 w-11 h-11 rounded-full bg-zinc-900/80 border border-white/15 text-white flex items-center justify-center hover:bg-gold hover:text-zinc-950 transition-all shadow-xl"
            aria-label="Close Theater Player"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Navigation Prev/Next */}
          <button
            onClick={prevTheaterReel}
            className="hidden sm:flex absolute left-4 top-1/2 -translate-y-1/2 z-50 w-12 h-12 rounded-full bg-zinc-900/80 border border-white/15 text-white items-center justify-center hover:bg-gold hover:text-zinc-950 transition-all shadow-xl"
            aria-label="Previous Showreel"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          <button
            onClick={nextTheaterReel}
            className="hidden sm:flex absolute right-4 top-1/2 -translate-y-1/2 z-50 w-12 h-12 rounded-full bg-zinc-900/80 border border-white/15 text-white items-center justify-center hover:bg-gold hover:text-zinc-950 transition-all shadow-xl"
            aria-label="Next Showreel"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          {/* Player Container */}
          <div className="w-full max-w-5xl max-h-[92vh] flex flex-col rounded-3xl bg-zinc-950 border border-white/15 overflow-hidden shadow-2xl">
            {/* Video Viewport (16:9) */}
            <div className="relative aspect-video w-full bg-black flex items-center justify-center">
              {parsedVideo?.embedUrl.includes("youtube.com/embed") ||
              parsedVideo?.embedUrl.includes("player.vimeo.com") ? (
                <iframe
                  src={`${parsedVideo.embedUrl}?autoplay=1&rel=0`}
                  title={activeTheaterReel.title}
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : activeTheaterReel.url.endsWith(".mp4") || activeTheaterReel.url.endsWith(".webm") ? (
                <video
                  src={activeTheaterReel.url}
                  controls
                  autoPlay
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="text-center p-8 space-y-4">
                  <Film className="w-16 h-16 text-gold mx-auto stroke-1" />
                  <div className="space-y-1">
                    <h3 className="text-lg font-bold text-white">{activeTheaterReel.title}</h3>
                    <p className="text-xs text-zinc-400">External High-Definition Stream</p>
                  </div>
                  <Button
                    onClick={() => window.open(activeTheaterReel.url, "_blank")}
                    className="bg-gold text-zinc-950 font-bold rounded-2xl"
                  >
                    Open Source Video Link
                  </Button>
                </div>
              )}
            </div>

            {/* Video Details & Technical Specs Drawer */}
            <div className="p-6 bg-zinc-900/90 border-t border-white/10 flex flex-col sm:flex-row items-start justify-between gap-6 overflow-y-auto">
              <div className="space-y-2 max-w-2xl">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge className="bg-gold text-zinc-950 font-bold font-mono text-xs">
                    Reel #{((activeReelIndex ?? 0) + 1)} of {showreels.length}
                  </Badge>
                  <Badge variant="outline" className="border-white/20 text-zinc-300 font-mono text-xs">
                    {CATEGORY_META[activeTheaterReel.category]?.label || activeTheaterReel.category}
                  </Badge>
                  {activeTheaterReel.duration && (
                    <Badge variant="outline" className="border-gold/30 text-gold font-mono text-xs">
                      {activeTheaterReel.duration}
                    </Badge>
                  )}
                  {activeTheaterReel.resolution && (
                    <Badge variant="outline" className="border-emerald-500/30 text-emerald-400 font-mono text-xs">
                      {activeTheaterReel.resolution}
                    </Badge>
                  )}
                </div>

                <h3 className="text-xl font-bold font-display text-white">
                  {activeTheaterReel.title}
                </h3>

                {activeTheaterReel.roleOrCharacter && (
                  <p className="text-sm font-semibold text-emerald-400">
                    Lead Role / Character: {activeTheaterReel.roleOrCharacter}
                  </p>
                )}

                {activeTheaterReel.cameraPackage && (
                  <p className="text-xs font-mono text-gold">
                    Camera & Optical Package: {activeTheaterReel.cameraPackage}
                  </p>
                )}

                {activeTheaterReel.description && (
                  <p className="text-xs text-zinc-300 leading-relaxed pt-1">
                    {activeTheaterReel.description}
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap sm:flex-col gap-2 shrink-0 w-full sm:w-auto justify-end">
                <Button
                  onClick={() => copyScreenerLink(activeTheaterReel)}
                  variant="outline"
                  size="sm"
                  className="rounded-xl border-white/20 text-xs hover:border-gold/50 text-white"
                >
                  <Copy className="w-3.5 h-3.5 mr-1.5" />
                  Copy Screener Link
                </Button>

                <Button
                  onClick={() => window.open(activeTheaterReel.url, "_blank")}
                  size="sm"
                  className="bg-gold hover:bg-gold/90 text-zinc-950 font-bold rounded-xl text-xs"
                >
                  Open in New Window
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShowreelGallery;

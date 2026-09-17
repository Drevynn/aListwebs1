import React, { useState, useEffect, useMemo } from "react";
import { ContentItem, ContentType, ContentStatus } from "@/types/cms";
import { CMSService } from "@/lib/cmsService";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import {
  FileText,
  Megaphone,
  Radio,
  Music,
  Globe,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Eye,
  Edit3,
  Trash2,
  Copy,
  LayoutGrid,
  List,
  Sparkles,
  ArrowUpDown,
  ExternalLink,
  Tag,
  Check,
  AlertTriangle,
  Send,
  Calendar,
  Share2,
  RefreshCw,
  FolderOpen
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import ContentEditorDialog from "./ContentEditorDialog";
import ContentPreviewModal from "./ContentPreviewModal";

interface CMSManagerProps {
  embedded?: boolean;
}

export default function CMSManager({ embedded = false }: CMSManagerProps) {
  const { user } = useAuth();
  const { toast } = useToast();

  const [items, setItems] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "views" | "title">("newest");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");

  // Selection for batch actions
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Dialog & Modal states
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ContentItem | null>(null);

  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewItem, setPreviewItem] = useState<ContentItem | null>(null);

  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<ContentItem | null>(null);
  const [isBatchDeleting, setIsBatchDeleting] = useState(false);

  // Load items on mount and user change
  const loadContent = React.useCallback(async () => {
    setLoading(true);
    try {
      const fetched = await CMSService.fetchItems(user?.uid);
      setItems(fetched);
    } catch (err) {
      console.error("Error loading CMS content:", err);
      toast({
        title: "Error Loading Content",
        description: "Failed to fetch content items.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [user?.uid, toast]);

  useEffect(() => {
    loadContent();
  }, [loadContent]);

  // Derived metrics
  const metrics = useMemo(() => {
    const total = items.length;
    const published = items.filter(i => i.status === "published").length;
    const drafts = items.filter(i => i.status === "draft").length;
    const scheduled = items.filter(i => i.status === "scheduled").length;
    const totalViews = items.reduce((acc, curr) => acc + (curr.views || 0), 0);

    return { total, published, drafts, scheduled, totalViews };
  }, [items]);

  // Filtered & Sorted items
  const filteredItems = useMemo(() => {
    return items
      .filter((item) => {
        // Type filter
        if (selectedType !== "all" && item.type !== selectedType) {
          return false;
        }
        // Status filter
        if (selectedStatus !== "all" && item.status !== selectedStatus) {
          return false;
        }
        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchTitle = item.title.toLowerCase().includes(q);
          const matchExcerpt = item.excerpt?.toLowerCase().includes(q);
          const matchCategory = item.category?.toLowerCase().includes(q);
          const matchAuthor = item.author?.toLowerCase().includes(q);
          const matchTags = item.tags?.some(t => t.toLowerCase().includes(q));
          if (!matchTitle && !matchExcerpt && !matchCategory && !matchAuthor && !matchTags) {
            return false;
          }
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === "newest") {
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
        }
        if (sortBy === "oldest") {
          return new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
        }
        if (sortBy === "views") {
          return (b.views || 0) - (a.views || 0);
        }
        if (sortBy === "title") {
          return a.title.localeCompare(b.title);
        }
        return 0;
      });
  }, [items, selectedType, selectedStatus, searchQuery, sortBy]);

  // Actions
  const handleSaveItem = async (itemToSave: ContentItem) => {
    const saved = await CMSService.saveItem(itemToSave, user?.uid);
    setItems(prev => {
      const idx = prev.findIndex(i => i.id === saved.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = saved;
        return next;
      }
      return [saved, ...prev];
    });
  };

  const handleTogglePublish = async (item: ContentItem, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const updated = await CMSService.togglePublish(item.id, user?.uid);
    if (updated) {
      setItems(prev => prev.map(i => i.id === updated.id ? updated : i));
      toast({
        title: updated.status === "published" ? "Content Published" : "Content Set to Draft",
        description: `"${updated.title}" is now ${updated.status}.`,
      });
    }
  };

  const handleDuplicate = async (item: ContentItem, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const dup = await CMSService.duplicateItem(item.id, user?.uid);
    if (dup) {
      setItems(prev => [dup, ...prev]);
      toast({
        title: "Content Duplicated",
        description: `Created copy "${dup.title}".`,
      });
    }
  };

  const handleDeletePrompt = (item: ContentItem, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setItemToDelete(item);
    setIsBatchDeleting(false);
    setDeleteConfirmOpen(true);
  };

  const handleBatchDeletePrompt = () => {
    if (selectedIds.length === 0) return;
    setIsBatchDeleting(true);
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (isBatchDeleting) {
      for (const id of selectedIds) {
        await CMSService.deleteItem(id, user?.uid);
      }
      setItems(prev => prev.filter(i => !selectedIds.includes(i.id)));
      setSelectedIds([]);
      toast({
        title: "Batch Deletion Complete",
        description: `Removed ${selectedIds.length} content items.`,
      });
    } else if (itemToDelete) {
      await CMSService.deleteItem(itemToDelete.id, user?.uid);
      setItems(prev => prev.filter(i => i.id !== itemToDelete.id));
      setSelectedIds(prev => prev.filter(id => id !== itemToDelete.id));
      toast({
        title: "Item Deleted",
        description: `"${itemToDelete.title}" has been deleted.`,
      });
    }
    setDeleteConfirmOpen(false);
    setItemToDelete(null);
  };

  const handleBatchPublish = async (statusToSet: ContentStatus) => {
    if (selectedIds.length === 0) return;
    const now = new Date().toISOString();
    const updatedList = [...items];

    for (const id of selectedIds) {
      const idx = updatedList.findIndex(i => i.id === id);
      if (idx >= 0) {
        const item = updatedList[idx];
        const updated: ContentItem = {
          ...item,
          status: statusToSet,
          updatedAt: now,
          publishedAt: statusToSet === "published" ? now : item.publishedAt,
        };
        await CMSService.saveItem(updated, user?.uid);
        updatedList[idx] = updated;
      }
    }

    setItems(updatedList);
    setSelectedIds([]);
    toast({
      title: "Batch Update Successful",
      description: `Updated status of ${selectedIds.length} items to ${statusToSet}.`,
    });
  };

  const handleSelectAllToggle = () => {
    if (selectedIds.length === filteredItems.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredItems.map(i => i.id));
    }
  };

  const handleToggleSelectId = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const openNewEditor = (defaultType: ContentType = "article") => {
    setEditingItem(null);
    setEditorOpen(true);
  };

  const openEditModal = (item: ContentItem, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setEditingItem(item);
    setEditorOpen(true);
  };

  const openPreview = (item: ContentItem, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setPreviewItem(item);
    setPreviewOpen(true);
  };

  const getTypeIcon = (type: ContentType) => {
    switch (type) {
      case "article": return <FileText className="w-3.5 h-3.5 text-emerald-400" />;
      case "announcement": return <Megaphone className="w-3.5 h-3.5 text-amber-400" />;
      case "event": return <Radio className="w-3.5 h-3.5 text-purple-400" />;
      case "media": return <Music className="w-3.5 h-3.5 text-cyan-400" />;
      case "page": return <Globe className="w-3.5 h-3.5 text-blue-400" />;
      default: return <FileText className="w-3.5 h-3.5 text-slate-400" />;
    }
  };

  return (
    <div className={`space-y-8 ${embedded ? "" : "max-w-7xl mx-auto py-6"}`}>
      {/* CMS Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-slate-900/90 via-black to-slate-950 p-6 md:p-8 rounded-3xl border border-glass-border shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gold/5 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        
        <div className="space-y-2 relative z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-gold/10 border border-gold/30 flex items-center justify-center text-gold">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <Badge variant="outline" className="bg-gold/10 border-gold/30 text-gold text-xs font-mono uppercase tracking-wider">
              Sovereign Publisher
            </Badge>
          </div>
          <h2 className="text-2xl sm:text-3xl font-display font-bold text-white tracking-tight">
            Content Management System (CMS)
          </h2>
          <p className="text-sm text-muted-foreground max-w-2xl leading-relaxed">
            Create, edit, schedule, and publish multimedia articles, tour dates, press releases, video showcases, and custom landing pages across your digital ecosystem.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 relative z-10">
          <Button
            onClick={() => openNewEditor("article")}
            className="bg-gold hover:bg-gold-light text-black font-bold text-xs rounded-full px-5 py-2.5 shadow-lg shadow-gold/20 flex items-center gap-2 transition-transform hover:scale-105"
          >
            <Plus className="w-4 h-4" />
            Create Content
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={loadContent}
            className="bg-white/5 border-white/10 hover:bg-white/10 text-slate-300 text-xs rounded-full"
            title="Refresh from Storage"
          >
            <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
            Sync
          </Button>
        </div>
      </div>

      {/* Overview Analytics / Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-card border-glass-border rounded-2xl p-5 hover:border-gold/30 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase text-muted-foreground tracking-wider">Total Content</span>
            <FolderOpen className="w-4 h-4 text-gold" />
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-bold text-white font-display">{metrics.total}</span>
            <span className="text-xs text-muted-foreground ml-2">items</span>
          </div>
          <div className="mt-2 text-[11px] text-muted-foreground">Articles, media, announcements & events</div>
        </Card>

        <Card className="bg-card border-glass-border rounded-2xl p-5 hover:border-emerald-500/30 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase text-emerald-400 tracking-wider">Published Live</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-bold text-white font-display">{metrics.published}</span>
            <span className="text-xs text-emerald-400/80 ml-2">
              ({metrics.total > 0 ? Math.round((metrics.published / metrics.total) * 100) : 0}%)
            </span>
          </div>
          <div className="mt-2 text-[11px] text-muted-foreground">Publicly readable on live sites</div>
        </Card>

        <Card className="bg-card border-glass-border rounded-2xl p-5 hover:border-amber-500/30 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase text-amber-400 tracking-wider">Drafts & Scheduled</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-bold text-white font-display">
              {metrics.drafts + metrics.scheduled}
            </span>
            <span className="text-xs text-amber-400/80 ml-2">in queue</span>
          </div>
          <div className="mt-2 text-[11px] text-muted-foreground">{metrics.drafts} drafts • {metrics.scheduled} scheduled</div>
        </Card>

        <Card className="bg-card border-glass-border rounded-2xl p-5 hover:border-cyan-500/30 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase text-cyan-400 tracking-wider">Total Engagement</span>
            <Eye className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-bold text-white font-display">
              {metrics.totalViews.toLocaleString()}
            </span>
            <span className="text-xs text-cyan-400/80 ml-2">views</span>
          </div>
          <div className="mt-2 text-[11px] text-muted-foreground">Aggregated reader impressions</div>
        </Card>
      </div>

      {/* Filter and Control Bar */}
      <div className="space-y-4 bg-slate-950/60 border border-glass-border rounded-3xl p-5 backdrop-blur-md">
        {/* Content Type Filter Pills */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/5 pb-4">
          <div className="flex flex-wrap items-center gap-1.5">
            <Button
              size="sm"
              variant={selectedType === "all" ? "default" : "ghost"}
              onClick={() => setSelectedType("all")}
              className={`rounded-full text-xs h-8 px-3.5 ${
                selectedType === "all" ? "bg-gold text-black font-semibold" : "text-muted-foreground hover:text-white"
              }`}
            >
              All Types ({items.length})
            </Button>
            <Button
              size="sm"
              variant={selectedType === "article" ? "default" : "ghost"}
              onClick={() => setSelectedType("article")}
              className={`rounded-full text-xs h-8 px-3.5 gap-1.5 ${
                selectedType === "article" ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40" : "text-muted-foreground hover:text-white"
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              Articles ({items.filter(i => i.type === "article").length})
            </Button>
            <Button
              size="sm"
              variant={selectedType === "announcement" ? "default" : "ghost"}
              onClick={() => setSelectedType("announcement")}
              className={`rounded-full text-xs h-8 px-3.5 gap-1.5 ${
                selectedType === "announcement" ? "bg-amber-500/20 text-amber-300 border border-amber-500/40" : "text-muted-foreground hover:text-white"
              }`}
            >
              <Megaphone className="w-3.5 h-3.5" />
              Announcements ({items.filter(i => i.type === "announcement").length})
            </Button>
            <Button
              size="sm"
              variant={selectedType === "event" ? "default" : "ghost"}
              onClick={() => setSelectedType("event")}
              className={`rounded-full text-xs h-8 px-3.5 gap-1.5 ${
                selectedType === "event" ? "bg-purple-500/20 text-purple-300 border border-purple-500/40" : "text-muted-foreground hover:text-white"
              }`}
            >
              <Radio className="w-3.5 h-3.5" />
              Tour & Events ({items.filter(i => i.type === "event").length})
            </Button>
            <Button
              size="sm"
              variant={selectedType === "media" ? "default" : "ghost"}
              onClick={() => setSelectedType("media")}
              className={`rounded-full text-xs h-8 px-3.5 gap-1.5 ${
                selectedType === "media" ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40" : "text-muted-foreground hover:text-white"
              }`}
            >
              <Music className="w-3.5 h-3.5" />
              Media Showcase ({items.filter(i => i.type === "media").length})
            </Button>
            <Button
              size="sm"
              variant={selectedType === "page" ? "default" : "ghost"}
              onClick={() => setSelectedType("page")}
              className={`rounded-full text-xs h-8 px-3.5 gap-1.5 ${
                selectedType === "page" ? "bg-blue-500/20 text-blue-300 border border-blue-500/40" : "text-muted-foreground hover:text-white"
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              Custom Pages ({items.filter(i => i.type === "page").length})
            </Button>
          </div>

          {/* View mode toggle */}
          <div className="flex items-center bg-white/5 p-1 rounded-xl border border-white/10">
            <Button
              size="sm"
              variant={viewMode === "grid" ? "secondary" : "ghost"}
              onClick={() => setViewMode("grid")}
              className="h-7 w-7 p-0"
              title="Grid View"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </Button>
            <Button
              size="sm"
              variant={viewMode === "table" ? "secondary" : "ghost"}
              onClick={() => setViewMode("table")}
              className="h-7 w-7 p-0"
              title="List View"
            >
              <List className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>

        {/* Search, Status Tabs, and Sort controls */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3 flex-1">
            {/* Search Input */}
            <div className="relative min-w-[240px] max-w-md flex-1">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search content by title, tag, or author..."
                className="pl-9 bg-white/5 border-white/10 text-xs text-white placeholder:text-muted-foreground rounded-xl"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-white text-xs"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Status Tabs */}
            <div className="flex items-center bg-white/5 p-1 rounded-xl border border-white/10">
              <button
                onClick={() => setSelectedStatus("all")}
                className={`text-[11px] px-3 py-1 rounded-lg transition-all ${
                  selectedStatus === "all" ? "bg-white/20 text-white font-semibold" : "text-muted-foreground hover:text-white"
                }`}
              >
                All
              </button>
              <button
                onClick={() => setSelectedStatus("published")}
                className={`text-[11px] px-3 py-1 rounded-lg transition-all ${
                  selectedStatus === "published" ? "bg-emerald-500/20 text-emerald-300 font-semibold" : "text-muted-foreground hover:text-white"
                }`}
              >
                Published
              </button>
              <button
                onClick={() => setSelectedStatus("draft")}
                className={`text-[11px] px-3 py-1 rounded-lg transition-all ${
                  selectedStatus === "draft" ? "bg-slate-500/20 text-slate-300 font-semibold" : "text-muted-foreground hover:text-white"
                }`}
              >
                Drafts
              </button>
              <button
                onClick={() => setSelectedStatus("scheduled")}
                className={`text-[11px] px-3 py-1 rounded-lg transition-all ${
                  selectedStatus === "scheduled" ? "bg-blue-500/20 text-blue-300 font-semibold" : "text-muted-foreground hover:text-white"
                }`}
              >
                Scheduled
              </button>
            </div>
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground font-mono">Sort:</span>
            <Select value={sortBy} onValueChange={(v) => setSortBy(v as "newest" | "oldest" | "views" | "title")}>
              <SelectTrigger className="w-[140px] bg-white/5 border-white/10 text-xs h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-900 border-white/10 text-white">
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="oldest">Oldest First</SelectItem>
                <SelectItem value="views">Most Views</SelectItem>
                <SelectItem value="title">Alphabetical</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Batch Operations Bar (if items selected) */}
        {selectedIds.length > 0 && (
          <div className="p-3 bg-gold/10 border border-gold/30 rounded-2xl flex flex-wrap items-center justify-between gap-3 animate-in fade-in-50">
            <div className="flex items-center gap-2 text-xs text-gold font-medium">
              <span className="w-5 h-5 rounded-full bg-gold text-black font-bold flex items-center justify-center text-[10px]">
                {selectedIds.length}
              </span>
              <span>items selected</span>
            </div>

            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleBatchPublish("published")}
                className="bg-emerald-500/10 border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/20 text-xs h-7 gap-1"
              >
                <Send className="w-3 h-3" />
                Publish Selected
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleBatchPublish("draft")}
                className="bg-white/5 border-white/10 hover:bg-white/10 text-slate-300 text-xs h-7"
              >
                Set as Draft
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={handleBatchDeletePrompt}
                className="text-xs h-7 gap-1"
              >
                <Trash2 className="w-3 h-3" />
                Delete ({selectedIds.length})
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setSelectedIds([])}
                className="text-xs text-muted-foreground h-7"
              >
                Clear
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Content Rendering View */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center space-y-4">
          <RefreshCw className="w-8 h-8 animate-spin text-gold" />
          <p className="text-sm text-muted-foreground">Loading content items from studio storage...</p>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="py-20 text-center space-y-5 bg-card border border-dashed border-white/10 rounded-3xl p-8">
          <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-muted-foreground mx-auto">
            <FileText className="w-6 h-6 text-gold/60" />
          </div>
          <div className="space-y-1.5">
            <h3 className="text-xl font-bold text-white">No content items found</h3>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              {searchQuery || selectedType !== "all" || selectedStatus !== "all"
                ? "Try adjusting your filters or search keywords to view other content."
                : "Your CMS is ready for your first story, press release, or media showcase."}
            </p>
          </div>
          <Button
            onClick={() => openNewEditor("article")}
            className="bg-gold hover:bg-gold-light text-black font-bold text-xs rounded-full px-6"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create First Content Item
          </Button>
        </div>
      ) : viewMode === "grid" ? (
        /* GRID CARDS VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => {
            const isSelected = selectedIds.includes(item.id);
            return (
              <div
                key={item.id}
                onClick={() => openPreview(item)}
                className={`group bg-card border rounded-3xl overflow-hidden flex flex-col justify-between transition-all hover:border-gold/50 cursor-pointer shadow-lg relative ${
                  isSelected ? "border-gold ring-1 ring-gold" : "border-glass-border"
                }`}
              >
                {/* Top Image Banner */}
                <div className="h-44 w-full relative overflow-hidden bg-slate-900">
                  {item.coverImage ? (
                    <img
                      src={item.coverImage}
                      alt={item.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-slate-900/80 text-muted-foreground">
                      {getTypeIcon(item.type)}
                    </div>
                  )}

                  {/* Top floating badges & select checkbox */}
                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10">
                    <div className="flex items-center gap-1.5">
                      <Badge className="bg-black/70 backdrop-blur-md border-white/20 text-[10px] font-mono text-gold flex items-center gap-1">
                        {getTypeIcon(item.type)}
                        <span className="uppercase">{item.type}</span>
                      </Badge>
                      {item.customFields?.badgeText && (
                        <Badge className="bg-gold/80 text-black text-[9px] font-bold">
                          {item.customFields.badgeText}
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={(e) => handleToggleSelectId(item.id, e)}
                        className={`w-6 h-6 rounded-lg border flex items-center justify-center transition-all ${
                          isSelected
                            ? "bg-gold border-gold text-black"
                            : "bg-black/60 border-white/20 text-transparent hover:border-white"
                        }`}
                        title="Select for batch action"
                      >
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </button>
                    </div>
                  </div>

                  {/* Status Overlay Pill */}
                  <div className="absolute bottom-3 left-3">
                    <Badge
                      className={`text-[10px] font-mono uppercase shadow-md ${
                        item.status === "published"
                          ? "bg-emerald-500/90 text-white"
                          : item.status === "scheduled"
                          ? "bg-blue-500/90 text-white"
                          : "bg-slate-700/90 text-slate-200"
                      }`}
                    >
                      {item.status}
                    </Badge>
                  </div>

                  {/* Views count */}
                  <div className="absolute bottom-3 right-3">
                    <span className="text-[10px] font-mono bg-black/70 backdrop-blur-md px-2 py-0.5 rounded-full text-slate-200 flex items-center gap-1 border border-white/10">
                      <Eye className="w-3 h-3 text-cyan-400" />
                      {item.views.toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs text-muted-foreground font-mono">
                      <span>{item.category || "General"}</span>
                      <span>
                        {new Date(item.updatedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-white font-display line-clamp-2 leading-snug group-hover:text-gold transition-colors">
                      {item.title}
                    </h3>

                    {item.excerpt && (
                      <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                        {item.excerpt}
                      </p>
                    )}
                  </div>

                  {/* Tags */}
                  {item.tags && item.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-1">
                      {item.tags.slice(0, 3).map((tag, idx) => (
                        <span key={idx} className="text-[10px] font-mono text-slate-400 bg-white/5 px-2 py-0.5 rounded-md">
                          #{tag}
                        </span>
                      ))}
                      {item.tags.length > 3 && (
                        <span className="text-[10px] font-mono text-muted-foreground">+{item.tags.length - 3}</span>
                      )}
                    </div>
                  )}

                  {/* Actions Footer */}
                  <div className="pt-3 border-t border-white/5 flex items-center justify-between gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => handleTogglePublish(item, e)}
                      className={`text-xs h-8 px-2.5 rounded-lg ${
                        item.status === "published"
                          ? "text-emerald-400 hover:bg-emerald-500/10"
                          : "text-slate-400 hover:bg-white/10"
                      }`}
                      title={item.status === "published" ? "Click to unpublish" : "Click to publish"}
                    >
                      <Send className="w-3.5 h-3.5 mr-1" />
                      {item.status === "published" ? "Live" : "Draft"}
                    </Button>

                    <div className="flex items-center gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => openEditModal(item, e)}
                        className="text-xs h-8 w-8 p-0 text-slate-300 hover:text-white hover:bg-white/10 rounded-lg"
                        title="Edit Content"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => handleDuplicate(item, e)}
                        className="text-xs h-8 w-8 p-0 text-slate-300 hover:text-white hover:bg-white/10 rounded-lg"
                        title="Duplicate"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => handleDeletePrompt(item, e)}
                        className="text-xs h-8 w-8 p-0 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* TABLE LIST VIEW */
        <div className="bg-card border border-glass-border rounded-3xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900/80 text-muted-foreground uppercase font-mono text-[10px] border-b border-white/10">
                <tr>
                  <th className="p-4 w-10">
                    <button
                      onClick={handleSelectAllToggle}
                      className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${
                        selectedIds.length === filteredItems.length && filteredItems.length > 0
                          ? "bg-gold border-gold text-black"
                          : "border-white/20"
                      }`}
                    >
                      {selectedIds.length === filteredItems.length && filteredItems.length > 0 && (
                        <Check className="w-3 h-3 stroke-[3]" />
                      )}
                    </button>
                  </th>
                  <th className="p-4">Title & Details</th>
                  <th className="p-4">Type</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Views</th>
                  <th className="p-4">Last Updated</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredItems.map((item) => {
                  const isSelected = selectedIds.includes(item.id);
                  return (
                    <tr
                      key={item.id}
                      onClick={() => openPreview(item)}
                      className={`hover:bg-white/[0.03] transition-colors cursor-pointer ${
                        isSelected ? "bg-gold/5" : ""
                      }`}
                    >
                      <td className="p-4" onClick={(e) => handleToggleSelectId(item.id, e)}>
                        <button
                          className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${
                            isSelected ? "bg-gold border-gold text-black" : "border-white/20"
                          }`}
                        >
                          {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                        </button>
                      </td>

                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          {item.coverImage ? (
                            <img
                              src={item.coverImage}
                              alt={item.title}
                              className="w-10 h-10 rounded-xl object-cover border border-white/10 shrink-0"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                              {getTypeIcon(item.type)}
                            </div>
                          )}
                          <div className="space-y-0.5">
                            <p className="font-bold text-white font-display text-sm hover:text-gold transition-colors">
                              {item.title}
                            </p>
                            <p className="text-[11px] text-muted-foreground font-mono">
                              /{item.slug} • By {item.author || "Creator"}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="p-4">
                        <Badge variant="outline" className="text-[10px] uppercase font-mono bg-white/5 border-white/10 flex items-center gap-1 w-fit">
                          {getTypeIcon(item.type)}
                          {item.type}
                        </Badge>
                      </td>

                      <td className="p-4 text-slate-300 font-mono text-[11px]">
                        {item.category || "General"}
                      </td>

                      <td className="p-4">
                        <button
                          onClick={(e) => handleTogglePublish(item, e)}
                          className="text-left"
                          title="Click to toggle publish status"
                        >
                          <Badge
                            className={`text-[10px] font-mono uppercase cursor-pointer hover:opacity-80 transition-opacity ${
                              item.status === "published"
                                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                                : item.status === "scheduled"
                                ? "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                                : "bg-slate-500/20 text-slate-300 border border-slate-500/30"
                            }`}
                          >
                            {item.status}
                          </Badge>
                        </button>
                      </td>

                      <td className="p-4 font-mono text-[11px] text-slate-300">
                        {item.views.toLocaleString()}
                      </td>

                      <td className="p-4 font-mono text-[11px] text-muted-foreground">
                        {new Date(item.updatedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </td>

                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => openPreview(item, e)}
                            className="h-7 w-7 p-0 text-slate-300 hover:text-white"
                            title="Preview Content"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => openEditModal(item, e)}
                            className="h-7 w-7 p-0 text-slate-300 hover:text-white"
                            title="Edit"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => handleDuplicate(item, e)}
                            className="h-7 w-7 p-0 text-slate-300 hover:text-white"
                            title="Duplicate"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => handleDeletePrompt(item, e)}
                            className="h-7 w-7 p-0 text-red-400 hover:text-red-300 hover:bg-red-500/10"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Editor Modal */}
      <ContentEditorDialog
        item={editingItem}
        open={editorOpen}
        onOpenChange={setEditorOpen}
        onSave={handleSaveItem}
        userId={user?.uid}
      />

      {/* Public Preview Modal */}
      <ContentPreviewModal
        item={previewItem}
        open={previewOpen}
        onOpenChange={setPreviewOpen}
        onEdit={(item) => {
          setEditingItem(item);
          setEditorOpen(true);
        }}
      />

      {/* Delete Confirmation Alert */}
      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent className="bg-slate-950 border border-glass-border text-white sm:rounded-3xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-bold text-white flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-400" />
              Confirm Deletion
            </AlertDialogTitle>
            <AlertDialogDescription className="text-slate-300 text-xs mt-2">
              {isBatchDeleting
                ? `Are you sure you want to permanently delete ${selectedIds.length} selected content items? This action cannot be undone.`
                : `Are you sure you want to delete "${itemToDelete?.title}"? This item will be removed from your public publications and studio storage.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-4 gap-2">
            <AlertDialogCancel className="border-white/10 hover:bg-white/10 text-xs">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-red-500 hover:bg-red-600 text-white font-semibold text-xs"
            >
              Delete Permanently
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

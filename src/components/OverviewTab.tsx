import React, { useState, useEffect, useMemo } from "react";
import {
  Sparkles,
  Plus,
  Pin,
  Trash2,
  CheckCircle2,
  Circle,
  Copy,
  Edit3,
  Search,
  Tag,
  Lightbulb,
  FileText,
  TrendingUp,
  DollarSign,
  ArrowUpRight,
  Zap,
  Check,
  Calendar,
  Layers,
  Clock,
  ShieldCheck,
  Share2,
  BookOpen,
  Film,
  Music,
  Download,
  Filter
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Profession, ProjectItem } from "./CreatorDashboard";

export type NoteCategory = "Release Strategy" | "Marketing & PR" | "Production" | "Touring & Live" | "Creative Idea";
export type NoteColor = "indigo" | "amber" | "emerald" | "violet" | "rose";

export interface StrategyNote {
  id: string;
  title: string;
  content: string;
  category: NoteCategory;
  color: NoteColor;
  isPinned: boolean;
  isCompleted: boolean;
  createdAt: string;
  tags: string[];
}

const STORAGE_KEY = "creator_strategy_quick_notes";

const DEFAULT_NOTES: StrategyNote[] = [
  {
    id: "note_1",
    title: "Lead Single Pre-Save Campaign & TikTok Teaser Schedule",
    content: "Post 3 behind-the-scenes vocal production snippets. Offer exclusive acoustic stem download link for fans who pre-save on Spotify and Apple Music.",
    category: "Marketing & PR",
    color: "indigo",
    isPinned: true,
    isCompleted: false,
    createdAt: "2026-08-25T14:30:00.000Z",
    tags: ["TikTok", "Pre-Save", "LeadSingle"]
  },
  {
    id: "note_2",
    title: "Vinyl & Merch Bundle Limited Edition Pre-Order",
    content: "Coordinate with pressing plant for 500 foil-numbered gold vinyl variants. Bundle with silk-screen tour poster and digital download card.",
    category: "Release Strategy",
    color: "amber",
    isPinned: true,
    isCompleted: false,
    createdAt: "2026-08-24T10:15:00.000Z",
    tags: ["Vinyl", "Merch", "VIP"]
  },
  {
    id: "note_3",
    title: "Festival Screener & Press Kit Sync",
    content: "Update EPK with Sundance & Tribeca submission cut links. Verify private Vimeo password protection is enabled with watermark overlay.",
    category: "Production",
    color: "emerald",
    isPinned: false,
    isCompleted: true,
    createdAt: "2026-08-22T09:00:00.000Z",
    tags: ["Screener", "FilmFest", "EPK"]
  },
  {
    id: "note_4",
    title: "Fall Tour Routing & Venue Hold Confirmations",
    content: "Follow up with booking agent on Chicago, Austin, and Brooklyn dates. Confirm 24-channel FOH soundboard requirements in technical rider.",
    category: "Touring & Live",
    color: "violet",
    isPinned: false,
    isCompleted: false,
    createdAt: "2026-08-20T16:45:00.000Z",
    tags: ["Tour", "Live", "Rider"]
  }
];

interface OverviewTabProps {
  activeProfession: Profession;
  professionConfig: {
    title: string;
    subtitle: string;
    accentColor: string;
    metricLabel: string;
    metricUnit: string;
    categories: string[];
    icon: React.ComponentType<{ className?: string }>;
    quickAction: string;
    epkTitle: string;
    statBg: string;
  };
  aggregateMetrics: {
    totalEngagements: number;
    totalRevenue: number;
    activeProjectsCount: number;
    epkCount: number;
    totalProjects: number;
  };
  projects: ProjectItem[];
  onOpenEPK: () => void;
  onOpenAddProject: () => void;
}

export default function OverviewTab({
  activeProfession,
  professionConfig,
  aggregateMetrics,
  projects,
  onOpenEPK,
  onOpenAddProject,
}: OverviewTabProps) {
  const { toast } = useToast();

  // Quick Notes State backed by localStorage
  const [notes, setNotes] = useState<StrategyNote[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error("Failed to parse quick notes from storage", e);
    }
    return DEFAULT_NOTES;
  });

  // Notes UI state
  const [noteSearch, setNoteSearch] = useState("");
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>("All");
  const [editingNote, setEditingNote] = useState<StrategyNote | null>(null);
  const [isNoteDialogOpen, setIsNoteDialogOpen] = useState(false);

  // Quick Idea Capture Form State
  const [quickTitle, setQuickTitle] = useState("");
  const [quickContent, setQuickContent] = useState("");
  const [quickCategory, setQuickCategory] = useState<NoteCategory>("Release Strategy");
  const [quickColor, setQuickColor] = useState<NoteColor>("indigo");

  // Save notes to localStorage on modification
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
    } catch (e) {
      console.error("Failed to save quick notes to storage", e);
    }
  }, [notes]);

  // Handle adding a new quick note
  const handleAddQuickNote = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!quickTitle.trim()) {
      toast({
        title: "Strategy Title Required",
        description: "Please enter a title or prompt for your strategy idea.",
        variant: "destructive",
      });
      return;
    }

    const newNote: StrategyNote = {
      id: "note_" + Date.now(),
      title: quickTitle.trim(),
      content: quickContent.trim() || "Action items and strategic notes in development.",
      category: quickCategory,
      color: quickColor,
      isPinned: false,
      isCompleted: false,
      createdAt: new Date().toISOString(),
      tags: [quickCategory.split(" ")[0]],
    };

    setNotes((prev) => [newNote, ...prev]);
    setQuickTitle("");
    setQuickContent("");
    toast({
      title: "Strategy Note Saved",
      description: `"${newNote.title}" stored to instant local storage.`,
    });
  };

  // Toggle Pin
  const handleTogglePin = (id: string) => {
    setNotes((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isPinned: !n.isPinned } : n))
    );
  };

  // Toggle Completed
  const handleToggleCompleted = (id: string) => {
    setNotes((prev) =>
      prev.map((n) => {
        if (n.id === id) {
          const next = !n.isCompleted;
          toast({
            title: next ? "Strategy Milestone Completed" : "Strategy Reopened",
            description: `Marked "${n.title}" as ${next ? "completed" : "in-progress"}.`,
          });
          return { ...n, isCompleted: next };
        }
        return n;
      })
    );
  };

  // Delete note
  const handleDeleteNote = (id: string, title: string) => {
    setNotes((prev) => prev.filter((n) => n.id !== id));
    toast({
      title: "Note Removed",
      description: `Deleted "${title}" from strategy notes.`,
    });
  };

  // Copy note content
  const handleCopyNote = (note: StrategyNote) => {
    const text = `${note.title}\nCategory: ${note.category}\n\n${note.content}`;
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to Clipboard",
      description: "Note strategy details copied.",
    });
  };

  // Save edited note
  const handleSaveEditedNote = () => {
    if (!editingNote) return;
    setNotes((prev) =>
      prev.map((n) => (n.id === editingNote.id ? editingNote : n))
    );
    setIsNoteDialogOpen(false);
    setEditingNote(null);
    toast({
      title: "Strategy Updated",
      description: "Changes saved to local storage.",
    });
  };

  // Filtered & Sorted Notes
  const filteredNotes = useMemo(() => {
    return notes
      .filter((note) => {
        if (selectedCategoryFilter !== "All" && note.category !== selectedCategoryFilter) {
          return false;
        }
        if (noteSearch.trim()) {
          const q = noteSearch.toLowerCase();
          const matchTitle = note.title.toLowerCase().includes(q);
          const matchContent = note.content.toLowerCase().includes(q);
          const matchTag = note.tags?.some((t) => t.toLowerCase().includes(q));
          if (!matchTitle && !matchContent && !matchTag) return false;
        }
        return true;
      })
      .sort((a, b) => {
        // Pinned notes come first
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;
        // Then by creation date newest first
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
  }, [notes, selectedCategoryFilter, noteSearch]);

  // Color helpers
  const getColorStyles = (color: NoteColor) => {
    switch (color) {
      case "indigo":
        return {
          border: "border-indigo-500/30 hover:border-indigo-400",
          badge: "bg-indigo-500/20 text-indigo-300 border-indigo-500/40",
          accent: "text-indigo-400",
          dot: "bg-indigo-400",
          gradient: "from-indigo-500/10 via-white/[0.04] to-transparent",
        };
      case "amber":
        return {
          border: "border-amber-500/30 hover:border-amber-400",
          badge: "bg-amber-500/20 text-amber-300 border-amber-500/40",
          accent: "text-amber-400",
          dot: "bg-amber-400",
          gradient: "from-amber-500/10 via-white/[0.04] to-transparent",
        };
      case "emerald":
        return {
          border: "border-emerald-500/30 hover:border-emerald-400",
          badge: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
          accent: "text-emerald-400",
          dot: "bg-emerald-400",
          gradient: "from-emerald-500/10 via-white/[0.04] to-transparent",
        };
      case "violet":
        return {
          border: "border-purple-500/30 hover:border-purple-400",
          badge: "bg-purple-500/20 text-purple-300 border-purple-500/40",
          accent: "text-purple-400",
          dot: "bg-purple-400",
          gradient: "from-purple-500/10 via-white/[0.04] to-transparent",
        };
      case "rose":
        return {
          border: "border-rose-500/30 hover:border-rose-400",
          badge: "bg-rose-500/20 text-rose-300 border-rose-500/40",
          accent: "text-rose-400",
          dot: "bg-rose-400",
          gradient: "from-rose-500/10 via-white/[0.04] to-transparent",
        };
      default:
        return {
          border: "border-white/10 hover:border-white/20",
          badge: "bg-white/10 text-white border-white/20",
          accent: "text-white",
          dot: "bg-white",
          gradient: "from-white/5 to-transparent",
        };
    }
  };

  const completedCount = notes.filter((n) => n.isCompleted).length;
  const pinnedCount = notes.filter((n) => n.isPinned).length;

  return (
    <div className="space-y-8 animate-in fade-in-50 duration-500">
      {/* 1. TRANSLUCENT KPI METRICS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Primary Engagements */}
        <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-5 shadow-xl hover:border-indigo-400/40 transition-all group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase text-slate-300 tracking-wider">
              {professionConfig.metricLabel}
            </span>
            <div className="w-8 h-8 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-3xl font-bold font-display text-white tracking-tight">
              {aggregateMetrics.totalEngagements.toLocaleString()}
            </p>
            <div className="flex items-center gap-1.5 mt-1.5 text-xs text-emerald-400 font-mono">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>+18.4% monthly growth</span>
            </div>
          </div>
        </div>

        {/* KPI 2: Direct Gross Revenue */}
        <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-5 shadow-xl hover:border-amber-400/40 transition-all group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase text-slate-300 tracking-wider">
              Royalties & Direct Sales
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-3xl font-bold font-display text-amber-400 tracking-tight">
              ${aggregateMetrics.totalRevenue.toLocaleString()}
            </p>
            <div className="flex items-center gap-1.5 mt-1.5 text-xs text-emerald-400 font-mono">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-400" />
              <span>Direct payouts active</span>
            </div>
          </div>
        </div>

        {/* KPI 3: Pipeline Volume */}
        <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-5 shadow-xl hover:border-indigo-400/40 transition-all group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase text-slate-300 tracking-wider">
              Active Production Pipeline
            </span>
            <div className="w-8 h-8 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400 group-hover:scale-110 transition-transform">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-3xl font-bold font-display text-white tracking-tight">
              {aggregateMetrics.activeProjectsCount} <span className="text-lg text-slate-400 font-normal">Active</span>
            </p>
            <p className="text-xs text-slate-400 font-mono mt-1.5">
              Out of {aggregateMetrics.totalProjects} total catalog items
            </p>
          </div>
        </div>

        {/* KPI 4: EPK & Media Sync */}
        <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-5 shadow-xl hover:border-emerald-400/40 transition-all group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase text-slate-300 tracking-wider">
              Press Kit (EPK) Status
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-3xl font-bold font-display text-white tracking-tight">
              {aggregateMetrics.epkCount} <span className="text-lg text-slate-400 font-normal">Linked</span>
            </p>
            <button
              onClick={onOpenEPK}
              className="text-xs text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1 mt-1.5 hover:underline"
            >
              Open EPK Builder <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* 2. LOCAL STORAGE 'QUICK NOTES' STRATEGY BOARD */}
      <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl space-y-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20" />

        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-indigo-500/20 text-indigo-300 border-indigo-500/30 text-xs font-mono uppercase tracking-wider flex items-center gap-1.5">
                <Lightbulb className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                Local Storage Hub
              </Badge>
              <span className="text-xs text-slate-400 font-mono">
                • {notes.length} strategy notes saved
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-display font-bold text-white tracking-tight">
              Strategic Quick Notes
            </h2>
            <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
              Instantly capture rollout tactics, marketing angles, setlist arrangements, screener passcodes, and launch milestones. Automatically saved to browser storage.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Badge className="bg-indigo-500/20 text-indigo-200 border border-indigo-500/30 text-xs py-1 px-2.5">
              <Pin className="w-3 h-3 mr-1 text-amber-400 inline" /> {pinnedCount} Pinned
            </Badge>
            <Badge className="bg-emerald-500/20 text-emerald-200 border border-emerald-500/30 text-xs py-1 px-2.5">
              <CheckCircle2 className="w-3 h-3 mr-1 text-emerald-400 inline" /> {completedCount} Done
            </Badge>
          </div>
        </div>

        {/* QUICK IDEA CAPTURE FORM */}
        <div className="bg-slate-900/80 border border-white/10 rounded-2xl p-5 backdrop-blur-md relative z-10 space-y-4 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-wider text-amber-400 font-semibold flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" /> Instant Idea Capture
            </span>
            <span className="text-[11px] text-slate-400 font-mono">Auto-persisted to Local Storage</span>
          </div>

          <form onSubmit={handleAddQuickNote} className="space-y-3">
            <div className="flex flex-col sm:flex-row gap-3">
              <Input
                value={quickTitle}
                onChange={(e) => setQuickTitle(e.target.value)}
                placeholder="What's your strategy idea? (e.g. Q4 Spotify Editorial Pitch, Vinyl Pre-order drop...)"
                className="bg-white/5 border-white/10 text-white placeholder:text-slate-400 text-sm h-10 rounded-xl flex-1 focus:border-indigo-400"
              />

              <div className="flex items-center gap-2 shrink-0">
                <Select value={quickCategory} onValueChange={(v) => setQuickCategory(v as NoteCategory)}>
                  <SelectTrigger className="w-[170px] bg-white/5 border-white/10 text-xs text-white h-10 rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 border-white/10 text-white">
                    <SelectItem value="Release Strategy">Release Strategy</SelectItem>
                    <SelectItem value="Marketing & PR">Marketing & PR</SelectItem>
                    <SelectItem value="Production">Production</SelectItem>
                    <SelectItem value="Touring & Live">Touring & Live</SelectItem>
                    <SelectItem value="Creative Idea">Creative Idea</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={quickColor} onValueChange={(v) => setQuickColor(v as NoteColor)}>
                  <SelectTrigger className="w-[110px] bg-white/5 border-white/10 text-xs text-white h-10 rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 border-white/10 text-white">
                    <SelectItem value="indigo">Indigo</SelectItem>
                    <SelectItem value="amber">Amber</SelectItem>
                    <SelectItem value="emerald">Emerald</SelectItem>
                    <SelectItem value="violet">Violet</SelectItem>
                    <SelectItem value="rose">Rose</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3">
              <Input
                value={quickContent}
                onChange={(e) => setQuickContent(e.target.value)}
                placeholder="Add execution details, bullet points, or target URLs (optional)..."
                className="bg-white/5 border-white/10 text-slate-300 placeholder:text-slate-500 text-xs h-9 rounded-xl flex-1"
              />

              <Button
                type="submit"
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs h-9 px-5 rounded-xl flex items-center gap-1.5 shadow-lg shadow-indigo-500/20 w-full sm:w-auto shrink-0 transition-all hover:scale-105"
              >
                <Plus className="w-4 h-4" />
                Save Strategy Idea
              </Button>
            </div>
          </form>
        </div>

        {/* CONTROLS & FILTER BAR */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 relative z-10">
          {/* Category Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5">
            {["All", "Release Strategy", "Marketing & PR", "Production", "Touring & Live", "Creative Idea"].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategoryFilter(cat)}
                className={`text-xs px-3 py-1.5 rounded-xl font-medium transition-all ${
                  selectedCategoryFilter === cat
                    ? "bg-indigo-600 text-white shadow-md"
                    : "bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white border border-white/5"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search bar */}
          <div className="relative min-w-[200px] max-w-xs">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input
              value={noteSearch}
              onChange={(e) => setNoteSearch(e.target.value)}
              placeholder="Search strategy notes..."
              className="pl-8 bg-white/5 border-white/10 text-xs text-white placeholder:text-slate-400 h-8 rounded-xl"
            />
            {noteSearch && (
              <button
                onClick={() => setNoteSearch("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* NOTES GRID */}
        {filteredNotes.length === 0 ? (
          <div className="py-12 text-center space-y-3 bg-white/[0.02] border border-dashed border-white/10 rounded-2xl p-6">
            <Lightbulb className="w-10 h-10 text-slate-500 mx-auto opacity-60" />
            <h4 className="text-base font-bold text-white">No strategy notes found</h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              {noteSearch || selectedCategoryFilter !== "All"
                ? "Try adjusting your filter or search keywords."
                : "Type an idea into the capture box above to store your first quick strategy note."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4 relative z-10">
            {filteredNotes.map((note) => {
              const styles = getColorStyles(note.color);
              return (
                <div
                  key={note.id}
                  className={`group bg-gradient-to-br ${styles.gradient} bg-slate-900/70 backdrop-blur-md border ${styles.border} rounded-2xl p-5 transition-all shadow-lg flex flex-col justify-between space-y-4 hover:shadow-indigo-500/10 relative ${
                    note.isCompleted ? "opacity-75" : ""
                  }`}
                >
                  {/* Note Header */}
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <Badge variant="outline" className={`text-[10px] font-mono px-2 py-0.5 ${styles.badge}`}>
                          <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${styles.dot}`} />
                          {note.category}
                        </Badge>
                        {note.isPinned && (
                          <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/30 text-[10px] flex items-center gap-1">
                            <Pin className="w-2.5 h-2.5 text-amber-400" /> Pinned
                          </Badge>
                        )}
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleTogglePin(note.id)}
                          className={`p-1.5 rounded-lg text-xs transition-colors ${
                            note.isPinned
                              ? "text-amber-400 bg-amber-500/20 hover:bg-amber-500/30"
                              : "text-slate-400 hover:text-white hover:bg-white/10"
                          }`}
                          title={note.isPinned ? "Unpin note" : "Pin note to top"}
                        >
                          <Pin className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleToggleCompleted(note.id)}
                          className={`p-1.5 rounded-lg text-xs transition-colors ${
                            note.isCompleted
                              ? "text-emerald-400 bg-emerald-500/20 hover:bg-emerald-500/30"
                              : "text-slate-400 hover:text-white hover:bg-white/10"
                          }`}
                          title={note.isCompleted ? "Mark incomplete" : "Mark completed"}
                        >
                          {note.isCompleted ? (
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          ) : (
                            <Circle className="w-3.5 h-3.5" />
                          )}
                        </button>
                        <button
                          onClick={() => {
                            setEditingNote(note);
                            setIsNoteDialogOpen(true);
                          }}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 text-xs transition-colors"
                          title="Edit note"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleCopyNote(note)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 text-xs transition-colors"
                          title="Copy text"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteNote(note.id, note.title)}
                          className="p-1.5 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-500/20 text-xs transition-colors"
                          title="Delete note"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <h3
                      className={`text-base font-bold font-display text-white transition-colors ${
                        note.isCompleted ? "line-through text-slate-400" : "group-hover:text-amber-300"
                      }`}
                    >
                      {note.title}
                    </h3>

                    <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line">
                      {note.content}
                    </p>
                  </div>

                  {/* Note Footer */}
                  <div className="pt-3 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-400 font-mono">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3 h-3 text-slate-500" />
                      <span>{new Date(note.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
                    </div>

                    {note.tags && note.tags.length > 0 && (
                      <div className="flex items-center gap-1">
                        {note.tags.map((t, idx) => (
                          <span key={idx} className="bg-white/5 px-2 py-0.5 rounded text-[10px] text-slate-300">
                            #{t}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 3. RELEASE ROADMAP & STRATEGY MILESTONES (FROSTED GLASS PANELS) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Panel 1: Rollout Milestones */}
        <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-6 shadow-xl space-y-4 lg:col-span-2">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="space-y-0.5">
              <h3 className="text-lg font-bold font-display text-white flex items-center gap-2">
                <Calendar className="w-4 h-4 text-amber-400" />
                Strategic Launch Milestones
              </h3>
              <p className="text-xs text-slate-400">Key checkpoints for scheduled releases & exhibitions</p>
            </div>
            <Button
              size="sm"
              onClick={onOpenAddProject}
              className="bg-amber-500 hover:bg-amber-600 text-black font-bold text-xs rounded-xl h-8 gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Project
            </Button>
          </div>

          <div className="space-y-3">
            {projects.slice(0, 4).map((proj) => (
              <div
                key={proj.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-xl bg-slate-900/60 border border-white/10 hover:border-indigo-400/30 transition-all gap-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge
                      className={`text-[10px] font-mono uppercase ${
                        proj.status === "Released"
                          ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                          : proj.status === "Pre-Order"
                          ? "bg-amber-500/20 text-amber-300 border-amber-500/30"
                          : "bg-indigo-500/20 text-indigo-300 border-indigo-500/30"
                      }`}
                    >
                      {proj.status}
                    </Badge>
                    <span className="text-xs font-bold text-white font-display">{proj.title}</span>
                  </div>
                  <p className="text-[11px] text-slate-400 font-mono">
                    Category: {proj.category} • Target Date: {proj.releaseDate}
                  </p>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-xs font-mono text-amber-400 font-semibold">
                    ${proj.revenue.toLocaleString()} Rev
                  </span>
                  <Badge variant="outline" className="text-[10px] text-slate-300 border-white/10">
                    {proj.epkLinked ? "EPK Synced" : "EPK Pending"}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Panel 2: Creator Agreement & Rights Curriculum */}
        <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="border-b border-white/10 pb-3">
            <h3 className="text-lg font-bold font-display text-white flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-indigo-400" />
              Sovereign Rights Reader
            </h3>
            <p className="text-xs text-slate-400">Creator ownership & royalty agreements</p>
          </div>

          <div className="space-y-2.5 text-xs text-slate-300">
            <div className="p-3 rounded-xl bg-slate-900/60 border border-white/10 space-y-1">
              <p className="font-semibold text-white flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-emerald-400" /> 100% Master Ownership
              </p>
              <p className="text-[11px] text-slate-400">All sound recordings, video cuts, and manuscripts remain in your sole ownership.</p>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/60 border border-white/10 space-y-1">
              <p className="font-semibold text-white flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-emerald-400" /> Direct Fan Payouts
              </p>
              <p className="text-[11px] text-slate-400">Stripe and cryptocurrency payment gateways deposit funds directly to your verified account.</p>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/60 border border-white/10 space-y-1">
              <p className="font-semibold text-white flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-emerald-400" /> EPK Distribution Pass
              </p>
              <p className="text-[11px] text-slate-400">Generate password-secured media kits for talent buyers, journalists, and film festivals.</p>
            </div>
          </div>

          <Button
            onClick={onOpenEPK}
            variant="outline"
            className="w-full bg-white/5 border-white/10 hover:bg-white/10 text-xs text-white font-semibold rounded-xl"
          >
            Review Press Kit Specs
          </Button>
        </div>
      </div>

      {/* MODAL: EDIT STRATEGY NOTE DIALOG */}
      <Dialog open={isNoteDialogOpen} onOpenChange={setIsNoteDialogOpen}>
        <DialogContent className="bg-slate-950 border border-white/10 text-white sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg font-display text-white">
              <Edit3 className="w-4 h-4 text-indigo-400" />
              Edit Strategy Note
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-400">
              Update title, execution steps, category, or color tag.
            </DialogDescription>
          </DialogHeader>

          {editingNote && (
            <div className="space-y-4 my-2">
              <div className="space-y-1">
                <label className="text-xs text-slate-400">Strategy Title</label>
                <Input
                  value={editingNote.title}
                  onChange={(e) => setEditingNote({ ...editingNote, title: e.target.value })}
                  className="bg-white/5 border-white/10 text-white text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs text-slate-400">Category</label>
                  <Select
                    value={editingNote.category}
                    onValueChange={(val: NoteCategory) => setEditingNote({ ...editingNote, category: val })}
                  >
                    <SelectTrigger className="bg-white/5 border-white/10 text-xs text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-900 border-white/10 text-white">
                      <SelectItem value="Release Strategy">Release Strategy</SelectItem>
                      <SelectItem value="Marketing & PR">Marketing & PR</SelectItem>
                      <SelectItem value="Production">Production</SelectItem>
                      <SelectItem value="Touring & Live">Touring & Live</SelectItem>
                      <SelectItem value="Creative Idea">Creative Idea</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-slate-400">Color Tag</label>
                  <Select
                    value={editingNote.color}
                    onValueChange={(val: NoteColor) => setEditingNote({ ...editingNote, color: val })}
                  >
                    <SelectTrigger className="bg-white/5 border-white/10 text-xs text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-900 border-white/10 text-white">
                      <SelectItem value="indigo">Indigo</SelectItem>
                      <SelectItem value="amber">Amber</SelectItem>
                      <SelectItem value="emerald">Emerald</SelectItem>
                      <SelectItem value="violet">Violet</SelectItem>
                      <SelectItem value="rose">Rose</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs text-slate-400">Details & Action Items</label>
                <Textarea
                  value={editingNote.content}
                  onChange={(e) => setEditingNote({ ...editingNote, content: e.target.value })}
                  rows={4}
                  className="bg-white/5 border-white/10 text-white text-xs resize-none"
                />
              </div>
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="ghost"
              onClick={() => setIsNoteDialogOpen(false)}
              className="text-xs text-slate-300"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveEditedNote}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs"
            >
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

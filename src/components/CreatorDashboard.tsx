import React, { useState, useEffect, useMemo } from "react";
import {
  Music,
  Film,
  BookOpen,
  BarChart3,
  Users,
  FileText,
  Sparkles,
  Plus,
  Play,
  TrendingUp,
  Globe,
  Calendar,
  DollarSign,
  Award,
  Radio,
  Eye,
  Download,
  Share2,
  CheckCircle2,
  ListFilter,
  ExternalLink,
  Zap,
  ArrowUpRight,
  Disc,
  Clapperboard,
  Book,
  Heart,
  LayoutDashboard,
  FolderGit2,
  PieChart,
  Sliders
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
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
import EPKBuilder from "./EPKBuilder";
import OverviewTab from "./OverviewTab";

export type Profession = "musician" | "filmmaker" | "author";

export interface ProjectItem {
  id: string;
  title: string;
  profession: Profession;
  category: string; // e.g., "Album", "Feature Film", "Novel", "EP", "Documentary", "Poetry Collection"
  status: "In Production" | "Scheduled" | "Released" | "Pre-Order";
  releaseDate: string;
  playsOrViewsOrSales: number;
  revenue: number;
  coverImage?: string;
  epkLinked: boolean;
  featuredTrackOrTrailer?: string;
}

const INITIAL_PROJECTS: ProjectItem[] = [
  // Musician Projects
  {
    id: "m1",
    title: "Midnight Echoes LP",
    profession: "musician",
    category: "Studio Album",
    status: "Released",
    releaseDate: "2026-05-15",
    playsOrViewsOrSales: 124500,
    revenue: 18400,
    epkLinked: true,
    featuredTrackOrTrailer: "Track 01 - Echoes in the Dark (3:45)"
  },
  {
    id: "m2",
    title: "Neon Drive Single",
    profession: "musician",
    category: "Single",
    status: "Pre-Order",
    releaseDate: "2026-08-20",
    playsOrViewsOrSales: 8900,
    revenue: 2100,
    epkLinked: true,
    featuredTrackOrTrailer: "Neon Drive (Acoustic Mix)"
  },
  {
    id: "m3",
    title: "Live in London Tour Stems",
    profession: "musician",
    category: "Live EP",
    status: "In Production",
    releaseDate: "2026-10-01",
    playsOrViewsOrSales: 0,
    revenue: 0,
    epkLinked: false
  },

  // Filmmaker Projects
  {
    id: "f1",
    title: "The Silent Horizon",
    profession: "filmmaker",
    category: "Sci-Fi Feature",
    status: "Released",
    releaseDate: "2026-03-10",
    playsOrViewsOrSales: 340000,
    revenue: 45000,
    epkLinked: true,
    featuredTrackOrTrailer: "Official 4K Trailer (2:15)"
  },
  {
    id: "f2",
    title: "Echoes of the Underground",
    profession: "filmmaker",
    category: "Music Docuseries",
    status: "Scheduled",
    releaseDate: "2026-09-01",
    playsOrViewsOrSales: 14200,
    revenue: 6800,
    epkLinked: true,
    featuredTrackOrTrailer: "Teaser Clip (1:00)"
  },

  // Author Projects
  {
    id: "a1",
    title: "Chronicles of Aether: Vol I",
    profession: "author",
    category: "Fantasy Novel",
    status: "Released",
    releaseDate: "2026-01-20",
    playsOrViewsOrSales: 18500,
    revenue: 32400,
    epkLinked: true,
    featuredTrackOrTrailer: "Chapter 1 Sample PDF"
  },
  {
    id: "a2",
    title: "The Modern Creative Monolith",
    profession: "author",
    category: "Non-Fiction / Guide",
    status: "Pre-Order",
    releaseDate: "2026-11-12",
    playsOrViewsOrSales: 3200,
    revenue: 8900,
    epkLinked: false
  }
];

export default function CreatorDashboard() {
  const { toast } = useToast();
  const [activeProfession, setActiveProfession] = useState<Profession>("musician");
  const [projects, setProjects] = useState<ProjectItem[]>(() => {
    const saved = localStorage.getItem("creator_dashboard_projects");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // fallback
      }
    }
    return INITIAL_PROJECTS;
  });

  const [timeRange, setTimeRange] = useState<"7d" | "30d" | "1y" | "all">("30d");
  const [showEPKModal, setShowEPKModal] = useState(false);
  const [showAddProjectModal, setShowAddProjectModal] = useState(false);

  // New Project Form State
  const [newTitle, setNewTitle] = useState("");
  const [newCategory, setNewCategory] = useState("Album");
  const [newStatus, setNewStatus] = useState<"In Production" | "Scheduled" | "Released" | "Pre-Order">("In Production");
  const [newReleaseDate, setNewReleaseDate] = useState("2026-09-01");

  // Save projects on change
  useEffect(() => {
    localStorage.setItem("creator_dashboard_projects", JSON.stringify(projects));
  }, [projects]);

  // Active profession config metadata
  const professionConfig = useMemo(() => {
    switch (activeProfession) {
      case "musician":
        return {
          title: "Musician & Band Hub",
          subtitle: "Manage albums, tour schedules, streaming stats, and fan mailing lists.",
          accentColor: "from-sky-500/20 to-gold/10 border-gold/30 text-gold",
          metricLabel: "Total Streams / Plays",
          metricUnit: "Streams",
          categories: ["Studio Album", "Single", "EP", "Live Album", "Remix Pack"],
          icon: Disc,
          quickAction: "Schedule Album Launch",
          epkTitle: "Band & Artist EPK",
          statBg: "bg-sky-500/10 text-sky-400"
        };
      case "filmmaker":
        return {
          title: "Filmmaker & Director Hub",
          subtitle: "Showcase trailers, film festival screeners, call sheets, and box office views.",
          accentColor: "from-blue-500/20 to-purple-500/10 border-blue-500/30 text-blue-400",
          metricLabel: "Total Screener Views",
          metricUnit: "Views",
          categories: ["Feature Film", "Short Film", "Documentary", "Music Video", "Screenplay"],
          icon: Clapperboard,
          quickAction: "Submit to Film Festivals",
          epkTitle: "Film Screener & Press Kit",
          statBg: "bg-blue-500/10 text-blue-400"
        };
      case "author":
        return {
          title: "Author & Writer Hub",
          subtitle: "Track book sales, sample chapters, reader newsletters, and signings.",
          accentColor: "from-emerald-500/20 to-teal-500/10 border-emerald-500/30 text-emerald-400",
          metricLabel: "Total Books & Chapters Read",
          metricUnit: "Copies Sold",
          categories: ["Novel", "Poetry Collection", "Non-Fiction", "Audiobook", "Essay Series"],
          icon: Book,
          quickAction: "Launch Pre-Order Campaign",
          epkTitle: "Author Bio & Media Kit",
          statBg: "bg-emerald-500/10 text-emerald-400"
        };
    }
  }, [activeProfession]);

  // Filter projects for active profession
  const filteredProjects = useMemo(() => {
    return projects.filter(p => p.profession === activeProfession);
  }, [projects, activeProfession]);

  // Calculate profession aggregate metrics
  const aggregateMetrics = useMemo(() => {
    const list = projects.filter(p => p.profession === activeProfession);
    const totalEngagements = list.reduce((acc, curr) => acc + curr.playsOrViewsOrSales, 0);
    const totalRevenue = list.reduce((acc, curr) => acc + curr.revenue, 0);
    const activeProjectsCount = list.filter(p => p.status === "In Production" || p.status === "Pre-Order").length;
    const epkCount = list.filter(p => p.epkLinked).length;

    return {
      totalEngagements,
      totalRevenue,
      activeProjectsCount,
      epkCount,
      totalProjects: list.length
    };
  }, [projects, activeProfession]);

  // Handle create new project
  const handleAddProject = () => {
    if (!newTitle.trim()) {
      toast({ title: "Project Title Required", variant: "destructive" });
      return;
    }

    const newItem: ProjectItem = {
      id: "proj_" + Date.now(),
      title: newTitle.trim(),
      profession: activeProfession,
      category: newCategory,
      status: newStatus,
      releaseDate: newReleaseDate,
      playsOrViewsOrSales: newStatus === "Released" ? 1200 : 0,
      revenue: newStatus === "Released" ? 450 : 0,
      epkLinked: true,
      featuredTrackOrTrailer: `${newTitle} Teaser Preview`
    };

    setProjects(prev => [newItem, ...prev]);
    setShowAddProjectModal(false);
    setNewTitle("");
    toast({
      title: "Project Added to Gallery",
      description: `"${newItem.title}" was added to your ${activeProfession} portfolio.`,
    });
  };

  // Toggle EPK Link status on a project
  const toggleEPKLink = (projectId: string) => {
    setProjects(prev =>
      prev.map(p => {
        if (p.id === projectId) {
          const nextState = !p.epkLinked;
          toast({
            title: nextState ? "Linked to EPK" : "Unlinked from EPK",
            description: `${p.title} is ${nextState ? "now visible" : "hidden"} in your public Press Kit.`,
          });
          return { ...p, epkLinked: nextState };
        }
        return p;
      })
    );
  };

  const [dashboardTab, setDashboardTab] = useState<string>("overview");

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* HEADER & PROFESSION SWITCHER */}
      <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-3xl p-6 md:p-8 relative overflow-hidden shadow-2xl">
        <div className="absolute -right-12 -top-12 w-80 h-80 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-12 -bottom-12 w-80 h-80 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline" className="bg-sky-500/15 border-sky-500/30 text-sky-300 text-xs px-3 py-1 font-mono uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-sky-400" /> A-List Creator Hub
              </Badge>
              <Badge variant="outline" className="bg-indigo-500/15 border-indigo-500/30 text-indigo-300 text-xs px-3 py-1 font-mono uppercase tracking-wider">
                Sovereign Digital Platform
              </Badge>
            </div>
            <h1 className="text-3xl md:text-4xl font-display font-bold text-white tracking-tight">
              {professionConfig.title}
            </h1>
            <p className="text-slate-300 text-sm max-w-2xl mt-1.5 leading-relaxed">
              {professionConfig.subtitle}
            </p>
          </div>

          {/* Profession Selector Tabs */}
          <div className="bg-slate-900/80 backdrop-blur-md p-1.5 rounded-2xl border border-white/10 shrink-0 self-start md:self-auto shadow-lg">
            <div className="grid grid-cols-3 gap-1">
              <button
                onClick={() => setActiveProfession("musician")}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                  activeProfession === "musician"
                    ? "bg-gold text-white shadow-lg shadow-gold/25 font-bold"
                    : "text-slate-300 hover:text-white hover:bg-white/5"
                }`}
              >
                <Music className="w-4 h-4" /> Musicians
              </button>
              <button
                onClick={() => setActiveProfession("filmmaker")}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                  activeProfession === "filmmaker"
                    ? "bg-indigo-600 text-white shadow-lg font-bold"
                    : "text-slate-300 hover:text-white hover:bg-white/5"
                }`}
              >
                <Film className="w-4 h-4" /> Filmmakers
              </button>
              <button
                onClick={() => setActiveProfession("author")}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                  activeProfession === "author"
                    ? "bg-emerald-600 text-white shadow-lg font-bold"
                    : "text-slate-300 hover:text-white hover:bg-white/5"
                }`}
              >
                <BookOpen className="w-4 h-4" /> Authors
              </button>
            </div>
          </div>
        </div>

        {/* DASHBOARD NAVIGATION BAR */}
        <div className="flex flex-wrap items-center gap-2 mt-8 pt-6 border-t border-white/10 relative z-10">
          <button
            onClick={() => setDashboardTab("overview")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              dashboardTab === "overview"
                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30"
                : "bg-white/5 text-slate-300 hover:text-white hover:bg-white/10 border border-white/5"
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            Overview & Quick Notes
          </button>
          <button
            onClick={() => setDashboardTab("projects")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              dashboardTab === "projects"
                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30"
                : "bg-white/5 text-slate-300 hover:text-white hover:bg-white/10 border border-white/5"
            }`}
          >
            <FolderGit2 className="w-3.5 h-3.5" />
            Project Catalog ({filteredProjects.length})
          </button>
          <button
            onClick={() => setDashboardTab("analytics")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              dashboardTab === "analytics"
                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30"
                : "bg-white/5 text-slate-300 hover:text-white hover:bg-white/10 border border-white/5"
            }`}
          >
            <PieChart className="w-3.5 h-3.5" />
            Audience & Analytics
          </button>
          <button
            onClick={() => setDashboardTab("toolkit")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              dashboardTab === "toolkit"
                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30"
                : "bg-white/5 text-slate-300 hover:text-white hover:bg-white/10 border border-white/5"
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-gold" />
            {activeProfession.toUpperCase()} Toolkit
          </button>
          <button
            onClick={() => setShowEPKModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-gold hover:bg-gold-light text-white ml-auto transition-all shadow-lg shadow-gold/25"
          >
            <FileText className="w-3.5 h-3.5" />
            Launch {professionConfig.epkTitle}
          </button>
        </div>
      </div>

      {/* TAB CONTENT 1: OVERVIEW TAB (Includes Local Storage 'Quick Notes' Section) */}
      {dashboardTab === "overview" && (
        <OverviewTab
          activeProfession={activeProfession}
          professionConfig={professionConfig}
          aggregateMetrics={aggregateMetrics}
          projects={filteredProjects}
          onOpenEPK={() => setShowEPKModal(true)}
          onOpenAddProject={() => {
            setNewCategory(professionConfig.categories[0]);
            setShowAddProjectModal(true);
          }}
        />
      )}

      {/* TAB CONTENT 2: PROJECTS & CATALOG */}
      {dashboardTab === "projects" && (
        <div className="space-y-6">
          <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-6 shadow-xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
              <div>
                <h3 className="text-xl font-bold font-display text-white tracking-tight flex items-center gap-2">
                  <professionConfig.icon className="w-5 h-5 text-gold" />
                  Project Gallery & Catalog
                </h3>
                <p className="text-xs text-slate-400">
                  Your central repository for releases, screeners, and manuscripts.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  className="bg-gold hover:bg-gold-light text-white font-bold text-xs gap-1.5 rounded-xl shadow-lg shadow-gold/25"
                  onClick={() => {
                    setNewCategory(professionConfig.categories[0]);
                    setShowAddProjectModal(true);
                  }}
                >
                  <Plus className="w-4 h-4" /> Add New Project
                </Button>
              </div>
            </div>

            {filteredProjects.length === 0 ? (
              <div className="text-center py-12 border border-dashed border-white/10 rounded-2xl bg-white/[0.01]">
                <professionConfig.icon className="w-10 h-10 text-slate-500 mx-auto mb-2 opacity-50" />
                <p className="text-sm font-semibold text-white">No projects found for {activeProfession}s</p>
                <p className="text-xs text-slate-400 mt-1">Click "Add New Project" above to create your first item.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredProjects.map(project => (
                  <div
                    key={project.id}
                    className="group bg-slate-900/60 border border-white/10 hover:border-amber-400/40 rounded-2xl p-5 transition-all flex flex-col justify-between space-y-4 shadow-lg backdrop-blur-md"
                  >
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <Badge
                          variant="outline"
                          className={`text-[10px] font-mono px-2 py-0.5 ${
                            project.status === "Released"
                              ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                              : project.status === "Pre-Order"
                              ? "bg-amber-500/20 text-amber-300 border-amber-500/30"
                              : "bg-indigo-500/20 text-indigo-300 border-indigo-500/30"
                          }`}
                        >
                          {project.status}
                        </Badge>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {project.category}
                        </span>
                      </div>

                      <h3 className="font-bold text-base text-white group-hover:text-amber-300 transition-colors font-display">
                        {project.title}
                      </h3>

                      {project.featuredTrackOrTrailer && (
                        <div className="flex items-center gap-2 p-2 rounded-lg bg-black/40 text-xs text-slate-300 font-mono border border-white/5">
                          <Play className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                          <span className="truncate">{project.featuredTrackOrTrailer}</span>
                        </div>
                      )}
                    </div>

                    <div className="pt-3 border-t border-white/10 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-400 font-mono">
                          {activeProfession === "musician" ? "Streams" : activeProfession === "filmmaker" ? "Views" : "Sales"}:
                        </span>
                        <span className="font-bold text-white font-mono">
                          {project.playsOrViewsOrSales.toLocaleString()}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-400 font-mono">Revenue:</span>
                        <span className="font-bold text-amber-400 font-mono">
                          ${project.revenue.toLocaleString()}
                        </span>
                      </div>

                      <div className="flex items-center justify-between pt-2">
                        <button
                          onClick={() => toggleEPKLink(project.id)}
                          className={`text-[11px] font-mono flex items-center gap-1.5 transition-colors ${
                            project.epkLinked ? "text-emerald-400 font-semibold" : "text-slate-400 hover:text-white"
                          }`}
                        >
                          <CheckCircle2 className={`w-3.5 h-3.5 ${project.epkLinked ? "text-emerald-400" : "text-slate-400"}`} />
                          {project.epkLinked ? "In Press Kit" : "Link to EPK"}
                        </button>

                        <span className="text-[10px] text-slate-400 font-mono">
                          Date: {project.releaseDate}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB CONTENT 3: AUDIENCE & ANALYTICS */}
      {dashboardTab === "analytics" && (
        <div className="space-y-6">
          <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-6 shadow-xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
              <div>
                <h3 className="text-xl font-bold font-display text-white tracking-tight flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-indigo-400" />
                  Audience & Engagement Analytics
                </h3>
                <p className="text-xs text-slate-400">
                  Real-time audience demographic, geographic, and retention metrics.
                </p>
              </div>

              <div className="flex items-center gap-1 bg-white/5 p-1 rounded-xl border border-white/10">
                {(["7d", "30d", "1y", "all"] as const).map(range => (
                  <button
                    key={range}
                    onClick={() => setTimeRange(range)}
                    className={`px-3 py-1 text-xs font-mono rounded-lg transition-colors ${
                      timeRange === range
                        ? "bg-indigo-600 text-white font-bold"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    {range.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-slate-900/60 border border-white/10 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-mono">Mailing List Subscribers</span>
                  <span className="text-emerald-400 font-bold font-mono">+12.5%</span>
                </div>
                <p className="text-2xl font-bold font-display text-white">14,280</p>
                <Progress value={78} className="h-1.5 bg-white/10" />
                <p className="text-[10px] text-slate-400">78% opened latest broadcast</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/60 border border-white/10 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-mono">Direct Website Conversion</span>
                  <span className="text-amber-400 font-bold font-mono">+4.2%</span>
                </div>
                <p className="text-2xl font-bold font-display text-white">8.4%</p>
                <Progress value={62} className="h-1.5 bg-white/10" />
                <p className="text-[10px] text-slate-400">High merch / pre-order clickthrough</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/60 border border-white/10 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-mono">Top Traffic Region</span>
                  <Globe className="w-3.5 h-3.5 text-indigo-400" />
                </div>
                <p className="text-2xl font-bold font-display text-white">United States & EU</p>
                <Progress value={85} className="h-1.5 bg-white/10" />
                <p className="text-[10px] text-slate-400">64% USA, 21% Europe, 15% Other</p>
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-xs font-mono uppercase tracking-wider text-slate-300 font-semibold">
                Audience Channel Breakdown
              </p>

              <div className="space-y-2">
                {[
                  { channel: activeProfession === "musician" ? "Spotify / Apple Music" : activeProfession === "filmmaker" ? "Vimeo / YouTube Pro" : "Amazon Kindle / Audible", share: "52%", volume: "142,000", growth: "+14%" },
                  { channel: "Direct Band Site / Monolith", share: "31%", volume: "85,400", growth: "+22%" },
                  { channel: activeProfession === "musician" ? "Bandcamp / Direct Merch" : activeProfession === "filmmaker" ? "FilmFreeway / Screener Portals" : "Substack / Direct Newsletter", share: "17%", volume: "46,800", growth: "+9%" },
                ].map((row, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-white/10 text-xs">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-amber-400" />
                      <span className="font-semibold text-white">{row.channel}</span>
                    </div>
                    <div className="flex items-center gap-6 font-mono text-slate-300">
                      <span>{row.volume} units</span>
                      <span className="text-white font-bold">{row.share}</span>
                      <span className="text-emerald-400">{row.growth}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT 4: TOOLKIT */}
      {dashboardTab === "toolkit" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-6 shadow-xl space-y-4">
              <div className="border-b border-white/10 pb-3">
                <h3 className="text-lg font-bold font-display text-white flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-400" />
                  {activeProfession.toUpperCase()} Specialized Tools
                </h3>
                <p className="text-xs text-slate-400">Features tuned for your medium</p>
              </div>

              <div className="space-y-3">
                {activeProfession === "musician" && (
                  <>
                    <div className="p-3.5 rounded-xl bg-slate-900/60 border border-white/10 space-y-1">
                      <p className="text-xs font-semibold text-white flex items-center gap-2">
                        <Radio className="w-3.5 h-3.5 text-amber-400" /> Tour & Gig Calendar Sync
                      </p>
                      <p className="text-[11px] text-slate-300">Auto-sync Bandsintown & Songkick dates directly to your site.</p>
                    </div>
                    <div className="p-3.5 rounded-xl bg-slate-900/60 border border-white/10 space-y-1">
                      <p className="text-xs font-semibold text-white flex items-center gap-2">
                        <Music className="w-3.5 h-3.5 text-indigo-400" /> Embedded Audio Players
                      </p>
                      <p className="text-[11px] text-slate-300">High-res 24-bit lossless playback with wave visualizers.</p>
                    </div>
                  </>
                )}

                {activeProfession === "filmmaker" && (
                  <>
                    <div className="p-3.5 rounded-xl bg-slate-900/60 border border-white/10 space-y-1">
                      <p className="text-xs font-semibold text-white flex items-center gap-2">
                        <Film className="w-3.5 h-3.5 text-indigo-400" /> Password-Protected Screeners
                      </p>
                      <p className="text-[11px] text-slate-300">Secure watermarked video streams for film festival judges.</p>
                    </div>
                    <div className="p-3.5 rounded-xl bg-slate-900/60 border border-white/10 space-y-1">
                      <p className="text-xs font-semibold text-white flex items-center gap-2">
                        <FileText className="w-3.5 h-3.5 text-amber-400" /> Call Sheets & Crew Roster
                      </p>
                      <p className="text-[11px] text-slate-300">Distribute daily shoot schedules and location maps.</p>
                    </div>
                  </>
                )}

                {activeProfession === "author" && (
                  <>
                    <div className="p-3.5 rounded-xl bg-slate-900/60 border border-white/10 space-y-1">
                      <p className="text-xs font-semibold text-white flex items-center gap-2">
                        <BookOpen className="w-3.5 h-3.5 text-emerald-400" /> Interactive Sample Reader
                      </p>
                      <p className="text-[11px] text-slate-300">Let visitors read Chapter 1 in a beautiful flipbook viewer.</p>
                    </div>
                    <div className="p-3.5 rounded-xl bg-slate-900/60 border border-white/10 space-y-1">
                      <p className="text-xs font-semibold text-white flex items-center gap-2">
                        <Heart className="w-3.5 h-3.5 text-rose-400" /> Signed Copy Pre-Orders
                      </p>
                      <p className="text-[11px] text-slate-300">Collect orders directly with custom inscription requests.</p>
                    </div>
                  </>
                )}
              </div>

              <Button
                variant="outline"
                className="w-full bg-white/5 border-white/10 text-white hover:bg-white/10 text-xs font-semibold rounded-xl"
                onClick={() => setShowEPKModal(true)}
              >
                <FileText className="w-3.5 h-3.5 mr-1.5 text-amber-400" />
                Launch {professionConfig.epkTitle}
              </Button>
            </div>

            <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-6 shadow-xl space-y-4">
              <div className="border-b border-white/10 pb-3">
                <h3 className="text-lg font-bold font-display text-white flex items-center gap-2">
                  <FileText className="w-4 h-4 text-amber-400" />
                  Electronic Press Kit (EPK) Summary
                </h3>
                <p className="text-xs text-slate-400">Media kit completeness & media assets</p>
              </div>

              <div className="space-y-3">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-300">EPK Completeness</span>
                    <span className="font-bold text-emerald-400 font-mono">92%</span>
                  </div>
                  <Progress value={92} className="h-2 bg-white/10" />
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between py-1.5 border-b border-white/5">
                    <span className="text-slate-300">High-Res Photos</span>
                    <Badge variant="outline" className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 text-[10px]">
                      Ready (5)
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between py-1.5 border-b border-white/5">
                    <span className="text-slate-300">Official Bio</span>
                    <Badge variant="outline" className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 text-[10px]">
                      Verified
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between py-1.5 border-b border-white/5">
                    <span className="text-slate-300">Tech Rider / Spec Sheet</span>
                    <Badge variant="outline" className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 text-[10px]">
                      Attached
                    </Badge>
                  </div>
                </div>

                <Button
                  onClick={() => setShowEPKModal(true)}
                  className="w-full bg-gold hover:bg-gold-light text-white font-bold text-xs rounded-xl shadow-lg shadow-gold/25 mt-2"
                >
                  Edit & Export EPK
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 1: ADD NEW PROJECT */}
      <Dialog open={showAddProjectModal} onOpenChange={setShowAddProjectModal}>
        <DialogContent className="bg-slate-900 border-glass-border text-white sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5 text-gold" />
              Add {activeProfession.toUpperCase()} Project
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Add a new release, film, or book to your creator catalog.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 my-2">
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Project Title</label>
              <Input
                placeholder="e.g. Echoes in the Dark"
                value={newTitle}
                onChange={e => setNewTitle(e.target.value)}
                className="bg-white/5 border-white/10 text-xs text-white"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Category</label>
              <Select value={newCategory} onValueChange={setNewCategory}>
                <SelectTrigger className="bg-white/5 border-white/10 text-xs text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-glass-border text-white">
                  {professionConfig.categories.map(cat => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">Status</label>
                <Select value={newStatus} onValueChange={(val: "In Production" | "Scheduled" | "Released" | "Pre-Order") => setNewStatus(val)}>
                  <SelectTrigger className="bg-white/5 border-white/10 text-xs text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 border-glass-border text-white">
                    <SelectItem value="In Production">In Production</SelectItem>
                    <SelectItem value="Pre-Order">Pre-Order</SelectItem>
                    <SelectItem value="Scheduled">Scheduled</SelectItem>
                    <SelectItem value="Released">Released</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">Release Date</label>
                <Input
                  type="date"
                  value={newReleaseDate}
                  onChange={e => setNewReleaseDate(e.target.value)}
                  className="bg-white/5 border-white/10 text-xs text-white"
                />
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="ghost" onClick={() => setShowAddProjectModal(false)} className="text-xs">
              Cancel
            </Button>
            <Button onClick={handleAddProject} className="bg-gold text-white hover:bg-gold-light text-xs font-semibold shadow-md shadow-gold/25">
              Add to Catalog
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* MODAL 2: FULL EPK BUILDER DIALOG */}
      <Dialog open={showEPKModal} onOpenChange={setShowEPKModal}>
        <DialogContent className="bg-slate-950 border-glass-border text-white max-w-4xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl font-display">
              <FileText className="w-5 h-5 text-gold" />
              {professionConfig.epkTitle}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Customize press assets, high-res photos, and tech riders for bookers, journalists, and festival curators.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <EPKBuilder />
          </div>

          <DialogFooter>
            <Button onClick={() => setShowEPKModal(false)} className="bg-gold text-white hover:bg-gold-light text-xs font-semibold shadow-md shadow-gold/25">
              Done Editing
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

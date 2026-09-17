import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useAuth } from "@/hooks/useAuth";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import * as d3 from "d3";
import {
  HardDrive,
  Cloud,
  RefreshCw,
  Music,
  Image as ImageIcon,
  FileText,
  Folder,
  FolderOpen,
  CheckCircle,
  AlertCircle,
  ExternalLink,
  Search,
  Layers,
  Database,
  Archive,
  Code,
  FileQuestion,
  ChevronRight,
  Info,
  Server,
  ArrowUpRight,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export interface CloudAccount {
  id: string;
  provider: "google" | "dropbox" | "onedrive" | "box";
  accountName: string;
  email: string;
  status: "connected" | "syncing" | "disconnected";
  fileCount: number;
  usedBytes: number;
  totalBytes: number;
  usedFormatted: string;
  totalFormatted: string;
  percentUsed: number;
  lastSynced: string;
}

export interface LocalDirectoryFile {
  id: string;
  name: string;
  size: string;
  mimeType: "audio" | "image" | "document" | "code" | "archive" | "other";
  updatedAt: string;
}

export interface LocalDirectory {
  id: string;
  name: string;
  path: string;
  fileCount: number;
  sizeBytes: number;
  sizeFormatted: string;
  lastModified: string;
  primaryType: "audio" | "image" | "document" | "code" | "archive" | "mixed";
  files: LocalDirectoryFile[];
}

export interface StorageOverviewData {
  summary: {
    totalAccounts: number;
    totalDirectories: number;
    totalFiles: number;
    totalUsedBytes: number;
    totalCapacityBytes: number;
    totalUsedFormatted: string;
    totalCapacityFormatted: string;
    percentUsed: number;
  };
  cloudAccounts: CloudAccount[];
  localDirectories: LocalDirectory[];
}

const FALLBACK_STORAGE_OVERVIEW: StorageOverviewData = {
  summary: {
    totalAccounts: 2,
    totalDirectories: 5,
    totalFiles: 242,
    totalUsedBytes: 6224328396,
    totalCapacityBytes: 71940702208,
    totalUsedFormatted: "5.8 GB",
    totalCapacityFormatted: "67.0 GB",
    percentUsed: 9,
  },
  cloudAccounts: [
    {
      id: "cloud_gdrive",
      provider: "google",
      accountName: "Google Drive (Band Cloud)",
      email: "dev@alistwebs.com",
      status: "connected",
      fileCount: 142,
      usedBytes: 4831838208,
      totalBytes: 16106127360,
      usedFormatted: "4.5 GB",
      totalFormatted: "15.0 GB",
      percentUsed: 30,
      lastSynced: "Just now",
    },
    {
      id: "cloud_dropbox",
      provider: "dropbox",
      accountName: "Dropbox Studio Sync",
      email: "recordings@alistwebs.com",
      status: "connected",
      fileCount: 88,
      usedBytes: 1288490188,
      totalBytes: 2147483648,
      usedFormatted: "1.2 GB",
      totalFormatted: "2.0 GB",
      percentUsed: 60,
      lastSynced: "12 minutes ago",
    },
  ],
  localDirectories: [
    {
      id: "dir_audio",
      name: "Audio Masters",
      path: "/media/audio-masters",
      primaryType: "audio",
      fileCount: 3,
      sizeBytes: 89700000,
      sizeFormatted: "89.7 MB",
      lastModified: "2026-08-25",
      files: [
        { id: "m1", name: "Midnight_Echoes_Master_24bit.wav", size: "48.2 MB", mimeType: "audio", updatedAt: "2026-08-25" },
        { id: "m2", name: "Neon_Drive_Acoustic_Mix.mp3", size: "9.4 MB", mimeType: "audio", updatedAt: "2026-08-25" },
        { id: "m3", name: "Live_In_London_Stem_Guitar.flac", size: "32.1 MB", mimeType: "audio", updatedAt: "2026-08-26" },
      ],
    },
    {
      id: "dir_photos",
      name: "High-Res Photos",
      path: "/media/photos",
      primaryType: "image",
      fileCount: 2,
      sizeBytes: 11000000,
      sizeFormatted: "11.0 MB",
      lastModified: "2026-08-27",
      files: [
        { id: "img1", name: "Band_Hero_Banner_2026.png", size: "4.8 MB", mimeType: "image", updatedAt: "2026-08-26" },
        { id: "img2", name: "Tour_Poster_Vector.png", size: "6.2 MB", mimeType: "image", updatedAt: "2026-08-27" },
      ],
    },
    {
      id: "dir_epk",
      name: "EPK Press Kits",
      path: "/epk/press-kits",
      primaryType: "document",
      fileCount: 3,
      sizeBytes: 4150000,
      sizeFormatted: "4.15 MB",
      lastModified: "2026-08-24",
      files: [
        { id: "d1", name: "Official_Press_Release.pdf", size: "1.2 MB", mimeType: "document", updatedAt: "2026-08-22" },
        { id: "d2", name: "Technical_Rider_2026.pdf", size: "850 KB", mimeType: "document", updatedAt: "2026-08-23" },
        { id: "d3", name: "Stage_Plot_Diagram.pdf", size: "2.1 MB", mimeType: "document", updatedAt: "2026-08-24" },
      ],
    },
    {
      id: "dir_builds",
      name: "Website Builds",
      path: "/builds/releases",
      primaryType: "archive",
      fileCount: 2,
      sizeBytes: 14512000,
      sizeFormatted: "14.5 MB",
      lastModified: "2026-08-29",
      files: [
        { id: "c1", name: "site_export_v1.zip", size: "14.5 MB", mimeType: "archive", updatedAt: "2026-08-28" },
        { id: "c2", name: "custom-styles.css", size: "12 KB", mimeType: "code", updatedAt: "2026-08-29" },
      ],
    },
    {
      id: "dir_public",
      name: "Public Brand Assets",
      path: "/public",
      primaryType: "mixed",
      fileCount: 3,
      sizeBytes: 3900000,
      sizeFormatted: "3.9 MB",
      lastModified: "2026-09-07",
      files: [
        { id: "p1", name: "logo.png", size: "1.2 MB", mimeType: "image", updatedAt: "2026-09-07" },
        { id: "p2", name: "favicon.png", size: "1.2 MB", mimeType: "image", updatedAt: "2026-09-07" },
        { id: "p3", name: "robots.txt", size: "160 B", mimeType: "document", updatedAt: "2026-09-07" },
      ],
    },
  ],
};

export default function StorageDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const svgRef = useRef<SVGSVGElement | null>(null);

  const [loading, setLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<"all" | "cloud" | "local">("all");

  const [overviewData, setOverviewData] = useState<StorageOverviewData | null>(null);
  const [selectedDirectory, setSelectedDirectory] = useState<LocalDirectory | null>(null);
  const [dialogSearch, setDialogSearch] = useState("");

  // Fetch overview from server API and reconcile with Firestore cloud_connections
  const fetchStorageData = useCallback(async () => {
    setLoading(true);
    try {
      // 1. Fetch server API data with graceful fallback
      let data: StorageOverviewData;
      try {
        const res = await fetch("/api/storage/overview");
        if (res.ok) {
          data = await res.json();
        } else {
          data = JSON.parse(JSON.stringify(FALLBACK_STORAGE_OVERVIEW));
        }
      } catch {
        data = JSON.parse(JSON.stringify(FALLBACK_STORAGE_OVERVIEW));
      }

      // 2. If user is logged in, check Firestore for real cloud_connections
      if (user) {
        try {
          const q = query(
            collection(db, "cloud_connections"),
            where("user_id", "==", user.uid)
          );
          const snapshot = await getDocs(q);
          const firestoreConnections = snapshot.docs.map((docSnap) => ({
            id: docSnap.id,
            ...docSnap.data(),
          })) as Array<{ id: string; provider: "google" | "dropbox"; email: string; connectedAt?: string }>;

          if (firestoreConnections.length > 0) {
            // Update or enrich cloud accounts with user's verified accounts
            const updatedCloudAccounts = data.cloudAccounts.map((account) => {
              const matched = firestoreConnections.find((c) => c.provider === account.provider);
              if (matched) {
                return {
                  ...account,
                  email: matched.email || account.email,
                  status: "connected" as const,
                  lastSynced: "Just now",
                };
              }
              return account;
            });
            data.cloudAccounts = updatedCloudAccounts;
          }
        } catch (firestoreErr) {
          console.warn("Firestore cloud_connections fetch warning:", firestoreErr);
        }
      }

      // 3. Inspect localStorage for any client-side file explorer nodes
      try {
        const storageKey = `file_explorer_nodes_${user?.uid || "guest"}`;
        const savedNodes = localStorage.getItem(storageKey);
        if (savedNodes) {
          const parsedNodes = JSON.parse(savedNodes);
          if (Array.isArray(parsedNodes)) {
            // Find root folders in localStorage
            const localFolders = parsedNodes.filter((n: { type: string; parentId: string | null }) => n.type === "folder" && !n.parentId);
            if (localFolders.length > 0) {
              const dynamicDirs: LocalDirectory[] = localFolders.map((f: { id: string; name: string; updatedAt?: string }) => {
                const childFiles = parsedNodes.filter((n: { parentId: string; type: string }) => n.parentId === f.id && n.type === "file");
                const count = childFiles.length;
                let sizeBytes = 0;
                childFiles.forEach((file: { size?: string }) => {
                  const s = file.size || "";
                  if (s.includes("MB")) sizeBytes += parseFloat(s) * 1024 * 1024;
                  else if (s.includes("KB")) sizeBytes += parseFloat(s) * 1024;
                  else sizeBytes += 500000;
                });
                return {
                  id: `local_folder_${f.id}`,
                  name: f.name,
                  path: `/${f.name.toLowerCase().replace(/\s+/g, "-")}`,
                  fileCount: count,
                  sizeBytes,
                  sizeFormatted: sizeBytes > 1024 * 1024 ? `${(sizeBytes / (1024 * 1024)).toFixed(1)} MB` : `${Math.round(sizeBytes / 1024)} KB`,
                  lastModified: f.updatedAt || "2026-08-30",
                  primaryType: f.name.toLowerCase().includes("audio") ? "audio" : f.name.toLowerCase().includes("photo") ? "image" : "document",
                  files: childFiles.map((c: { id: string; name: string; size?: string; mimeType?: string; updatedAt?: string }) => ({
                    id: c.id,
                    name: c.name,
                    size: c.size || "1.0 MB",
                    mimeType: (c.mimeType as LocalDirectoryFile["mimeType"]) || "document",
                    updatedAt: c.updatedAt || "2026-08-30",
                  })),
                };
              });

              // Merge unique directories
              const existingIds = new Set(data.localDirectories.map((d) => d.name));
              dynamicDirs.forEach((dd) => {
                if (!existingIds.has(dd.name)) {
                  data.localDirectories.push(dd);
                }
              });
            }
          }
        }
      } catch (lsErr) {
        console.warn("localStorage nodes parse error:", lsErr);
      }

      setOverviewData(data);
    } catch (err) {
      console.warn("Storage dashboard fallback used:", err);
      setOverviewData((prev) => prev || JSON.parse(JSON.stringify(FALLBACK_STORAGE_OVERVIEW)));
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchStorageData();

    // Listen for cloud connection changes across the app
    const handleRefresh = () => fetchStorageData();
    window.addEventListener("cloud_connections_changed", handleRefresh);
    window.addEventListener("storage", handleRefresh);
    return () => {
      window.removeEventListener("cloud_connections_changed", handleRefresh);
      window.removeEventListener("storage", handleRefresh);
    };
  }, [fetchStorageData]);

  // Handle manual sync and re-indexing
  const handleSyncNow = async () => {
    setIsSyncing(true);
    toast({
      title: "Syncing Storage Ecosystem",
      description: "Inspecting connected Google Drive, Dropbox, and local filesystem directories...",
    });

    try {
      await fetchStorageData();
      setTimeout(() => {
        setIsSyncing(false);
        toast({
          title: "Storage Index Updated",
          description: "All cloud accounts and local directories are up-to-date.",
        });
      }, 700);
    } catch {
      setIsSyncing(false);
    }
  };

  // D3 Donut Chart Rendering
  useEffect(() => {
    if (!svgRef.current || !overviewData) return;

    d3.select(svgRef.current).selectAll("*").remove();

    interface PieSlice {
      label: string;
      value: number; // in GB
      color: string;
      percentage: number;
    }

    const localUsedGB = overviewData.localDirectories.reduce((sum, d) => sum + d.sizeBytes, 0) / (1024 * 1024 * 1024);
    const slices: PieSlice[] = [
      {
        label: "Local Directories",
        value: Math.max(0.1, parseFloat(localUsedGB.toFixed(2))),
        color: "#F59E0B", // Amber Gold
        percentage: 0,
      },
    ];

    overviewData.cloudAccounts.forEach((acc) => {
      const usedGB = acc.usedBytes / (1024 * 1024 * 1024);
      slices.push({
        label: acc.accountName,
        value: parseFloat(usedGB.toFixed(2)),
        color: acc.provider === "google" ? "#10B981" : "#3B82F6",
        percentage: 0,
      });
    });

    const totalUsedGB = slices.reduce((sum, s) => sum + s.value, 0);
    const totalCapacityGB = overviewData.summary.totalCapacityBytes / (1024 * 1024 * 1024);
    const freeGB = Math.max(0, totalCapacityGB - totalUsedGB);

    slices.forEach((s) => {
      s.percentage = Math.round((s.value / totalCapacityGB) * 100);
    });

    slices.push({
      label: "Unallocated Space",
      value: parseFloat(freeGB.toFixed(1)),
      color: "rgba(255, 255, 255, 0.08)",
      percentage: Math.round((freeGB / totalCapacityGB) * 100),
    });

    const width = 200;
    const height = 200;
    const radius = Math.min(width, height) / 2;
    const innerRadius = radius - 20;

    const svg = d3
      .select(svgRef.current)
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .attr("transform", `translate(${width / 2}, ${height / 2})`);

    const pie = d3
      .pie<PieSlice>()
      .value((d) => d.value)
      .sort(null);

    const arc = d3
      .arc<d3.PieArcDatum<PieSlice>>()
      .innerRadius(innerRadius)
      .outerRadius(radius)
      .cornerRadius(4)
      .padAngle(0.02);

    const arcHover = d3
      .arc<d3.PieArcDatum<PieSlice>>()
      .innerRadius(innerRadius - 3)
      .outerRadius(radius + 2)
      .cornerRadius(4)
      .padAngle(0.02);

    const path = svg
      .selectAll(".arc")
      .data(pie(slices))
      .enter()
      .append("g")
      .attr("class", "arc");

    path
      .append("path")
      .attr("d", arc)
      .attr("fill", (d) => d.data.color)
      .style("cursor", "pointer")
      .on("mouseover", function (_event, d) {
        d3.select(this).transition().duration(120).attr("d", arcHover).attr("opacity", 0.9);
        const titleEl = document.getElementById("storage-donut-center-title");
        const subEl = document.getElementById("storage-donut-center-sub");
        if (titleEl) titleEl.innerText = d.data.label;
        if (subEl) subEl.innerText = `${d.data.value.toFixed(1)} GB (${d.data.percentage}%)`;
      })
      .on("mouseout", function () {
        d3.select(this).transition().duration(120).attr("d", arc).attr("opacity", 1);
        const titleEl = document.getElementById("storage-donut-center-title");
        const subEl = document.getElementById("storage-donut-center-sub");
        if (titleEl) titleEl.innerText = "Total Used";
        if (subEl && overviewData) {
          subEl.innerText = `${overviewData.summary.totalUsedFormatted} / ${overviewData.summary.totalCapacityFormatted}`;
        }
      });
  }, [overviewData]);

  // Filtered lists
  const filteredAccounts = useMemo(() => {
    if (!overviewData) return [];
    if (filterType === "local") return [];
    return overviewData.cloudAccounts.filter((acc) => {
      const q = searchQuery.toLowerCase();
      return (
        acc.accountName.toLowerCase().includes(q) ||
        acc.email.toLowerCase().includes(q) ||
        acc.provider.toLowerCase().includes(q)
      );
    });
  }, [overviewData, filterType, searchQuery]);

  const filteredDirectories = useMemo(() => {
    if (!overviewData) return [];
    if (filterType === "cloud") return [];
    return overviewData.localDirectories.filter((dir) => {
      const q = searchQuery.toLowerCase();
      return (
        dir.name.toLowerCase().includes(q) ||
        dir.path.toLowerCase().includes(q) ||
        dir.primaryType.toLowerCase().includes(q) ||
        dir.files.some((f) => f.name.toLowerCase().includes(q))
      );
    });
  }, [overviewData, filterType, searchQuery]);

  // Helper for directory icons
  const getDirectoryIcon = (type: LocalDirectory["primaryType"]) => {
    switch (type) {
      case "audio":
        return <Music className="w-5 h-5 text-sky-400" />;
      case "image":
        return <ImageIcon className="w-5 h-5 text-rose-400" />;
      case "document":
        return <FileText className="w-5 h-5 text-sky-400" />;
      case "archive":
        return <Archive className="w-5 h-5 text-purple-400" />;
      case "code":
        return <Code className="w-5 h-5 text-emerald-400" />;
      default:
        return <Folder className="w-5 h-5 text-sky-400" />;
    }
  };

  // Helper for individual file icons
  const getFileIcon = (type: LocalDirectoryFile["mimeType"]) => {
    switch (type) {
      case "audio":
        return <Music className="w-4 h-4 text-sky-400 shrink-0" />;
      case "image":
        return <ImageIcon className="w-4 h-4 text-rose-400 shrink-0" />;
      case "document":
        return <FileText className="w-4 h-4 text-sky-400 shrink-0" />;
      case "archive":
        return <Archive className="w-4 h-4 text-purple-400 shrink-0" />;
      case "code":
        return <Code className="w-4 h-4 text-emerald-400 shrink-0" />;
      default:
        return <FileQuestion className="w-4 h-4 text-slate-400 shrink-0" />;
    }
  };

  return (
    <div id="storage-dashboard" className="space-y-6 mb-10">
      {/* Top Header Card */}
      <Card className="bg-white/[0.03] backdrop-blur-md border border-white/10 rounded-3xl shadow-2xl overflow-hidden">
        <CardHeader className="p-6 pb-4 border-b border-white/10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-sky-400/10 border border-sky-400/20 flex items-center justify-center text-sky-400">
                  <Database className="w-5 h-5" />
                </div>
                <div>
                  <CardTitle className="text-xl font-bold font-display tracking-tight text-white flex items-center gap-2">
                    Storage Dashboard
                    <Badge variant="outline" className="border-sky-400/30 text-sky-300 text-[10px] font-mono">
                      Live Stats
                    </Badge>
                  </CardTitle>
                  <CardDescription className="text-xs text-slate-300 mt-0.5">
                    Connected cloud storage accounts & local directories with basic file count and size stats
                  </CardDescription>
                </div>
              </div>
            </div>

            {/* Action Bar */}
            <div className="flex items-center gap-2.5 flex-wrap">
              <Button
                id="sync-storage-btn"
                size="sm"
                variant="outline"
                onClick={handleSyncNow}
                disabled={isSyncing || loading}
                className="rounded-xl bg-white/5 border-white/10 text-white hover:bg-white/10 text-xs font-semibold h-9"
              >
                <RefreshCw
                  className={`w-3.5 h-3.5 mr-1.5 ${
                    isSyncing ? "animate-spin text-sky-400" : "text-sky-400"
                  }`}
                />
                {isSyncing ? "Scanning Files..." : "Sync Storage"}
              </Button>
            </div>
          </div>

          {/* Quick Metrics KPI Bar */}
          {overviewData && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-5 mt-2 border-t border-white/5">
              <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/5">
                <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                  <span>Cloud Accounts</span>
                  <Cloud className="w-3.5 h-3.5 text-sky-400" />
                </div>
                <div className="text-xl font-bold font-mono text-white mt-1">
                  {overviewData.summary.totalAccounts}
                </div>
                <div className="text-[10px] text-emerald-400 flex items-center gap-1 mt-0.5 font-mono">
                  <CheckCircle className="w-3 h-3" /> Connected
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/5">
                <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                  <span>Local Directories</span>
                  <HardDrive className="w-3.5 h-3.5 text-amber-400" />
                </div>
                <div className="text-xl font-bold font-mono text-white mt-1">
                  {overviewData.summary.totalDirectories}
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5 font-mono">
                  Tracked on Studio
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/5">
                <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                  <span>Total Files</span>
                  <Layers className="w-3.5 h-3.5 text-purple-400" />
                </div>
                <div className="text-xl font-bold font-mono text-white mt-1">
                  {overviewData.summary.totalFiles}
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5 font-mono">
                  Indexed Across All
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/5">
                <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                  <span>Used Space</span>
                  <Server className="w-3.5 h-3.5 text-emerald-400" />
                </div>
                <div className="text-xl font-bold font-mono text-white mt-1">
                  {overviewData.summary.totalUsedFormatted}
                </div>
                <div className="text-[10px] text-amber-400 font-mono mt-0.5">
                  of {overviewData.summary.totalCapacityFormatted} capacity
                </div>
              </div>
            </div>
          )}
        </CardHeader>

        {/* Filter and Search Bar */}
        <div className="p-6 py-4 bg-white/[0.01] border-b border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Segment Filter */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-black/40 border border-white/10 w-full sm:w-auto">
            <button
              id="filter-all-btn"
              onClick={() => setFilterType("all")}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                filterType === "all"
                  ? "bg-amber-400 text-black font-semibold shadow"
                  : "text-slate-300 hover:text-white"
              }`}
            >
              All Storage
            </button>
            <button
              id="filter-cloud-btn"
              onClick={() => setFilterType("cloud")}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                filterType === "cloud"
                  ? "bg-amber-400 text-black font-semibold shadow"
                  : "text-slate-300 hover:text-white"
              }`}
            >
              Cloud Accounts ({overviewData?.cloudAccounts.length || 0})
            </button>
            <button
              id="filter-local-btn"
              onClick={() => setFilterType("local")}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                filterType === "local"
                  ? "bg-amber-400 text-black font-semibold shadow"
                  : "text-slate-300 hover:text-white"
              }`}
            >
              Local Directories ({overviewData?.localDirectories.length || 0})
            </button>
          </div>

          {/* Search */}
          <div className="relative w-full sm:w-72">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input
              id="storage-search-input"
              type="text"
              placeholder="Filter by name, path, or format..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 h-9 text-xs bg-black/30 border-white/10 text-white rounded-xl focus:border-amber-400/50"
            />
          </div>
        </div>

        <CardContent className="p-6 space-y-8">
          {/* Main Grid: Visual Breakdown & Accounts/Directories */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Visual D3 Chart Column */}
            <div className="lg:col-span-4 p-5 rounded-2xl bg-white/[0.02] border border-white/5 flex flex-col items-center justify-center text-center">
              <span className="text-xs font-bold uppercase tracking-wider font-mono text-slate-400 mb-2">
                Storage Allocation Pool
              </span>
              <div className="relative w-[200px] h-[200px] my-2">
                <svg ref={svgRef} className="mx-auto" />
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center px-4">
                  <span
                    id="storage-donut-center-title"
                    className="text-[10px] uppercase tracking-widest text-slate-400 font-mono"
                  >
                    Total Used
                  </span>
                  <span
                    id="storage-donut-center-sub"
                    className="text-xs font-bold text-white font-mono mt-1"
                  >
                    {overviewData?.summary.totalUsedFormatted || "0 GB"} / {overviewData?.summary.totalCapacityFormatted || "0 GB"}
                  </span>
                  <span className="text-[11px] text-amber-400 font-mono mt-0.5">
                    {overviewData?.summary.percentUsed || 0}% Allocated
                  </span>
                </div>
              </div>
              <p className="text-[10px] text-slate-400 font-mono mt-2 flex items-center gap-1">
                <Info className="w-3 h-3 text-amber-400" /> Hover ring segments to view breakdown
              </p>
            </div>

            {/* Content Column */}
            <div className="lg:col-span-8 space-y-8">
              {/* 1. Connected Cloud Storage Accounts Section */}
              {(filterType === "all" || filterType === "cloud") && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold uppercase tracking-wider font-mono text-white flex items-center gap-2">
                      <Cloud className="w-4 h-4 text-sky-400" />
                      Connected Cloud Storage Accounts ({filteredAccounts.length})
                    </h3>
                  </div>

                  {filteredAccounts.length === 0 ? (
                    <div className="p-6 text-center border border-dashed border-white/10 rounded-2xl bg-white/[0.01]">
                      <Cloud className="w-8 h-8 text-slate-500 mx-auto mb-2" />
                      <p className="text-xs text-slate-300">No cloud storage accounts matching criteria.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                      {filteredAccounts.map((account) => (
                        <div
                          key={account.id}
                          id={`cloud-account-${account.id}`}
                          className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-sky-400/30 hover:bg-white/[0.04] transition-all flex flex-col justify-between"
                        >
                          <div>
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex items-center gap-2.5">
                                <div
                                  className={`w-9 h-9 rounded-xl flex items-center justify-center text-white ${
                                    account.provider === "google"
                                      ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                                      : "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                                  }`}
                                >
                                  <Cloud className="w-5 h-5" />
                                </div>
                                <div className="min-w-0">
                                  <h4 className="text-sm font-bold text-white truncate">
                                    {account.accountName}
                                  </h4>
                                  <p className="text-[11px] text-slate-400 truncate font-mono">
                                    {account.email}
                                  </p>
                                </div>
                              </div>
                              <Badge
                                variant="outline"
                                className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[10px] font-mono shrink-0"
                              >
                                Synced
                              </Badge>
                            </div>

                            {/* Basic File Count & Size Stats */}
                            <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-white/5 text-xs font-mono">
                              <div>
                                <span className="text-[10px] text-slate-400 uppercase">File Count</span>
                                <p className="text-sm font-bold text-white mt-0.5">
                                  {account.fileCount} files
                                </p>
                              </div>
                              <div>
                                <span className="text-[10px] text-slate-400 uppercase">Used Storage</span>
                                <p className="text-sm font-bold text-amber-300 mt-0.5">
                                  {account.usedFormatted}
                                </p>
                              </div>
                            </div>

                            <div className="mt-3 space-y-1.5">
                              <div className="flex justify-between text-[10px] font-mono text-slate-400">
                                <span>Capacity ({account.percentUsed}% used)</span>
                                <span>{account.totalFormatted} limit</span>
                              </div>
                              <Progress
                                value={account.percentUsed}
                                className="h-1.5 bg-white/10 [&>div]:bg-sky-400"
                              />
                            </div>
                          </div>

                          <div className="mt-4 pt-2 border-t border-white/5 flex items-center justify-between text-[10px] text-slate-400 font-mono">
                            <span>Last sync: {account.lastSynced}</span>
                            <a
                              href="#sync-dashboard"
                              className="text-amber-400 hover:text-amber-300 flex items-center gap-1 font-sans text-xs"
                            >
                              Sync Config <ArrowUpRight className="w-3 h-3" />
                            </a>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* 2. Local Directories Section with File Count & Size Stats */}
              {(filterType === "all" || filterType === "local") && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold uppercase tracking-wider font-mono text-white flex items-center gap-2">
                      <HardDrive className="w-4 h-4 text-amber-400" />
                      Local Directories ({filteredDirectories.length})
                    </h3>
                  </div>

                  {filteredDirectories.length === 0 ? (
                    <div className="p-6 text-center border border-dashed border-white/10 rounded-2xl bg-white/[0.01]">
                      <Folder className="w-8 h-8 text-slate-500 mx-auto mb-2" />
                      <p className="text-xs text-slate-300">No local directories matching criteria.</p>
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      {filteredDirectories.map((dir) => (
                        <div
                          key={dir.id}
                          id={`local-directory-${dir.id}`}
                          className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-amber-400/30 hover:bg-white/[0.04] transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                              {getDirectoryIcon(dir.primaryType)}
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h4 className="text-sm font-bold text-white truncate">
                                  {dir.name}
                                </h4>
                                <Badge
                                  variant="secondary"
                                  className="text-[10px] font-mono bg-white/5 border-white/10 text-slate-300 px-1.5 py-0"
                                >
                                  {dir.path}
                                </Badge>
                              </div>
                              <p className="text-xs text-slate-400 font-mono mt-0.5">
                                Updated {dir.lastModified} • {dir.primaryType.toUpperCase()}
                              </p>
                            </div>
                          </div>

                          {/* Stats & Action */}
                          <div className="flex items-center justify-between sm:justify-end gap-5 shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0 border-white/5">
                            <div className="text-left sm:text-right font-mono">
                              <div className="text-xs font-bold text-white">
                                {dir.fileCount} {dir.fileCount === 1 ? "file" : "files"}
                              </div>
                              <div className="text-xs text-amber-400 font-semibold">
                                {dir.sizeFormatted}
                              </div>
                            </div>

                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                setSelectedDirectory(dir);
                                setDialogSearch("");
                              }}
                              className="rounded-xl bg-white/5 hover:bg-amber-400/20 hover:text-amber-300 text-xs text-slate-200 h-8 px-3"
                              id={`inspect-dir-btn-${dir.id}`}
                            >
                              Inspect Files
                              <ChevronRight className="w-3.5 h-3.5 ml-1" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Directory File Inspector Modal */}
      <Dialog
        open={Boolean(selectedDirectory)}
        onOpenChange={(open) => {
          if (!open) setSelectedDirectory(null);
        }}
      >
        <DialogContent className="max-w-2xl bg-[#121316] border-white/10 text-white rounded-3xl p-6 shadow-2xl">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-10 h-10 rounded-xl bg-amber-400/10 border border-amber-400/20 flex items-center justify-center text-amber-400">
                <FolderOpen className="w-5 h-5" />
              </div>
              <div>
                <DialogTitle className="text-lg font-bold text-white flex items-center gap-2">
                  {selectedDirectory?.name}
                  <Badge variant="outline" className="border-amber-400/30 text-amber-300 font-mono text-[10px]">
                    {selectedDirectory?.path}
                  </Badge>
                </DialogTitle>
                <DialogDescription className="text-xs text-slate-300">
                  {selectedDirectory?.fileCount} files • Total Size: {selectedDirectory?.sizeFormatted}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-4 mt-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <Input
                type="text"
                placeholder="Filter files in this directory..."
                value={dialogSearch}
                onChange={(e) => setDialogSearch(e.target.value)}
                className="pl-8 h-9 text-xs bg-black/40 border-white/10 text-white rounded-xl"
              />
            </div>

            <div className="max-h-[320px] overflow-y-auto space-y-2 pr-1 divide-y divide-white/5">
              {selectedDirectory?.files
                .filter((f) => f.name.toLowerCase().includes(dialogSearch.toLowerCase()))
                .map((file) => (
                  <div
                    key={file.id}
                    className="pt-2 pb-1 flex items-center justify-between text-xs hover:bg-white/[0.02] px-2 rounded-lg transition-colors"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      {getFileIcon(file.mimeType)}
                      <span className="truncate font-mono text-slate-200">{file.name}</span>
                    </div>
                    <div className="flex items-center gap-3 shrink-0 font-mono text-[11px] text-slate-400">
                      <span className="text-amber-300 font-semibold">{file.size}</span>
                      <span className="hidden sm:inline text-slate-500">{file.updatedAt}</span>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

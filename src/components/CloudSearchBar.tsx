import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, 
  X, 
  Folder, 
  FolderOpen, 
  File, 
  Music, 
  Image as ImageIcon, 
  FileText, 
  Code, 
  Archive, 
  Video, 
  HardDrive, 
  Cloud, 
  ExternalLink, 
  Check, 
  Copy, 
  ArrowUpRight, 
  SlidersHorizontal, 
  History, 
  Sparkles,
  CornerDownLeft,
  ChevronRight,
  Info
} from "lucide-react";
import { useCloudSearch } from "@/hooks/useCloudSearch";
import { CloudSearchItem, CloudProvider, CloudCategory } from "@/types/cloudSearch";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

interface CloudSearchBarProps {
  className?: string;
  variant?: "navbar" | "expanded" | "compact" | "icon";
}

export default function CloudSearchBar({ className = "", variant = "navbar" }: CloudSearchBarProps) {
  const { allItems, stats, connections } = useCloudSearch();
  const { toast } = useToast();

  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedProvider, setSelectedProvider] = useState<CloudProvider>("all");
  const [selectedCategory, setSelectedCategory] = useState<CloudCategory>("all");
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const [previewItem, setPreviewItem] = useState<CloudSearchItem | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Recent Searches
  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem("recent_cloud_searches");
      return saved ? JSON.parse(saved) : ["Audio Masters", "Press Kit", "wav", "Banner"];
    } catch {
      return ["Audio Masters", "Press Kit", "wav"];
    }
  });

  const inputRef = useRef<HTMLInputElement | null>(null);
  const modalInputRef = useRef<HTMLInputElement | null>(null);
  const listRef = useRef<HTMLDivElement | null>(null);

  // Save recent search
  const addRecentSearch = useCallback((term: string) => {
    const trimmed = term.trim();
    if (!trimmed) return;
    setRecentSearches(prev => {
      const next = [trimmed, ...prev.filter(s => s.toLowerCase() !== trimmed.toLowerCase())].slice(0, 6);
      localStorage.setItem("recent_cloud_searches", JSON.stringify(next));
      return next;
    });
  }, []);

  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem("recent_cloud_searches");
  };

  // Keyboard shortcut listener for Cmd+K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsOpen(prev => !prev);
      } else if (e.key === "/" && document.activeElement?.tagName !== "INPUT" && document.activeElement?.tagName !== "TEXTAREA") {
        e.preventDefault();
        setIsOpen(true);
      } else if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  // Focus modal input on open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        modalInputRef.current?.focus();
      }, 50);
      setSelectedIndex(0);
    }
  }, [isOpen]);

  // Filtered Items
  const filteredItems = useMemo(() => {
    return allItems.filter(item => {
      // Provider filter
      if (selectedProvider !== "all" && item.provider !== selectedProvider) {
        return false;
      }

      // Category filter
      if (selectedCategory !== "all") {
        if (selectedCategory === "directory") {
          if (item.type !== "directory") return false;
        } else {
          if (item.category !== selectedCategory) return false;
        }
      }

      // Text query match
      if (!query.trim()) return true;
      const q = query.toLowerCase().trim();
      const matchName = item.name.toLowerCase().includes(q);
      const matchPath = item.path.toLowerCase().includes(q);
      const matchProvider = item.providerLabel.toLowerCase().includes(q);
      const matchMime = (item.mimeType || "").toLowerCase().includes(q);

      return matchName || matchPath || matchProvider || matchMime;
    });
  }, [allItems, query, selectedProvider, selectedCategory]);

  // Split into Directories and Files for organized display
  const directoryResults = useMemo(() => {
    return filteredItems.filter(i => i.type === "directory");
  }, [filteredItems]);

  const fileResults = useMemo(() => {
    return filteredItems.filter(i => i.type === "file");
  }, [filteredItems]);

  const allOrderedResults = useMemo(() => {
    return [...directoryResults, ...fileResults];
  }, [directoryResults, fileResults]);

  // Keyboard navigation through results
  const handleKeyDownInList = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex(prev => (prev < allOrderedResults.length - 1 ? prev + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex(prev => (prev > 0 ? prev - 1 : allOrderedResults.length - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (allOrderedResults[selectedIndex]) {
        handleSelectItem(allOrderedResults[selectedIndex]);
      }
    }
  };

  // Helper: Get icon for cloud item
  const getItemIcon = (item: CloudSearchItem) => {
    if (item.type === "directory") {
      return <Folder className="w-4 h-4 text-gold shrink-0" />;
    }
    switch (item.category) {
      case "audio":
        return <Music className="w-4 h-4 text-purple-400 shrink-0" />;
      case "image":
        return <ImageIcon className="w-4 h-4 text-emerald-400 shrink-0" />;
      case "document":
        return <FileText className="w-4 h-4 text-blue-400 shrink-0" />;
      case "code":
        return <Code className="w-4 h-4 text-amber-400 shrink-0" />;
      case "archive":
        return <Archive className="w-4 h-4 text-rose-400 shrink-0" />;
      case "video":
        return <Video className="w-4 h-4 text-cyan-400 shrink-0" />;
      default:
        return <File className="w-4 h-4 text-zinc-400 shrink-0" />;
    }
  };

  // Helper: Get provider badge
  const getProviderBadge = (provider: CloudSearchItem["provider"]) => {
    switch (provider) {
      case "google":
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
            <Cloud className="w-3 h-3 text-emerald-400" />
            Google Drive
          </span>
        );
      case "dropbox":
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-medium text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 rounded-full">
            <Cloud className="w-3 h-3 text-blue-400" />
            Dropbox
          </span>
        );
      case "studio":
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-medium text-gold bg-gold/10 border border-gold/20 px-2 py-0.5 rounded-full">
            <HardDrive className="w-3 h-3 text-gold" />
            Studio Storage
          </span>
        );
    }
  };

  // Action: Select / Open Item
  const handleSelectItem = (item: CloudSearchItem) => {
    if (query.trim()) {
      addRecentSearch(query);
    }

    if (item.provider === "studio") {
      // Dispatches custom event to FileExplorer
      window.dispatchEvent(
        new CustomEvent("open_file_explorer_node", {
          detail: {
            nodeId: item.nodeId,
            folderId: item.type === "directory" ? item.nodeId : item.folderId,
          },
        })
      );

      // Smooth scroll to File Explorer or Sync Dashboard
      const targetElement = document.getElementById("file-explorer") || document.getElementById("sync-dashboard");
      if (targetElement) {
        targetElement.scrollIntoView({ behavior: "smooth", block: "start" });
      }

      toast({
        title: item.type === "directory" ? "Directory Opened" : "File Located",
        description: `Navigated to ${item.name} in Sovereign File Explorer.`,
      });
      setIsOpen(false);
    } else {
      // Cloud connection file / directory: open details preview
      setPreviewItem(item);
    }
  };

  // Action: Copy Path
  const handleCopyPath = (item: CloudSearchItem, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    navigator.clipboard.writeText(item.path);
    setCopiedId(item.id);
    setTimeout(() => setCopiedId(null), 2000);
    toast({
      title: "Storage Path Copied",
      description: item.path,
    });
  };

  return (
    <>
      {/* Top Search Bar Input Trigger */}
      <div className={`relative ${className}`}>
        {variant === "icon" ? (
          <button
            type="button"
            id="top-cloud-search-bar-icon"
            onClick={() => setIsOpen(true)}
            className="rounded-full w-9 h-9 flex items-center justify-center text-gold hover:text-white hover:bg-white/10 transition-colors"
            title="Search files & directories across cloud storage (⌘K)"
            aria-label="Search Cloud Files"
          >
            <Search className="w-4 h-4" />
          </button>
        ) : (
          <button
            type="button"
            id="top-cloud-search-bar"
            onClick={() => setIsOpen(true)}
            className={`group flex items-center justify-between text-left transition-all duration-200 ${
              variant === "navbar"
                ? "w-44 lg:w-72 px-3 py-1.5 rounded-full bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 hover:border-gold/40 text-xs text-muted-foreground hover:text-white shadow-sm"
                : "w-full px-4 py-2.5 rounded-xl bg-card border border-glass-border hover:border-gold/40 text-sm text-muted-foreground shadow-sm"
            }`}
            title="Search files & directories across cloud storage (⌘K)"
          >
            <div className="flex items-center gap-2 truncate">
              <Search className="w-3.5 h-3.5 text-gold group-hover:scale-110 transition-transform shrink-0" />
              <span className="truncate">
                {variant === "compact" ? "Search cloud storage..." : "Search files & folders..."}
              </span>
            </div>
            <div className="flex items-center gap-1 shrink-0 ml-2">
              <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 text-[10px] font-mono font-semibold text-white/60 bg-white/5 border border-white/10 rounded">
                ⌘K
              </kbd>
            </div>
          </button>
        )}
      </div>

      {/* Cloud Search Modal / Command Palette Overlay */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[100] flex items-start justify-center pt-12 sm:pt-20 px-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-md"
            />

            {/* Modal Dialog Content */}
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: -10 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              onKeyDown={handleKeyDownInList}
              className="relative w-full max-w-3xl bg-zinc-950/95 border border-white/15 rounded-2xl shadow-2xl shadow-black/80 overflow-hidden flex flex-col max-h-[85vh] text-zinc-100 z-10"
            >
              {/* Header Search Input */}
              <div className="p-4 border-b border-white/10 flex items-center gap-3 bg-zinc-900/50">
                <Search className="w-5 h-5 text-gold shrink-0 animate-pulse" />
                <input
                  ref={modalInputRef}
                  id="cloud-search-input"
                  type="text"
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setSelectedIndex(0);
                  }}
                  placeholder="Search files, directories, audio masters, press kits across clouds..."
                  className="w-full bg-transparent text-sm sm:text-base text-white placeholder-zinc-500 focus:outline-none"
                  autoComplete="off"
                  spellCheck="false"
                />
                {query && (
                  <button
                    type="button"
                    onClick={() => {
                      setQuery("");
                      modalInputRef.current?.focus();
                    }}
                    className="p-1 rounded-md text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-2 py-1 text-xs text-zinc-400 hover:text-white border border-white/10 rounded-md hover:bg-white/5 transition-colors"
                >
                  ESC
                </button>
              </div>

              {/* Filter Chips Bar */}
              <div className="px-4 py-2.5 bg-zinc-900/30 border-b border-white/5 flex flex-wrap items-center justify-between gap-2 text-xs">
                {/* Provider Filter */}
                <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-0.5">
                  <span className="text-[11px] text-zinc-400 mr-1 flex items-center gap-1">
                    <Cloud className="w-3 h-3 text-gold/70" /> Service:
                  </span>
                  {(["all", "google", "dropbox", "studio"] as CloudProvider[]).map((prov) => {
                    const active = selectedProvider === prov;
                    const label = 
                      prov === "all" ? `All (${stats.total})` :
                      prov === "google" ? `Google Drive (${stats.googleCount})` :
                      prov === "dropbox" ? `Dropbox (${stats.dropboxCount})` :
                      `Studio (${stats.studioCount})`;

                    return (
                      <button
                        key={prov}
                        onClick={() => {
                          setSelectedProvider(prov);
                          setSelectedIndex(0);
                        }}
                        className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all ${
                          active
                            ? "bg-gold text-black font-semibold shadow-sm"
                            : "bg-white/5 text-zinc-300 hover:bg-white/10 border border-white/5"
                        }`}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>

                {/* Category Filter */}
                <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-0.5">
                  <span className="text-[11px] text-zinc-400 mr-1 flex items-center gap-1">
                    <SlidersHorizontal className="w-3 h-3 text-zinc-400" /> Type:
                  </span>
                  {(["all", "directory", "audio", "image", "document", "code"] as CloudCategory[]).map((cat) => {
                    const active = selectedCategory === cat;
                    const label = 
                      cat === "all" ? "All" :
                      cat === "directory" ? "Folders" :
                      cat === "audio" ? "Audio" :
                      cat === "image" ? "Images" :
                      cat === "document" ? "Docs" :
                      "Code";

                    return (
                      <button
                        key={cat}
                        onClick={() => {
                          setSelectedCategory(cat);
                          setSelectedIndex(0);
                        }}
                        className={`px-2 py-0.5 rounded-md text-[11px] transition-all ${
                          active
                            ? "bg-white/20 text-white font-medium border border-white/30"
                            : "text-zinc-400 hover:text-zinc-200 hover:bg-white/5"
                        }`}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Recent Searches (when query is empty) */}
              {!query.trim() && recentSearches.length > 0 && (
                <div className="px-4 py-2.5 bg-zinc-900/20 border-b border-white/5 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 overflow-x-auto scrollbar-none py-0.5">
                    <span className="text-zinc-500 flex items-center gap-1 text-[11px] shrink-0">
                      <History className="w-3 h-3" /> Recent:
                    </span>
                    {recentSearches.map((term, i) => (
                      <button
                        key={i}
                        onClick={() => {
                          setQuery(term);
                          modalInputRef.current?.focus();
                        }}
                        className="px-2 py-0.5 rounded bg-white/5 hover:bg-white/10 text-zinc-300 text-[11px] truncate max-w-[140px] transition-colors"
                      >
                        {term}
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={clearRecentSearches}
                    className="text-[10px] text-zinc-500 hover:text-zinc-300 shrink-0 ml-2 underline underline-offset-2"
                  >
                    Clear
                  </button>
                </div>
              )}

              {/* Results Container */}
              <div 
                ref={listRef}
                className="overflow-y-auto flex-1 p-3 space-y-4 max-h-[50vh] scrollbar-thin scrollbar-thumb-white/10"
              >
                {allOrderedResults.length === 0 ? (
                  <div className="py-12 px-4 text-center space-y-3">
                    <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mx-auto text-zinc-500">
                      <Search className="w-5 h-5" />
                    </div>
                    <p className="text-sm font-semibold text-zinc-300">
                      No matching files or directories found
                    </p>
                    <p className="text-xs text-zinc-500 max-w-sm mx-auto">
                      Try adjusting your search query, or clear active category and cloud service filters.
                    </p>
                    <div className="flex justify-center gap-2 pt-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setQuery("");
                          setSelectedProvider("all");
                          setSelectedCategory("all");
                        }}
                        className="text-xs border-white/10 text-zinc-300 hover:text-white"
                      >
                        Reset All Filters
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Directories & Folders Section */}
                    {directoryResults.length > 0 && (
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between px-2 text-[11px] font-semibold text-gold/90 uppercase tracking-wider">
                          <span className="flex items-center gap-1.5">
                            <Folder className="w-3.5 h-3.5 text-gold" />
                            Directories & Folders ({directoryResults.length})
                          </span>
                        </div>
                        <div className="space-y-1">
                          {directoryResults.map((item) => {
                            const itemIndex = allOrderedResults.indexOf(item);
                            const isSelected = selectedIndex === itemIndex;

                            return (
                              <div
                                key={item.id}
                                onClick={() => handleSelectItem(item)}
                                onMouseEnter={() => setSelectedIndex(itemIndex)}
                                className={`group flex items-center justify-between p-2.5 rounded-xl cursor-pointer transition-all ${
                                  isSelected
                                    ? "bg-gold/15 border border-gold/40 text-white shadow-md shadow-gold/5"
                                    : "bg-white/[0.02] hover:bg-white/[0.05] border border-white/5 text-zinc-300"
                                }`}
                              >
                                <div className="flex items-center gap-3 min-w-0 flex-1">
                                  <div className="w-8 h-8 rounded-lg bg-gold/10 flex items-center justify-center shrink-0">
                                    <FolderOpen className="w-4 h-4 text-gold" />
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-2">
                                      <span className="text-sm font-semibold text-white truncate group-hover:text-gold transition-colors">
                                        {item.name}
                                      </span>
                                      {getProviderBadge(item.provider)}
                                      {item.size && (
                                        <span className="text-[10px] text-zinc-500 font-mono hidden sm:inline">
                                          {item.size}
                                        </span>
                                      )}
                                    </div>
                                    <div className="text-[11px] text-zinc-500 truncate font-mono mt-0.5 flex items-center gap-1">
                                      <span>{item.path}</span>
                                    </div>
                                  </div>
                                </div>

                                <div className="flex items-center gap-1.5 shrink-0 ml-3">
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={(e) => handleCopyPath(item, e)}
                                    className="h-7 px-2 text-xs text-zinc-400 hover:text-white hover:bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"
                                    title="Copy Storage Path"
                                  >
                                    {copiedId === item.id ? (
                                      <Check className="w-3 h-3 text-emerald-400" />
                                    ) : (
                                      <Copy className="w-3 h-3" />
                                    )}
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant={isSelected ? "hero" : "secondary"}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleSelectItem(item);
                                    }}
                                    className="h-7 text-xs px-2.5 gap-1 rounded-lg"
                                  >
                                    <span>Open</span>
                                    <ArrowUpRight className="w-3 h-3" />
                                  </Button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Files Section */}
                    {fileResults.length > 0 && (
                      <div className="space-y-1.5 pt-1">
                        <div className="flex items-center justify-between px-2 text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
                          <span className="flex items-center gap-1.5">
                            <File className="w-3.5 h-3.5 text-zinc-400" />
                            Files ({fileResults.length})
                          </span>
                        </div>
                        <div className="space-y-1">
                          {fileResults.map((item) => {
                            const itemIndex = allOrderedResults.indexOf(item);
                            const isSelected = selectedIndex === itemIndex;

                            return (
                              <div
                                key={item.id}
                                onClick={() => handleSelectItem(item)}
                                onMouseEnter={() => setSelectedIndex(itemIndex)}
                                className={`group flex items-center justify-between p-2.5 rounded-xl cursor-pointer transition-all ${
                                  isSelected
                                    ? "bg-white/[0.08] border border-white/20 text-white shadow-sm"
                                    : "bg-white/[0.02] hover:bg-white/[0.05] border border-white/5 text-zinc-300"
                                }`}
                              >
                                <div className="flex items-center gap-3 min-w-0 flex-1">
                                  <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center shrink-0">
                                    {getItemIcon(item)}
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-2">
                                      <span className="text-sm font-medium text-white truncate group-hover:text-gold transition-colors">
                                        {item.name}
                                      </span>
                                      {getProviderBadge(item.provider)}
                                      {item.size && (
                                        <span className="text-[10px] text-zinc-400 font-mono">
                                          {item.size}
                                        </span>
                                      )}
                                    </div>
                                    <div className="text-[11px] text-zinc-500 truncate font-mono mt-0.5">
                                      {item.path}
                                    </div>
                                  </div>
                                </div>

                                <div className="flex items-center gap-1.5 shrink-0 ml-3">
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setPreviewItem(item);
                                    }}
                                    className="h-7 px-2 text-xs text-zinc-400 hover:text-white hover:bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"
                                    title="View Details"
                                  >
                                    <Info className="w-3 h-3" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={(e) => handleCopyPath(item, e)}
                                    className="h-7 px-2 text-xs text-zinc-400 hover:text-white hover:bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"
                                    title="Copy Storage Reference"
                                  >
                                    {copiedId === item.id ? (
                                      <Check className="w-3 h-3 text-emerald-400" />
                                    ) : (
                                      <Copy className="w-3 h-3" />
                                    )}
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant={isSelected ? "outline" : "ghost"}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleSelectItem(item);
                                    }}
                                    className="h-7 text-xs px-2.5 rounded-lg border-white/10"
                                  >
                                    {item.provider === "studio" ? "Locate" : "Details"}
                                  </Button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Footer Status & Navigation Shortcuts */}
              <div className="px-4 py-2.5 bg-zinc-900/80 border-t border-white/10 flex flex-wrap items-center justify-between gap-2 text-xs text-zinc-400">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span>
                      {stats.isGoogleConnected || stats.isDropboxConnected
                        ? "Connected Cloud Services Indexed"
                        : "Sovereign Studio Storage Indexed"}
                    </span>
                  </div>
                  <span className="text-zinc-600 hidden sm:inline">•</span>
                  <span className="text-zinc-500 hidden sm:inline">
                    {stats.files} files across {stats.directories} directories
                  </span>
                </div>

                <div className="flex items-center gap-3 text-[11px] text-zinc-500 font-mono">
                  <span className="flex items-center gap-1">
                    <kbd className="px-1 py-0.5 bg-white/5 border border-white/10 rounded">↑</kbd>
                    <kbd className="px-1 py-0.5 bg-white/5 border border-white/10 rounded">↓</kbd> navigate
                  </span>
                  <span className="flex items-center gap-1">
                    <kbd className="px-1 py-0.5 bg-white/5 border border-white/10 rounded">↵</kbd> select
                  </span>
                  <span className="flex items-center gap-1">
                    <kbd className="px-1 py-0.5 bg-white/5 border border-white/10 rounded">esc</kbd> close
                  </span>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* File & Directory Details Preview Dialog */}
      <Dialog open={!!previewItem} onOpenChange={(open) => !open && setPreviewItem(null)}>
        <DialogContent className="sm:max-w-[500px] bg-zinc-950 border-glass-border text-white">
          <DialogHeader>
            <div className="flex items-center gap-2 mb-1">
              {previewItem && getItemIcon(previewItem)}
              <DialogTitle className="text-lg font-bold truncate">
                {previewItem?.name}
              </DialogTitle>
            </div>
            <DialogDescription className="text-xs text-zinc-400">
              Storage object details and cross-cloud reference
            </DialogDescription>
          </DialogHeader>

          {previewItem && (
            <div className="space-y-3 py-2 text-xs">
              <div className="bg-white/[0.03] border border-white/5 rounded-xl p-3 space-y-2">
                <div className="flex justify-between items-center py-1 border-b border-white/5">
                  <span className="text-zinc-400">Cloud Provider:</span>
                  <span className="font-semibold text-white flex items-center gap-1">
                    {getProviderBadge(previewItem.provider)}
                  </span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-white/5">
                  <span className="text-zinc-400">Linked Account:</span>
                  <span className="font-mono text-zinc-300">{previewItem.accountEmail}</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-white/5">
                  <span className="text-zinc-400">Object Type:</span>
                  <span className="capitalize font-semibold text-gold">{previewItem.type}</span>
                </div>
                {previewItem.size && (
                  <div className="flex justify-between items-center py-1 border-b border-white/5">
                    <span className="text-zinc-400">Size:</span>
                    <span className="font-mono text-zinc-300">{previewItem.size}</span>
                  </div>
                )}
                {previewItem.updatedAt && (
                  <div className="flex justify-between items-center py-1 border-b border-white/5">
                    <span className="text-zinc-400">Last Updated:</span>
                    <span className="font-mono text-zinc-300">{previewItem.updatedAt}</span>
                  </div>
                )}
                <div className="py-1">
                  <span className="text-zinc-400 block mb-1">Storage Path:</span>
                  <div className="bg-black/40 border border-white/10 rounded-lg p-2 font-mono text-[11px] text-zinc-300 break-all select-all flex items-center justify-between gap-2">
                    <span>{previewItem.path}</span>
                    <button
                      onClick={() => handleCopyPath(previewItem)}
                      className="text-zinc-400 hover:text-white shrink-0"
                      title="Copy"
                    >
                      {copiedId === previewItem.id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                if (previewItem) handleCopyPath(previewItem);
              }}
              className="border-white/10 text-xs"
            >
              <Copy className="w-3.5 h-3.5 mr-1.5" />
              Copy Reference
            </Button>

            {previewItem?.provider === "studio" ? (
              <Button
                variant="hero"
                size="sm"
                onClick={() => {
                  if (previewItem) handleSelectItem(previewItem);
                  setPreviewItem(null);
                }}
                className="text-xs font-semibold"
              >
                Reveal in File Explorer
              </Button>
            ) : (
              <Button
                variant="hero"
                size="sm"
                onClick={() => {
                  const cloudHub = document.getElementById("cloud-connections");
                  if (cloudHub) {
                    cloudHub.scrollIntoView({ behavior: "smooth", block: "start" });
                  }
                  toast({
                    title: "Cloud Hub",
                    description: `Browsing ${previewItem?.providerLabel} assets.`,
                  });
                  setPreviewItem(null);
                  setIsOpen(false);
                }}
                className="text-xs font-semibold"
              >
                Open in Cloud Integration Hub
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

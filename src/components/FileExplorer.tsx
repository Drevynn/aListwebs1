import React, { useState, useEffect, useMemo } from "react";
import { 
  Folder, 
  FolderOpen, 
  File, 
  FileText, 
  Image as ImageIcon, 
  Music, 
  Code, 
  Archive, 
  ChevronRight, 
  ChevronDown, 
  Edit3, 
  FolderInput, 
  Trash2, 
  Plus, 
  Search, 
  Grid, 
  List as ListIcon, 
  Upload, 
  Check, 
  X,
  HardDrive,
  Filter,
  MoreVertical,
  Layers,
  UploadCloud,
  CheckSquare,
  Square,
  Move,
  Type
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/hooks/useAuth";

export interface FileNode {
  id: string;
  name: string;
  type: "folder" | "file";
  parentId: string | null;
  size?: string;
  updatedAt: string;
  mimeType?: "audio" | "image" | "document" | "code" | "archive" | "other";
}

const INITIAL_NODES: FileNode[] = [
  { id: "f1", name: "Media Assets", type: "folder", parentId: null, updatedAt: "2026-07-20" },
  { id: "f2", name: "EPK Press Kits", type: "folder", parentId: null, updatedAt: "2026-07-22" },
  { id: "f3", name: "Audio Masters", type: "folder", parentId: "f1", updatedAt: "2026-07-25" },
  { id: "f4", name: "High-Res Photos", type: "folder", parentId: "f1", updatedAt: "2026-07-26" },
  { id: "f5", name: "Website Builds", type: "folder", parentId: null, updatedAt: "2026-07-28" },
  
  // Audio files inside f3
  { id: "m1", name: "Midnight_Echoes_Master_24bit.wav", type: "file", parentId: "f3", size: "48.2 MB", updatedAt: "2026-07-25", mimeType: "audio" },
  { id: "m2", name: "Neon_Drive_Acoustic_Mix.mp3", type: "file", parentId: "f3", size: "9.4 MB", updatedAt: "2026-07-25", mimeType: "audio" },
  { id: "m3", name: "Live_In_London_Stem_Guitar.flac", type: "file", parentId: "f3", size: "32.1 MB", updatedAt: "2026-07-26", mimeType: "audio" },

  // Photos inside f4
  { id: "img1", name: "Band_Hero_Banner_2026.png", type: "file", parentId: "f4", size: "4.8 MB", updatedAt: "2026-07-26", mimeType: "image" },
  { id: "img2", name: "Tour_Poster_Vector.png", type: "file", parentId: "f4", size: "6.2 MB", updatedAt: "2026-07-27", mimeType: "image" },

  // Docs inside f2
  { id: "d1", name: "Official_Press_Release.pdf", type: "file", parentId: "f2", size: "1.2 MB", updatedAt: "2026-07-22", mimeType: "document" },
  { id: "d2", name: "Technical_Rider_2026.pdf", type: "file", parentId: "f2", size: "850 KB", updatedAt: "2026-07-23", mimeType: "document" },
  { id: "d3", name: "Stage_Plot_Diagram.pdf", type: "file", parentId: "f2", size: "2.1 MB", updatedAt: "2026-07-24", mimeType: "document" },

  // Code inside f5
  { id: "c1", name: "site_export_v1.zip", type: "file", parentId: "f5", size: "14.5 MB", updatedAt: "2026-07-28", mimeType: "archive" },
  { id: "c2", name: "custom-styles.css", type: "file", parentId: "f5", size: "12 KB", updatedAt: "2026-07-29", mimeType: "code" },
];

export default function FileExplorer() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Storage persistence key
  const storageKey = useMemo(() => `file_explorer_nodes_${user?.uid || "guest"}`, [user]);

  const [nodes, setNodes] = useState<FileNode[]>(() => {
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // Fallback to initial
      }
    }
    return INITIAL_NODES;
  });

  // Current active folder (null = root)
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);

  // Expanded folders set in tree view
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(["f1", "f2"]));

  // Selection state
  const [selectedNodeIds, setSelectedNodeIds] = useState<Set<string>>(new Set());

  // UI States
  const [searchQuery, setSearchQuery] = useState("");
  const [mimeFilter, setMimeFilter] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");

  // Drag and Drop States
  const [isDraggingOverDropzone, setIsDraggingOverDropzone] = useState(false);
  const [dragOverFolderId, setDragOverFolderId] = useState<string | null>(null);

  // Inline rename state
  const [editingNodeId, setEditingNodeId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");

  // Single Move Modal State
  const [movingNode, setMovingNode] = useState<FileNode | null>(null);
  const [targetFolderId, setTargetFolderId] = useState<string | null>(null);

  // Batch Action Dialog States
  const [batchMoveOpen, setBatchMoveOpen] = useState(false);
  const [batchRenameOpen, setBatchRenameOpen] = useState(false);
  const [renameMode, setRenameMode] = useState<"prefix" | "replace" | "sequence">("prefix");
  const [renamePrefix, setRenamePrefix] = useState("2026_EPK");
  const [renameSearch, setRenameSearch] = useState("Draft");
  const [renameReplace, setRenameReplace] = useState("Final");
  const [renameBaseName, setRenameBaseName] = useState("Asset");

  // Create Modal State
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [createType, setCreateType] = useState<"folder" | "file">("folder");
  const [newItemName, setNewItemName] = useState("");
  const [newItemFileType, setNewItemFileType] = useState<"audio" | "image" | "document" | "code" | "archive" | "other">("document");

  // Save to localStorage when nodes change
  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(nodes));
  }, [nodes, storageKey]);

  // Reset selection on directory switch
  useEffect(() => {
    setSelectedNodeIds(new Set());
  }, [currentFolderId]);

  // Listen to external search jump events
  useEffect(() => {
    const handleOpenNode = (e: Event) => {
      const customEvent = e as CustomEvent<{ nodeId?: string; folderId?: string | null }>;
      const { nodeId, folderId } = customEvent.detail || {};
      if (folderId !== undefined) {
        setCurrentFolderId(folderId);
        if (folderId) {
          setExpandedFolders(prev => new Set(prev).add(folderId));
        }
      }
      if (nodeId) {
        setSelectedNodeIds(new Set([nodeId]));
      }
    };
    window.addEventListener("open_file_explorer_node", handleOpenNode);
    return () => {
      window.removeEventListener("open_file_explorer_node", handleOpenNode);
    };
  }, []);

  // Helper: toggle folder expansion in tree
  const toggleExpand = (folderId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setExpandedFolders(prev => {
      const next = new Set(prev);
      if (next.has(folderId)) {
        next.delete(folderId);
      } else {
        next.add(folderId);
      }
      return next;
    });
  };

  // Helper: get file icon by mimeType
  const getFileIcon = (node: FileNode) => {
    if (node.type === "folder") {
      return expandedFolders.has(node.id) ? (
        <FolderOpen className="w-4 h-4 text-gold shrink-0" />
      ) : (
        <Folder className="w-4 h-4 text-gold shrink-0" />
      );
    }
    switch (node.mimeType) {
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
      default:
        return <File className="w-4 h-4 text-slate-400 shrink-0" />;
    }
  };

  // Build breadcrumbs path
  const breadcrumbs = useMemo(() => {
    const crumbs: { id: string | null; name: string }[] = [{ id: null, name: "Root Storage" }];
    let curr = currentFolderId;
    const path: { id: string; name: string }[] = [];
    while (curr) {
      const found = nodes.find(n => n.id === curr);
      if (found) {
        path.unshift({ id: found.id, name: found.name });
        curr = found.parentId;
      } else {
        break;
      }
    }
    return [...crumbs, ...path];
  }, [currentFolderId, nodes]);

  // Children of current folder
  const currentItems = useMemo(() => {
    let list = nodes.filter(n => n.parentId === currentFolderId);

    // Apply filter
    if (mimeFilter !== "all") {
      list = list.filter(n => n.type === "folder" || n.mimeType === mimeFilter);
    }

    // Apply search query across entire tree if searching
    if (searchQuery.trim() !== "") {
      const queryLower = searchQuery.toLowerCase();
      list = nodes.filter(n => n.name.toLowerCase().includes(queryLower));
    }

    // Sort: Folders first, then files alphabetically
    return list.sort((a, b) => {
      if (a.type !== b.type) {
        return a.type === "folder" ? -1 : 1;
      }
      return a.name.localeCompare(b.name);
    });
  }, [nodes, currentFolderId, mimeFilter, searchQuery]);

  // Selection Handlers
  const toggleSelectNode = (id: string, e?: React.MouseEvent | React.ChangeEvent) => {
    if (e) e.stopPropagation();
    setSelectedNodeIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const isAllSelected = useMemo(() => {
    if (currentItems.length === 0) return false;
    return currentItems.every(n => selectedNodeIds.has(n.id));
  }, [currentItems, selectedNodeIds]);

  const toggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedNodeIds(new Set());
    } else {
      setSelectedNodeIds(new Set(currentItems.map(n => n.id)));
    }
  };

  const clearSelection = () => {
    setSelectedNodeIds(new Set());
  };

  // Helper to check if folder B is descendant of folder A
  const isDescendant = (folderAId: string, folderBId: string | null): boolean => {
    if (!folderBId) return false;
    if (folderBId === folderAId) return true;
    const parent = nodes.find(n => n.id === folderBId);
    return parent ? isDescendant(folderAId, parent.parentId) : false;
  };

  // RENAME SINGLE OPERATION
  const startRename = (node: FileNode, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setEditingNodeId(node.id);
    setEditingName(node.name);
  };

  const confirmRename = (nodeId: string) => {
    const trimmed = editingName.trim();
    if (!trimmed) {
      toast({ title: "Name Cannot Be Empty", variant: "destructive" });
      setEditingNodeId(null);
      return;
    }

    const nodeToEdit = nodes.find(n => n.id === nodeId);
    if (!nodeToEdit) return;

    const isDuplicate = nodes.some(
      n => n.parentId === nodeToEdit.parentId && n.id !== nodeId && n.name.toLowerCase() === trimmed.toLowerCase()
    );

    if (isDuplicate) {
      toast({ title: "Name Already Exists", description: "An item with this name already exists in this directory.", variant: "destructive" });
      return;
    }

    setNodes(prev =>
      prev.map(n => (n.id === nodeId ? { ...n, name: trimmed, updatedAt: new Date().toISOString().split("T")[0] } : n))
    );
    setEditingNodeId(null);
    toast({ title: "Renamed Successfully", description: `Renamed to "${trimmed}"` });
  };

  // MOVE SINGLE OPERATION
  const openMoveModal = (node: FileNode, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setMovingNode(node);
    setTargetFolderId(node.parentId);
  };

  const confirmMove = () => {
    if (!movingNode) return;

    if (targetFolderId === movingNode.parentId) {
      setMovingNode(null);
      return;
    }

    if (movingNode.type === "folder" && (targetFolderId === movingNode.id || isDescendant(movingNode.id, targetFolderId))) {
      toast({
        title: "Invalid Move Target",
        description: "Cannot move a folder into itself or one of its own subfolders.",
        variant: "destructive",
      });
      return;
    }

    setNodes(prev =>
      prev.map(n => (n.id === movingNode.id ? { ...n, parentId: targetFolderId, updatedAt: new Date().toISOString().split("T")[0] } : n))
    );

    const targetName = targetFolderId ? nodes.find(n => n.id === targetFolderId)?.name || "Target Folder" : "Root Storage";
    toast({ title: "Moved Item", description: `Moved "${movingNode.name}" to ${targetName}` });
    setMovingNode(null);
  };

  // DELETE SINGLE OPERATION
  const deleteItem = (nodeId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const targetNode = nodes.find(n => n.id === nodeId);
    if (!targetNode) return;

    const getDescendantIds = (id: string): string[] => {
      const children = nodes.filter(n => n.parentId === id);
      let ids = children.map(c => c.id);
      children.forEach(c => {
        if (c.type === "folder") {
          ids = [...ids, ...getDescendantIds(c.id)];
        }
      });
      return ids;
    };

    const idsToDelete = new Set([nodeId, ...getDescendantIds(nodeId)]);

    setNodes(prev => prev.filter(n => !idsToDelete.has(n.id)));
    setSelectedNodeIds(prev => {
      const next = new Set(prev);
      idsToDelete.forEach(id => next.delete(id));
      return next;
    });
    toast({ title: "Deleted Item", description: `Removed "${targetNode.name}" and any sub-contents.` });
  };

  // BATCH DELETE OPERATION
  const confirmBatchDelete = () => {
    if (selectedNodeIds.size === 0) return;

    const getDescendantIds = (id: string): string[] => {
      const children = nodes.filter(n => n.parentId === id);
      let ids = children.map(c => c.id);
      children.forEach(c => {
        if (c.type === "folder") {
          ids = [...ids, ...getDescendantIds(c.id)];
        }
      });
      return ids;
    };

    const idsToDelete = new Set<string>();
    selectedNodeIds.forEach(id => {
      idsToDelete.add(id);
      const node = nodes.find(n => n.id === id);
      if (node && node.type === "folder") {
        getDescendantIds(id).forEach(childId => idsToDelete.add(childId));
      }
    });

    const count = selectedNodeIds.size;
    setNodes(prev => prev.filter(n => !idsToDelete.has(n.id)));
    setSelectedNodeIds(new Set());
    toast({ title: "Batch Delete Successful", description: `Deleted ${count} item(s) and associated sub-items.` });
  };

  // BATCH MOVE OPERATION
  const confirmBatchMove = () => {
    if (selectedNodeIds.size === 0) return;

    const selectedFolders = nodes.filter(n => selectedNodeIds.has(n.id) && n.type === "folder");
    for (const folder of selectedFolders) {
      if (targetFolderId === folder.id || isDescendant(folder.id, targetFolderId)) {
        toast({
          title: "Invalid Target Directory",
          description: `Cannot move folder "${folder.name}" into itself or its own subfolder.`,
          variant: "destructive",
        });
        return;
      }
    }

    setNodes(prev =>
      prev.map(n =>
        selectedNodeIds.has(n.id)
          ? { ...n, parentId: targetFolderId, updatedAt: new Date().toISOString().split("T")[0] }
          : n
      )
    );

    const targetName = targetFolderId ? nodes.find(n => n.id === targetFolderId)?.name || "Target Folder" : "Root Storage";
    toast({ title: "Batch Move Successful", description: `Moved ${selectedNodeIds.size} item(s) to ${targetName}.` });
    setSelectedNodeIds(new Set());
    setBatchMoveOpen(false);
  };

  // BATCH RENAME OPERATION
  const confirmBatchRename = () => {
    if (selectedNodeIds.size === 0) return;

    const selectedList = nodes.filter(n => selectedNodeIds.has(n.id));
    const updatedDate = new Date().toISOString().split("T")[0];
    const renamedMap = new Map<string, string>();

    selectedList.forEach((node, index) => {
      let newName = node.name;
      if (renameMode === "prefix" && renamePrefix.trim()) {
        newName = `${renamePrefix.trim()}_${node.name}`;
      } else if (renameMode === "replace" && renameSearch) {
        newName = node.name.replaceAll(renameSearch, renameReplace);
      } else if (renameMode === "sequence" && renameBaseName.trim()) {
        const extMatch = node.name.match(/\.[0-9a-z]+$/i);
        const ext = extMatch ? extMatch[0] : "";
        newName = `${renameBaseName.trim()}_${String(index + 1).padStart(2, "0")}${ext}`;
      }
      renamedMap.set(node.id, newName);
    });

    setNodes(prev =>
      prev.map(n => (renamedMap.has(n.id) ? { ...n, name: renamedMap.get(n.id)!, updatedAt: updatedDate } : n))
    );

    toast({ title: "Batch Rename Complete", description: `Renamed ${renamedMap.size} item(s) successfully.` });
    setSelectedNodeIds(new Set());
    setBatchRenameOpen(false);
  };

  // DRAG & DROP UTILITIES
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getMimeFromFileType = (type: string, filename: string): "audio" | "image" | "document" | "code" | "archive" | "other" => {
    if (type.startsWith("audio/") || filename.endsWith(".wav") || filename.endsWith(".mp3") || filename.endsWith(".flac")) return "audio";
    if (type.startsWith("image/") || filename.endsWith(".png") || filename.endsWith(".jpg") || filename.endsWith(".svg")) return "image";
    if (type.includes("pdf") || type.includes("word") || filename.endsWith(".pdf") || filename.endsWith(".docx")) return "document";
    if (filename.endsWith(".zip") || filename.endsWith(".tar") || filename.endsWith(".gz")) return "archive";
    if (filename.endsWith(".ts") || filename.endsWith(".js") || filename.endsWith(".css") || filename.endsWith(".html")) return "code";
    return "other";
  };

  const handleExternalDrop = (e: React.DragEvent<HTMLDivElement>, destinationFolderId: string | null = currentFolderId) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOverDropzone(false);
    setDragOverFolderId(null);

    // Check if dragging internal nodes vs external files
    const internalData = e.dataTransfer.getData("application/json");
    if (internalData) {
      try {
        const parsed = JSON.parse(internalData);
        if (parsed.draggedIds && Array.isArray(parsed.draggedIds)) {
          handleInternalDrop(parsed.draggedIds, destinationFolderId);
          return;
        }
      } catch (err) {
        // Not JSON data
      }
    }

    const files = Array.from(e.dataTransfer.files);
    if (files.length === 0) return;

    const newFileNodes: FileNode[] = files.map((f, i) => ({
      id: `uploaded_${Date.now()}_${i}`,
      name: f.name,
      type: "file",
      parentId: destinationFolderId,
      size: formatFileSize(f.size),
      updatedAt: new Date().toISOString().split("T")[0],
      mimeType: getMimeFromFileType(f.type, f.name),
    }));

    setNodes(prev => [...prev, ...newFileNodes]);

    const targetFolder = destinationFolderId ? nodes.find(n => n.id === destinationFolderId)?.name || "Folder" : "Root Storage";
    toast({
      title: "Upload Successful",
      description: `Uploaded ${files.length} file(s) directly into "${targetFolder}".`,
    });
  };

  const handleInternalDrop = (draggedIds: string[], targetFolder: string | null) => {
    for (const id of draggedIds) {
      const node = nodes.find(n => n.id === id);
      if (node && node.type === "folder") {
        if (targetFolder === id || isDescendant(id, targetFolder)) {
          toast({
            title: "Invalid Move Target",
            description: `Cannot move folder "${node.name}" into itself or its subfolder.`,
            variant: "destructive",
          });
          return;
        }
      }
    }

    setNodes(prev =>
      prev.map(n =>
        draggedIds.includes(n.id)
          ? { ...n, parentId: targetFolder, updatedAt: new Date().toISOString().split("T")[0] }
          : n
      )
    );

    const targetName = targetFolder ? nodes.find(n => n.id === targetFolder)?.name || "Folder" : "Root Storage";
    toast({
      title: "Moved via Drag & Drop",
      description: `Moved ${draggedIds.length} item(s) to ${targetName}.`,
    });
  };

  const handleDragStart = (e: React.DragEvent, node: FileNode) => {
    let idsToMove = [node.id];
    if (selectedNodeIds.has(node.id)) {
      idsToMove = Array.from(selectedNodeIds);
    }
    e.dataTransfer.setData("application/json", JSON.stringify({ draggedIds: idsToMove }));
    e.dataTransfer.effectAllowed = "move";
  };

  // CREATE NEW ITEM
  const handleCreateNewItem = () => {
    const trimmed = newItemName.trim();
    if (!trimmed) {
      toast({ title: "Name Required", variant: "destructive" });
      return;
    }

    const newNode: FileNode = {
      id: "node_" + Date.now(),
      name: trimmed + (createType === "file" && !trimmed.includes(".") ? getExtensionForMime(newItemFileType) : ""),
      type: createType,
      parentId: currentFolderId,
      size: createType === "file" ? "1.2 MB" : undefined,
      updatedAt: new Date().toISOString().split("T")[0],
      mimeType: createType === "file" ? newItemFileType : undefined,
    };

    setNodes(prev => [...prev, newNode]);
    if (createType === "folder") {
      setExpandedFolders(prev => new Set(prev).add(newNode.id));
    }
    setCreateDialogOpen(false);
    setNewItemName("");
    toast({ title: `Created ${createType === "folder" ? "Folder" : "File"}`, description: `"${newNode.name}" added.` });
  };

  const getExtensionForMime = (mime: string) => {
    switch (mime) {
      case "audio": return ".mp3";
      case "image": return ".png";
      case "document": return ".pdf";
      case "code": return ".ts";
      case "archive": return ".zip";
      default: return ".txt";
    }
  };

  // Recursive Tree Component for Sidebar
  const renderTreeFolder = (folderId: string | null, depth = 0) => {
    const childFolders = nodes.filter(n => n.parentId === folderId && n.type === "folder");
    if (childFolders.length === 0) return null;

    return (
      <div className="space-y-1">
        {childFolders.map(folder => {
          const isExpanded = expandedFolders.has(folder.id);
          const isSelected = currentFolderId === folder.id;
          const isFolderTarget = dragOverFolderId === folder.id;

          return (
            <div key={folder.id} className="space-y-1">
              <div
                onClick={() => {
                  setCurrentFolderId(folder.id);
                  if (!isExpanded) toggleExpand(folder.id);
                }}
                onDragOver={e => {
                  e.preventDefault();
                  e.stopPropagation();
                  setDragOverFolderId(folder.id);
                }}
                onDragLeave={e => {
                  e.preventDefault();
                  e.stopPropagation();
                  setDragOverFolderId(null);
                }}
                onDrop={e => handleExternalDrop(e, folder.id)}
                style={{ paddingLeft: `${depth * 14 + 8}px` }}
                className={`flex items-center justify-between py-1.5 pr-2 rounded-lg text-xs cursor-pointer transition-all group ${
                  isFolderTarget
                    ? "bg-gold/30 border-2 border-dashed border-gold text-white shadow-lg animate-pulse"
                    : isSelected 
                      ? "bg-gold/20 text-gold font-semibold border-l-2 border-gold" 
                      : "hover:bg-white/5 text-muted-foreground hover:text-white"
                }`}
              >
                <div className="flex items-center gap-1.5 min-w-0">
                  <button
                    onClick={e => toggleExpand(folder.id, e)}
                    className="p-0.5 hover:bg-white/10 rounded text-muted-foreground hover:text-white"
                  >
                    {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                  </button>
                  {isExpanded ? (
                    <FolderOpen className="w-4 h-4 text-gold shrink-0" />
                  ) : (
                    <Folder className="w-4 h-4 text-gold shrink-0" />
                  )}
                  <span className="truncate">{folder.name}</span>
                </div>

                {/* Hover Actions in Tree */}
                <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-opacity">
                  <button
                    title="Rename"
                    onClick={e => startRename(folder, e)}
                    className="p-1 hover:text-gold hover:bg-white/10 rounded"
                  >
                    <Edit3 className="w-3 h-3" />
                  </button>
                  <button
                    title="Move"
                    onClick={e => openMoveModal(folder, e)}
                    className="p-1 hover:text-gold hover:bg-white/10 rounded"
                  >
                    <FolderInput className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {isExpanded && renderTreeFolder(folder.id, depth + 1)}
            </div>
          );
        })}
      </div>
    );
  };

  // Folder List for Move Target Selector
  const renderMoveFolderOptions = (folderId: string | null, depth = 0): React.ReactNode[] => {
    const folders = nodes.filter(n => n.parentId === folderId && n.type === "folder");
    let options: React.ReactNode[] = [];

    folders.forEach(f => {
      const disabled = movingNode?.id === f.id || (movingNode?.type === "folder" && isDescendant(movingNode.id, f.id));
      options.push(
        <button
          key={f.id}
          disabled={disabled}
          onClick={() => setTargetFolderId(f.id)}
          style={{ paddingLeft: `${depth * 16 + 12}px` }}
          className={`w-full text-left py-2 px-3 rounded-lg text-xs flex items-center justify-between border ${
            targetFolderId === f.id 
              ? "bg-gold/20 border-gold text-gold font-bold" 
              : disabled 
                ? "opacity-40 cursor-not-allowed border-transparent" 
                : "hover:bg-white/5 border-transparent text-white"
          }`}
        >
          <span className="flex items-center gap-2">
            <Folder className="w-4 h-4 text-gold" />
            {f.name}
          </span>
          {targetFolderId === f.id && <Check className="w-4 h-4 text-gold" />}
        </button>
      );

      options = options.concat(renderMoveFolderOptions(f.id, depth + 1));
    });

    return options;
  };

  return (
    <Card id="file-explorer" className="bg-card border-glass-border">
      <CardHeader className="pb-4 border-b border-white/5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <CardTitle className="text-xl font-bold font-display tracking-tight flex items-center gap-2">
              <HardDrive className="w-5 h-5 text-gold" />
              Hierarchical File Manager
            </CardTitle>
            <CardDescription className="text-xs">
              Drag-and-drop file uploads, folder tree navigation, and multi-select batch operations.
            </CardDescription>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              className="bg-white/5 border-white/10 hover:bg-white/10 text-white text-xs gap-1.5"
              onClick={() => {
                setCreateType("folder");
                setCreateDialogOpen(true);
              }}
            >
              <Plus className="w-4 h-4 text-gold" /> New Folder
            </Button>
            <Button
              size="sm"
              className="bg-gold hover:bg-gold-light text-black font-semibold text-xs gap-1.5"
              onClick={() => {
                setCreateType("file");
                setCreateDialogOpen(true);
              }}
            >
              <Upload className="w-4 h-4" /> Add File
            </Button>
          </div>
        </div>

        {/* Search, Filter & View Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 mt-4">
          {/* Search bar */}
          <div className="sm:col-span-6 relative">
            <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
            <Input
              placeholder="Search files and folders..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-9 bg-white/5 border-white/10 text-xs h-9 text-white placeholder:text-muted-foreground"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Mime Filter */}
          <div className="sm:col-span-4">
            <Select value={mimeFilter} onValueChange={setMimeFilter}>
              <SelectTrigger className="bg-white/5 border-white/10 text-xs h-9 text-white">
                <div className="flex items-center gap-1.5">
                  <Filter className="w-3.5 h-3.5 text-gold" />
                  <SelectValue placeholder="Filter by type" />
                </div>
              </SelectTrigger>
              <SelectContent className="bg-slate-900 border-glass-border text-white">
                <SelectItem value="all">All File Types</SelectItem>
                <SelectItem value="audio">Audio Tracks</SelectItem>
                <SelectItem value="image">Images & Media</SelectItem>
                <SelectItem value="document">Documents & Press</SelectItem>
                <SelectItem value="code">Code & Styles</SelectItem>
                <SelectItem value="archive">Zip Archives</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* View Toggle */}
          <div className="sm:col-span-2 flex items-center justify-end gap-1">
            <Button
              size="icon"
              variant="ghost"
              className={`h-9 w-9 rounded-lg border ${viewMode === "list" ? "bg-gold/20 border-gold text-gold" : "border-white/10 text-muted-foreground"}`}
              onClick={() => setViewMode("list")}
            >
              <ListIcon className="w-4 h-4" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className={`h-9 w-9 rounded-lg border ${viewMode === "grid" ? "bg-gold/20 border-gold text-gold" : "border-white/10 text-muted-foreground"}`}
              onClick={() => setViewMode("grid")}
            >
              <Grid className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div className="grid grid-cols-1 md:grid-cols-12 min-h-[420px]">
          {/* LEFT SIDEBAR: Folder Tree Navigation */}
          <div className="md:col-span-4 border-r border-white/5 p-4 bg-white/[0.01]">
            <div className="flex items-center justify-between mb-3 px-2">
              <span className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground font-semibold">
                Folder Hierarchy
              </span>
              <Badge variant="outline" className="text-[10px] font-mono bg-white/5 border-white/10 text-gold">
                {nodes.filter(n => n.type === "folder").length} Folders
              </Badge>
            </div>

            {/* Root item button with dropzone support */}
            <div
              onClick={() => setCurrentFolderId(null)}
              onDragOver={e => {
                e.preventDefault();
                e.stopPropagation();
                setDragOverFolderId("root");
              }}
              onDragLeave={e => {
                e.preventDefault();
                e.stopPropagation();
                setDragOverFolderId(null);
              }}
              onDrop={e => handleExternalDrop(e, null)}
              className={`flex items-center gap-2 py-2 px-3 rounded-lg text-xs cursor-pointer mb-2 transition-all ${
                dragOverFolderId === "root"
                  ? "bg-gold/30 border-2 border-dashed border-gold text-white font-bold"
                  : currentFolderId === null 
                    ? "bg-gold/20 text-gold font-bold border-l-2 border-gold" 
                    : "hover:bg-white/5 text-muted-foreground hover:text-white"
              }`}
            >
              <HardDrive className="w-4 h-4 text-gold shrink-0" />
              <span>Root Storage</span>
            </div>

            {/* Recursive Folder Tree */}
            <div className="space-y-1 overflow-y-auto max-h-[350px] pr-1">
              {renderTreeFolder(null)}
            </div>
          </div>

          {/* RIGHT MAIN AREA: Directory Contents & Drag & Drop Container */}
          <div
            onDragOver={e => {
              e.preventDefault();
              e.stopPropagation();
              setIsDraggingOverDropzone(true);
            }}
            onDragLeave={e => {
              e.preventDefault();
              e.stopPropagation();
              // Only disable if leaving main container
              if (e.currentTarget.contains(e.relatedTarget as Node)) return;
              setIsDraggingOverDropzone(false);
            }}
            onDrop={e => handleExternalDrop(e, currentFolderId)}
            className="md:col-span-8 p-4 flex flex-col justify-between relative min-h-[400px]"
          >
            {/* Visual Dropzone Overlay when Dragging Desktop Files */}
            {isDraggingOverDropzone && (
              <div className="absolute inset-2 rounded-2xl bg-black/90 border-2 border-dashed border-gold z-30 backdrop-blur-md flex flex-col items-center justify-center text-center p-6 space-y-3 pointer-events-none animate-in fade-in zoom-in-95">
                <div className="w-16 h-16 rounded-full bg-gold/20 border border-gold/40 flex items-center justify-center text-gold animate-bounce">
                  <UploadCloud className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white font-display">Drop Files to Upload</h3>
                  <p className="text-xs text-muted-foreground mt-1 font-mono">
                    Target directory: <span className="text-gold font-bold">{breadcrumbs[breadcrumbs.length - 1].name}</span>
                  </p>
                </div>
              </div>
            )}

            <div>
              {/* Breadcrumb Path & Multi-Select Action Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-white/5">
                <div className="flex items-center gap-1 text-xs text-muted-foreground overflow-x-auto pb-1 font-mono">
                  {breadcrumbs.map((crumb, idx) => (
                    <React.Fragment key={crumb.id || "root"}>
                      {idx > 0 && <ChevronRight className="w-3.5 h-3.5 text-white/20 shrink-0" />}
                      <button
                        onClick={() => setCurrentFolderId(crumb.id)}
                        className={`hover:text-gold transition-colors whitespace-nowrap px-1 py-0.5 rounded ${
                          idx === breadcrumbs.length - 1 ? "text-white font-semibold bg-white/5" : ""
                        }`}
                      >
                        {crumb.name}
                      </button>
                    </React.Fragment>
                  ))}
                </div>

                {/* Multi-Select Status Indicator */}
                {currentItems.length > 0 && (
                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={toggleSelectAll}
                      className="text-xs h-7 text-muted-foreground hover:text-white px-2 gap-1.5"
                    >
                      {isAllSelected ? <CheckSquare className="w-3.5 h-3.5 text-gold" /> : <Square className="w-3.5 h-3.5" />}
                      <span>{isAllSelected ? "Deselect All" : "Select All"}</span>
                    </Button>
                  </div>
                )}
              </div>

              {/* BATCH ACTION BAR BANNER (Triggers when items selected) */}
              {selectedNodeIds.size > 0 && (
                <div className="mb-4 p-3 rounded-xl bg-gradient-to-r from-gold/20 via-amber-500/10 to-transparent border border-gold/40 flex flex-wrap items-center justify-between gap-3 animate-in fade-in slide-in-from-top-2">
                  <div className="flex items-center gap-2">
                    <Badge className="bg-gold text-black font-bold text-xs px-2.5 py-0.5 font-mono">
                      {selectedNodeIds.size} Selected
                    </Badge>
                    <span className="text-xs text-white font-medium hidden sm:inline">
                      Batch Actions:
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setTargetFolderId(currentFolderId);
                        setBatchMoveOpen(true);
                      }}
                      className="h-7 text-xs bg-white/5 border-white/10 hover:bg-white/10 text-white gap-1"
                    >
                      <Move className="w-3.5 h-3.5 text-amber-400" /> Move
                    </Button>

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setBatchRenameOpen(true)}
                      className="h-7 text-xs bg-white/5 border-white/10 hover:bg-white/10 text-white gap-1"
                    >
                      <Type className="w-3.5 h-3.5 text-blue-400" /> Rename
                    </Button>

                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={confirmBatchDelete}
                      className="h-7 text-xs gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Delete
                    </Button>

                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={clearSelection}
                      className="h-7 w-7 p-0 text-muted-foreground hover:text-white"
                    >
                      <X className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              )}

              {/* Items Display */}
              {currentItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground">
                  <FolderOpen className="w-12 h-12 text-white/10 mb-3 stroke-1" />
                  <p className="text-sm font-medium text-white mb-1">Folder is Empty</p>
                  <p className="text-xs max-w-xs mb-4">Drag and drop files here from your desktop to upload directly.</p>
                  <Button
                    size="sm"
                    variant="outline"
                    className="bg-white/5 border-white/10 text-xs text-gold"
                    onClick={() => {
                      setCreateType("file");
                      setCreateDialogOpen(true);
                    }}
                  >
                    <Plus className="w-3.5 h-3.5 mr-1" /> Add File Here
                  </Button>
                </div>
              ) : viewMode === "list" ? (
                /* LIST VIEW TABLE */
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-white/5 text-muted-foreground font-mono text-[10px] uppercase tracking-wider">
                        <th className="pb-2 w-8 text-center">
                          <Checkbox
                            checked={isAllSelected}
                            onCheckedChange={toggleSelectAll}
                            className="border-white/20 data-[state=checked]:bg-gold data-[state=checked]:text-black"
                          />
                        </th>
                        <th className="pb-2 font-semibold">Name</th>
                        <th className="pb-2 font-semibold hidden sm:table-cell">Size</th>
                        <th className="pb-2 font-semibold hidden md:table-cell">Modified</th>
                        <th className="pb-2 font-semibold text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {currentItems.map(node => {
                        const isSelected = selectedNodeIds.has(node.id);
                        return (
                          <tr
                            key={node.id}
                            draggable
                            onDragStart={e => handleDragStart(e, node)}
                            onDragOver={e => {
                              if (node.type === "folder") {
                                e.preventDefault();
                                e.stopPropagation();
                              }
                            }}
                            onDrop={e => {
                              if (node.type === "folder") {
                                handleExternalDrop(e, node.id);
                              }
                            }}
                            className={`group transition-colors ${
                              isSelected
                                ? "bg-gold/10 border-l-2 border-gold"
                                : "hover:bg-white/[0.03]"
                            }`}
                          >
                            <td className="py-2.5 px-2 text-center">
                              <Checkbox
                                checked={isSelected}
                                onCheckedChange={() => toggleSelectNode(node.id)}
                                className="border-white/20 data-[state=checked]:bg-gold data-[state=checked]:text-black"
                              />
                            </td>
                            <td className="py-2.5 pr-2">
                              {editingNodeId === node.id ? (
                                <div className="flex items-center gap-1.5" onClick={e => e.stopPropagation()}>
                                  {getFileIcon(node)}
                                  <Input
                                    value={editingName}
                                    onChange={e => setEditingName(e.target.value)}
                                    onKeyDown={e => {
                                      if (e.key === "Enter") confirmRename(node.id);
                                      if (e.key === "Escape") setEditingNodeId(null);
                                    }}
                                    autoFocus
                                    className="h-7 text-xs bg-slate-900 border-gold text-white"
                                  />
                                  <button
                                    onClick={() => confirmRename(node.id)}
                                    className="p-1 hover:bg-emerald-500/20 text-emerald-400 rounded"
                                  >
                                    <Check className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => setEditingNodeId(null)}
                                    className="p-1 hover:bg-rose-500/20 text-rose-400 rounded"
                                  >
                                    <X className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              ) : (
                                <div
                                  onClick={() => {
                                    if (node.type === "folder") {
                                      setCurrentFolderId(node.id);
                                      setExpandedFolders(prev => new Set(prev).add(node.id));
                                    }
                                  }}
                                  className="flex items-center gap-2.5 cursor-pointer"
                                >
                                  {getFileIcon(node)}
                                  <span className={`font-medium ${node.type === "folder" ? "text-white group-hover:text-gold" : "text-slate-200"}`}>
                                    {node.name}
                                  </span>
                                </div>
                              )}
                            </td>
                            <td className="py-2.5 text-muted-foreground font-mono hidden sm:table-cell">
                              {node.type === "folder" ? "—" : node.size}
                            </td>
                            <td className="py-2.5 text-muted-foreground font-mono hidden md:table-cell">
                              {node.updatedAt}
                            </td>
                            <td className="py-2.5 text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button size="icon" variant="ghost" className="h-7 w-7 text-muted-foreground hover:text-white">
                                    <MoreVertical className="w-3.5 h-3.5" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="bg-slate-900 border-glass-border text-white text-xs">
                                  {node.type === "folder" && (
                                    <DropdownMenuItem
                                      onClick={() => {
                                        setCurrentFolderId(node.id);
                                        setExpandedFolders(prev => new Set(prev).add(node.id));
                                      }}
                                    >
                                      <FolderOpen className="w-3.5 h-3.5 mr-2 text-gold" /> Open Folder
                                    </DropdownMenuItem>
                                  )}
                                  <DropdownMenuItem onClick={e => startRename(node, e)}>
                                    <Edit3 className="w-3.5 h-3.5 mr-2 text-blue-400" /> Rename
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={e => openMoveModal(node, e)}>
                                    <FolderInput className="w-3.5 h-3.5 mr-2 text-amber-400" /> Move to...
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator className="bg-white/10" />
                                  <DropdownMenuItem onClick={e => deleteItem(node.id, e)} className="text-rose-400 focus:text-rose-400">
                                    <Trash2 className="w-3.5 h-3.5 mr-2" /> Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                /* GRID VIEW */
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {currentItems.map(node => {
                    const isSelected = selectedNodeIds.has(node.id);
                    return (
                      <div
                        key={node.id}
                        draggable
                        onDragStart={e => handleDragStart(e, node)}
                        onDragOver={e => {
                          if (node.type === "folder") {
                            e.preventDefault();
                            e.stopPropagation();
                          }
                        }}
                        onDrop={e => {
                          if (node.type === "folder") {
                            handleExternalDrop(e, node.id);
                          }
                        }}
                        onClick={() => {
                          if (node.type === "folder") {
                            setCurrentFolderId(node.id);
                            setExpandedFolders(prev => new Set(prev).add(node.id));
                          }
                        }}
                        className={`group relative rounded-xl p-3 transition-all cursor-pointer flex flex-col justify-between min-h-[100px] border ${
                          isSelected
                            ? "bg-gold/15 border-gold shadow-lg shadow-gold/5"
                            : "bg-white/[0.02] border-white/5 hover:bg-white/5 hover:border-gold/30"
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2">
                            <Checkbox
                              checked={isSelected}
                              onCheckedChange={() => toggleSelectNode(node.id)}
                              className="border-white/20 data-[state=checked]:bg-gold data-[state=checked]:text-black"
                              onClick={e => e.stopPropagation()}
                            />
                            <div className="p-2 rounded-lg bg-white/5 group-hover:bg-gold/10 transition-colors">
                              {getFileIcon(node)}
                            </div>
                          </div>

                          <DropdownMenu>
                            <DropdownMenuTrigger asChild onClick={e => e.stopPropagation()}>
                              <Button size="icon" variant="ghost" className="h-6 w-6 text-muted-foreground hover:text-white">
                                <MoreVertical className="w-3.5 h-3.5" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="bg-slate-900 border-glass-border text-white text-xs">
                              <DropdownMenuItem onClick={e => startRename(node, e)}>
                                <Edit3 className="w-3.5 h-3.5 mr-2 text-blue-400" /> Rename
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={e => openMoveModal(node, e)}>
                                <FolderInput className="w-3.5 h-3.5 mr-2 text-amber-400" /> Move to...
                              </DropdownMenuItem>
                              <DropdownMenuSeparator className="bg-white/10" />
                              <DropdownMenuItem onClick={e => deleteItem(node.id, e)} className="text-rose-400">
                                <Trash2 className="w-3.5 h-3.5 mr-2" /> Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>

                        <div className="mt-2">
                          {editingNodeId === node.id ? (
                            <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                              <Input
                                value={editingName}
                                onChange={e => setEditingName(e.target.value)}
                                onKeyDown={e => {
                                  if (e.key === "Enter") confirmRename(node.id);
                                  if (e.key === "Escape") setEditingNodeId(null);
                                }}
                                autoFocus
                                className="h-6 text-xs bg-slate-900 border-gold text-white"
                              />
                              <button onClick={() => confirmRename(node.id)} className="p-1 text-emerald-400">
                                <Check className="w-3 h-3" />
                              </button>
                            </div>
                          ) : (
                            <p className="text-xs font-semibold text-white truncate group-hover:text-gold transition-colors">
                              {node.name}
                            </p>
                          )}
                          <p className="text-[10px] text-muted-foreground font-mono mt-0.5">
                            {node.type === "folder" ? "Folder" : node.size}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Bottom Status Bar */}
            <div className="mt-6 pt-3 border-t border-white/5 flex items-center justify-between text-[11px] text-muted-foreground font-mono">
              <span>{currentItems.length} items in current view</span>
              <span>Total: {nodes.length} objects stored</span>
            </div>
          </div>
        </div>
      </CardContent>

      {/* SINGLE ITEM MOVE MODAL DIALOG */}
      <Dialog open={!!movingNode} onOpenChange={open => !open && setMovingNode(null)}>
        <DialogContent className="bg-slate-900 border-glass-border text-white sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FolderInput className="w-5 h-5 text-gold" /> Move "{movingNode?.name}"
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Select destination directory below:
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2 max-h-[250px] overflow-y-auto pr-1 my-2">
            <button
              onClick={() => setTargetFolderId(null)}
              className={`w-full text-left py-2 px-3 rounded-lg text-xs flex items-center justify-between border ${
                targetFolderId === null 
                  ? "bg-gold/20 border-gold text-gold font-bold" 
                  : "hover:bg-white/5 border-transparent text-white"
              }`}
            >
              <span className="flex items-center gap-2">
                <HardDrive className="w-4 h-4 text-gold" /> Root Storage
              </span>
              {targetFolderId === null && <Check className="w-4 h-4 text-gold" />}
            </button>

            {renderMoveFolderOptions(null)}
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="ghost" onClick={() => setMovingNode(null)} className="text-xs">
              Cancel
            </Button>
            <Button onClick={confirmMove} className="bg-gold text-black hover:bg-gold-light text-xs font-semibold">
              Move Here
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* BATCH MOVE MODAL DIALOG */}
      <Dialog open={batchMoveOpen} onOpenChange={setBatchMoveOpen}>
        <DialogContent className="bg-slate-900 border-glass-border text-white sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Move className="w-5 h-5 text-gold" /> Move {selectedNodeIds.size} Selected Items
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Choose target folder to move all selected items simultaneously:
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2 max-h-[250px] overflow-y-auto pr-1 my-2">
            <button
              onClick={() => setTargetFolderId(null)}
              className={`w-full text-left py-2 px-3 rounded-lg text-xs flex items-center justify-between border ${
                targetFolderId === null 
                  ? "bg-gold/20 border-gold text-gold font-bold" 
                  : "hover:bg-white/5 border-transparent text-white"
              }`}
            >
              <span className="flex items-center gap-2">
                <HardDrive className="w-4 h-4 text-gold" /> Root Storage
              </span>
              {targetFolderId === null && <Check className="w-4 h-4 text-gold" />}
            </button>

            {renderMoveFolderOptions(null)}
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="ghost" onClick={() => setBatchMoveOpen(false)} className="text-xs">
              Cancel
            </Button>
            <Button onClick={confirmBatchMove} className="bg-gold text-black hover:bg-gold-light text-xs font-semibold">
              Move {selectedNodeIds.size} Items
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* BATCH RENAME MODAL DIALOG */}
      <Dialog open={batchRenameOpen} onOpenChange={setBatchRenameOpen}>
        <DialogContent className="bg-slate-900 border-glass-border text-white sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Type className="w-5 h-5 text-gold" /> Batch Rename ({selectedNodeIds.size} Items)
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Apply a pattern or prefix across all selected items.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 my-2">
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Rename Strategy</label>
              <Select value={renameMode} onValueChange={(val: "prefix" | "replace" | "sequence") => setRenameMode(val)}>
                <SelectTrigger className="bg-white/5 border-white/10 text-xs text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-glass-border text-white">
                  <SelectItem value="prefix">Add Prefix (e.g. 2026_EPK_)</SelectItem>
                  <SelectItem value="replace">Find & Replace Text</SelectItem>
                  <SelectItem value="sequence">Sequential Numbering (Asset_01, Asset_02...)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {renameMode === "prefix" && (
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground font-mono">Prefix String</label>
                <Input
                  placeholder="e.g. 2026_Tour"
                  value={renamePrefix}
                  onChange={e => setRenamePrefix(e.target.value)}
                  className="bg-white/5 border-white/10 text-xs text-white"
                />
              </div>
            )}

            {renameMode === "replace" && (
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground font-mono">Find Text</label>
                  <Input
                    placeholder="Draft"
                    value={renameSearch}
                    onChange={e => setRenameSearch(e.target.value)}
                    className="bg-white/5 border-white/10 text-xs text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground font-mono">Replace With</label>
                  <Input
                    placeholder="Final"
                    value={renameReplace}
                    onChange={e => setRenameReplace(e.target.value)}
                    className="bg-white/5 border-white/10 text-xs text-white"
                  />
                </div>
              </div>
            )}

            {renameMode === "sequence" && (
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground font-mono">Base Filename</label>
                <Input
                  placeholder="Asset"
                  value={renameBaseName}
                  onChange={e => setRenameBaseName(e.target.value)}
                  className="bg-white/5 border-white/10 text-xs text-white"
                />
              </div>
            )}
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="ghost" onClick={() => setBatchRenameOpen(false)} className="text-xs">
              Cancel
            </Button>
            <Button onClick={confirmBatchRename} className="bg-gold text-black hover:bg-gold-light text-xs font-semibold">
              Apply Rename
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* CREATE FILE / FOLDER DIALOG */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="bg-slate-900 border-glass-border text-white sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {createType === "folder" ? <Folder className="w-5 h-5 text-gold" /> : <File className="w-5 h-5 text-gold" />}
              Create New {createType === "folder" ? "Folder" : "File"}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Add a new item into current directory ({breadcrumbs[breadcrumbs.length - 1].name}).
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 my-2">
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Name</label>
              <Input
                placeholder={createType === "folder" ? "e.g., Tour Photos 2026" : "e.g., press_kit_bio"}
                value={newItemName}
                onChange={e => setNewItemName(e.target.value)}
                onKeyDown={e => {
                  if (e.key === "Enter") handleCreateNewItem();
                }}
                className="bg-white/5 border-white/10 text-xs text-white"
              />
            </div>

            {createType === "file" && (
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">File Category</label>
                <Select value={newItemFileType} onValueChange={(val: "audio" | "image" | "document" | "code" | "archive" | "other") => setNewItemFileType(val)}>
                  <SelectTrigger className="bg-white/5 border-white/10 text-xs text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 border-glass-border text-white">
                    <SelectItem value="document">Document (.pdf)</SelectItem>
                    <SelectItem value="audio">Audio (.mp3)</SelectItem>
                    <SelectItem value="image">Image (.png)</SelectItem>
                    <SelectItem value="code">Code / Style (.ts)</SelectItem>
                    <SelectItem value="archive">Archive (.zip)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="ghost" onClick={() => setCreateDialogOpen(false)} className="text-xs">
              Cancel
            </Button>
            <Button onClick={handleCreateNewItem} className="bg-gold text-black hover:bg-gold-light text-xs font-semibold">
              Create {createType === "folder" ? "Folder" : "File"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

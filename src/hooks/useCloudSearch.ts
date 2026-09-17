import { useState, useEffect, useCallback, useMemo } from "react";
import { useAuth } from "@/hooks/useAuth";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import { CloudSearchItem, CloudConnectionInfo, CloudCategory } from "@/types/cloudSearch";
import { FileNode } from "@/components/FileExplorer";

const INITIAL_NODES: FileNode[] = [
  { id: "f1", name: "Media Assets", type: "folder", parentId: null, updatedAt: "2026-07-20" },
  { id: "f2", name: "EPK Press Kits", type: "folder", parentId: null, updatedAt: "2026-07-22" },
  { id: "f3", name: "Audio Masters", type: "folder", parentId: "f1", updatedAt: "2026-07-25" },
  { id: "f4", name: "High-Res Photos", type: "folder", parentId: "f1", updatedAt: "2026-07-26" },
  { id: "f5", name: "Website Builds", type: "folder", parentId: null, updatedAt: "2026-07-28" },
  { id: "m1", name: "Midnight_Echoes_Master_24bit.wav", type: "file", parentId: "f3", size: "48.2 MB", updatedAt: "2026-07-25", mimeType: "audio" },
  { id: "m2", name: "Neon_Drive_Acoustic_Mix.mp3", type: "file", parentId: "f3", size: "9.4 MB", updatedAt: "2026-07-25", mimeType: "audio" },
  { id: "m3", name: "Live_In_London_Stem_Guitar.flac", type: "file", parentId: "f3", size: "32.1 MB", updatedAt: "2026-07-26", mimeType: "audio" },
  { id: "img1", name: "Band_Hero_Banner_2026.png", type: "file", parentId: "f4", size: "4.8 MB", updatedAt: "2026-07-26", mimeType: "image" },
  { id: "img2", name: "Tour_Poster_Vector.png", type: "file", parentId: "f4", size: "6.2 MB", updatedAt: "2026-07-27", mimeType: "image" },
  { id: "d1", name: "Official_Press_Release.pdf", type: "file", parentId: "f2", size: "1.2 MB", updatedAt: "2026-07-22", mimeType: "document" },
  { id: "d2", name: "Technical_Rider_2026.pdf", type: "file", parentId: "f2", size: "850 KB", updatedAt: "2026-07-23", mimeType: "document" },
  { id: "d3", name: "Stage_Plot_Diagram.pdf", type: "file", parentId: "f2", size: "2.1 MB", updatedAt: "2026-07-24", mimeType: "document" },
  { id: "c1", name: "site_export_v1.zip", type: "file", parentId: "f5", size: "14.5 MB", updatedAt: "2026-07-28", mimeType: "archive" },
  { id: "c2", name: "custom-styles.css", type: "file", parentId: "f5", size: "12 KB", updatedAt: "2026-07-29", mimeType: "code" },
];

function getCategoryForMime(mimeType?: string, fileName?: string): CloudCategory {
  if (!fileName && !mimeType) return "other";
  const name = (fileName || "").toLowerCase();
  const mime = (mimeType || "").toLowerCase();

  if (mime === "audio" || mime.includes("audio") || name.endsWith(".mp3") || name.endsWith(".wav") || name.endsWith(".flac") || name.endsWith(".aac") || name.endsWith(".m4a")) {
    return "audio";
  }
  if (mime === "image" || mime.includes("image") || name.endsWith(".png") || name.endsWith(".jpg") || name.endsWith(".jpeg") || name.endsWith(".webp") || name.endsWith(".svg")) {
    return "image";
  }
  if (mime === "document" || mime.includes("pdf") || mime.includes("document") || mime.includes("word") || name.endsWith(".pdf") || name.endsWith(".docx") || name.endsWith(".doc") || name.endsWith(".txt")) {
    return "document";
  }
  if (mime === "video" || mime.includes("video") || name.endsWith(".mp4") || name.endsWith(".mov") || name.endsWith(".webm")) {
    return "video";
  }
  if (mime === "code" || name.endsWith(".css") || name.endsWith(".js") || name.endsWith(".ts") || name.endsWith(".json") || name.endsWith(".html")) {
    return "code";
  }
  if (mime === "archive" || name.endsWith(".zip") || name.endsWith(".tar") || name.endsWith(".gz") || name.endsWith(".rar")) {
    return "archive";
  }
  return "other";
}

export function useCloudSearch() {
  const { user } = useAuth();
  const [connections, setConnections] = useState<CloudConnectionInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncedFolderIds, setSyncedFolderIds] = useState<string[]>([]);

  // Fetch connections from Firebase Firestore
  const fetchConnections = useCallback(async () => {
    if (!user) {
      setConnections([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const q = query(
        collection(db, "cloud_connections"),
        where("user_id", "==", user.uid)
      );
      const snapshot = await getDocs(q);
      const conns: CloudConnectionInfo[] = snapshot.docs.map(d => {
        const data = d.data();
        return {
          provider: data.provider,
          email: data.email,
          connectedAt: data.connectedAt,
          accessToken: data.accessToken || null,
        };
      });
      setConnections(conns);

      // Fetch synced folders
      const syncQ = query(
        collection(db, "sync_configs"),
        where("user_id", "==", user.uid)
      );
      const syncSnap = await getDocs(syncQ);
      setSyncedFolderIds(syncSnap.docs.map(doc => doc.data().folderId));
    } catch (err) {
      console.error("Error loading cloud connections for search:", err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchConnections();
    const handleConnectionsChange = () => fetchConnections();
    window.addEventListener("cloud_connections_changed", handleConnectionsChange);
    return () => {
      window.removeEventListener("cloud_connections_changed", handleConnectionsChange);
    };
  }, [fetchConnections]);

  // Aggregate all items across Studio Storage, Google Drive, and Dropbox
  const allItems = useMemo<CloudSearchItem[]>(() => {
    const items: CloudSearchItem[] = [];

    // 1. Local Studio Storage / File Explorer Nodes
    const storageKey = `file_explorer_nodes_${user?.uid || "guest"}`;
    let nodes = INITIAL_NODES;
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        nodes = JSON.parse(saved);
      }
    } catch {
      nodes = INITIAL_NODES;
    }

    // Build map for breadcrumb path resolution
    const nodeMap = new Map<string, FileNode>();
    nodes.forEach(n => nodeMap.set(n.id, n));

    const getPathBreadcrumbs = (node: FileNode): string[] => {
      const path: string[] = ["Studio Storage"];
      const chain: string[] = [];
      let curr = node.parentId;
      while (curr) {
        const parent = nodeMap.get(curr);
        if (parent) {
          chain.unshift(parent.name);
          curr = parent.parentId;
        } else {
          break;
        }
      }
      return [...path, ...chain];
    };

    nodes.forEach(n => {
      const breadcrumbs = getPathBreadcrumbs(n);
      const fullPath = [...breadcrumbs, n.name].join(" / ");
      const isDir = n.type === "folder";

      items.push({
        id: `studio_${n.id}`,
        name: n.name,
        type: isDir ? "directory" : "file",
        provider: "studio",
        providerLabel: "Studio Storage",
        accountEmail: user?.email || "Local Sovereign Storage",
        path: fullPath,
        breadcrumbs,
        size: n.size || (isDir ? "Folder" : "12 KB"),
        updatedAt: n.updatedAt,
        mimeType: n.mimeType,
        category: isDir ? "directory" : getCategoryForMime(n.mimeType, n.name),
        nodeId: n.id,
        folderId: n.parentId,
      });
    });

    // 2. Google Drive Items (if connected or available)
    const googleConn = connections.find(c => c.provider === "google");
    const isGoogleConnected = !!googleConn;
    const googleEmail = googleConn?.email || "Google Drive Account";

    // Standard Google Drive Folders
    items.push({
      id: "g_dir_1",
      name: "2026_Album_Masters",
      type: "directory",
      provider: "google",
      providerLabel: "Google Drive",
      accountEmail: googleEmail,
      path: "Google Drive / 2026_Album_Masters",
      breadcrumbs: ["Google Drive", "Root"],
      size: "4 items • 67.5 MB",
      updatedAt: "2026-08-14",
      category: "directory",
      synced: isGoogleConnected,
    });

    items.push({
      id: "g_dir_2",
      name: "Press_And_Promotional_Kits",
      type: "directory",
      provider: "google",
      providerLabel: "Google Drive",
      accountEmail: googleEmail,
      path: "Google Drive / Press_And_Promotional_Kits",
      breadcrumbs: ["Google Drive", "Root"],
      size: "6 items • 22.4 MB",
      updatedAt: "2026-08-10",
      category: "directory",
      synced: isGoogleConnected,
    });

    // Google Drive Files
    const googleFiles = [
      { id: "g1", name: "Lost_In_The_City_Master_V2.mp3", mimeType: "audio/mpeg", size: "8.4 MB", updatedAt: "2026-08-14", path: "Google Drive / 2026_Album_Masters / Lost_In_The_City_Master_V2.mp3", breadcrumbs: ["Google Drive", "2026_Album_Masters"] },
      { id: "g2", name: "Neon_Dream_Instrumental.wav", mimeType: "audio/wav", size: "42.1 MB", updatedAt: "2026-08-12", path: "Google Drive / 2026_Album_Masters / Neon_Dream_Instrumental.wav", breadcrumbs: ["Google Drive", "2026_Album_Masters"] },
      { id: "g3", name: "Album_Art_Draft_HighRes.png", mimeType: "image/png", size: "4.2 MB", updatedAt: "2026-08-11", path: "Google Drive / Press_And_Promotional_Kits / Album_Art_Draft_HighRes.png", breadcrumbs: ["Google Drive", "Press_And_Promotional_Kits"] },
      { id: "g4", name: "Press_Kit_Bio_July_2026.docx", mimeType: "application/vnd.openxmlformats-officedocument", size: "120 KB", updatedAt: "2026-08-09", path: "Google Drive / Press_And_Promotional_Kits / Press_Kit_Bio_July_2026.docx", breadcrumbs: ["Google Drive", "Press_And_Promotional_Kits"] },
      { id: "g5", name: "Tokyo_Live_Poster_Artwork.pdf", mimeType: "application/pdf", size: "12.8 MB", updatedAt: "2026-08-08", path: "Google Drive / Press_And_Promotional_Kits / Tokyo_Live_Poster_Artwork.pdf", breadcrumbs: ["Google Drive", "Press_And_Promotional_Kits"] },
    ];

    googleFiles.forEach(f => {
      items.push({
        id: `google_${f.id}`,
        name: f.name,
        type: "file",
        provider: "google",
        providerLabel: "Google Drive",
        accountEmail: googleEmail,
        path: f.path,
        breadcrumbs: f.breadcrumbs,
        size: f.size,
        updatedAt: f.updatedAt,
        mimeType: f.mimeType,
        category: getCategoryForMime(f.mimeType, f.name),
        synced: isGoogleConnected,
      });
    });

    // 3. Dropbox Items (if connected or available)
    const dropboxConn = connections.find(c => c.provider === "dropbox");
    const isDropboxConnected = !!dropboxConn;
    const dropboxEmail = dropboxConn?.email || "Dropbox Account";

    // Standard Dropbox Folders
    items.push({
      id: "d_dir_1",
      name: "Stems_And_Backing_Tracks",
      type: "directory",
      provider: "dropbox",
      providerLabel: "Dropbox",
      accountEmail: dropboxEmail,
      path: "Dropbox / Stems_And_Backing_Tracks",
      breadcrumbs: ["Dropbox", "Root"],
      size: "8 items • 152.7 MB",
      updatedAt: "2026-08-16",
      category: "directory",
      synced: isDropboxConnected,
    });

    items.push({
      id: "d_dir_2",
      name: "Tour_Video_Teasers_2026",
      type: "directory",
      provider: "dropbox",
      providerLabel: "Dropbox",
      accountEmail: dropboxEmail,
      path: "Dropbox / Tour_Video_Teasers_2026",
      breadcrumbs: ["Dropbox", "Root"],
      size: "3 items • 240.5 MB",
      updatedAt: "2026-08-15",
      category: "directory",
      synced: isDropboxConnected,
    });

    // Dropbox Files
    const dropboxFiles = [
      { id: "d1", name: "Subway_Rhythms_Final.wav", mimeType: "audio/wav", size: "38.5 MB", updatedAt: "2026-08-16", path: "Dropbox / Stems_And_Backing_Tracks / Subway_Rhythms_Final.wav", breadcrumbs: ["Dropbox", "Stems_And_Backing_Tracks"] },
      { id: "d2", name: "Backstage_Video_Teaser.mp4", mimeType: "video/mp4", size: "114.2 MB", updatedAt: "2026-08-15", path: "Dropbox / Tour_Video_Teasers_2026 / Backstage_Video_Teaser.mp4", breadcrumbs: ["Dropbox", "Tour_Video_Teasers_2026"] },
      { id: "d3", name: "Merch_Tshirt_Mockup_Black.png", mimeType: "image/png", size: "3.1 MB", updatedAt: "2026-08-14", path: "Dropbox / Tour_Video_Teasers_2026 / Merch_Tshirt_Mockup_Black.png", breadcrumbs: ["Dropbox", "Tour_Video_Teasers_2026"] },
      { id: "d4", name: "Tour_Rider_And_Requirements.pdf", mimeType: "application/pdf", size: "450 KB", updatedAt: "2026-08-13", path: "Dropbox / Stems_And_Backing_Tracks / Tour_Rider_And_Requirements.pdf", breadcrumbs: ["Dropbox", "Stems_And_Backing_Tracks"] },
    ];

    dropboxFiles.forEach(f => {
      items.push({
        id: `dropbox_${f.id}`,
        name: f.name,
        type: "file",
        provider: "dropbox",
        providerLabel: "Dropbox",
        accountEmail: dropboxEmail,
        path: f.path,
        breadcrumbs: f.breadcrumbs,
        size: f.size,
        updatedAt: f.updatedAt,
        mimeType: f.mimeType,
        category: getCategoryForMime(f.mimeType, f.name),
        synced: isDropboxConnected,
      });
    });

    return items;
  }, [user, connections]);

  // Statistics
  const stats = useMemo(() => {
    const total = allItems.length;
    const directories = allItems.filter(i => i.type === "directory").length;
    const files = allItems.filter(i => i.type === "file").length;
    const googleCount = allItems.filter(i => i.provider === "google").length;
    const dropboxCount = allItems.filter(i => i.provider === "dropbox").length;
    const studioCount = allItems.filter(i => i.provider === "studio").length;

    return {
      total,
      directories,
      files,
      googleCount,
      dropboxCount,
      studioCount,
      isGoogleConnected: connections.some(c => c.provider === "google"),
      isDropboxConnected: connections.some(c => c.provider === "dropbox"),
      connections,
    };
  }, [allItems, connections]);

  return {
    allItems,
    stats,
    loading,
    connections,
    syncedFolderIds,
    refetchConnections: fetchConnections,
  };
}

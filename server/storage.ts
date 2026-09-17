import fs from "fs";
import path from "path";

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

function formatBytes(bytes: number, decimals = 1): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

// Scans an existing filesystem directory for real files
async function scanDirectoryStats(dirPath: string, relativeLabel: string): Promise<{ fileCount: number; totalBytes: number; files: LocalDirectoryFile[] }> {
  try {
    if (!fs.existsSync(dirPath)) {
      return { fileCount: 0, totalBytes: 0, files: [] };
    }
    const entries = await fs.promises.readdir(dirPath, { withFileTypes: true });
    let fileCount = 0;
    let totalBytes = 0;
    const files: LocalDirectoryFile[] = [];

    for (const entry of entries) {
      if (entry.isFile()) {
        const fullPath = path.join(dirPath, entry.name);
        try {
          const stats = await fs.promises.stat(fullPath);
          fileCount++;
          totalBytes += stats.size;

          const ext = path.extname(entry.name).toLowerCase();
          let mimeType: LocalDirectoryFile["mimeType"] = "other";
          if ([".mp3", ".wav", ".flac", ".aac", ".ogg"].includes(ext)) mimeType = "audio";
          else if ([".png", ".jpg", ".jpeg", ".svg", ".webp", ".gif", ".ico"].includes(ext)) mimeType = "image";
          else if ([".pdf", ".doc", ".docx", ".txt", ".md"].includes(ext)) mimeType = "document";
          else if ([".ts", ".tsx", ".js", ".jsx", ".json", ".css", ".html"].includes(ext)) mimeType = "code";
          else if ([".zip", ".tar", ".gz"].includes(ext)) mimeType = "archive";

          files.push({
            id: `real_${entry.name}`,
            name: entry.name,
            size: formatBytes(stats.size),
            mimeType,
            updatedAt: stats.mtime.toISOString().split("T")[0],
          });
        } catch {
          // ignore unreadable file
        }
      }
    }

    return { fileCount, totalBytes, files };
  } catch {
    return { fileCount: 0, totalBytes: 0, files: [] };
  }
}

export async function getStorageOverview(): Promise<StorageOverviewData> {
  const cwd = process.cwd();
  const publicDir = path.join(cwd, "public");
  const publicScan = await scanDirectoryStats(publicDir, "/public");

  // Pre-configured Studio directories with realistic audio, media, and EPK assets
  const localDirectories: LocalDirectory[] = [
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
      fileCount: publicScan.fileCount > 0 ? publicScan.fileCount : 4,
      sizeBytes: publicScan.totalBytes > 0 ? publicScan.totalBytes : 3900000,
      sizeFormatted: publicScan.totalBytes > 0 ? formatBytes(publicScan.totalBytes) : "3.9 MB",
      lastModified: "2026-09-07",
      files: publicScan.files.length > 0 ? publicScan.files : [
        { id: "p1", name: "logo.png", size: "1.2 MB", mimeType: "image", updatedAt: "2026-09-07" },
        { id: "p2", name: "favicon.png", size: "1.2 MB", mimeType: "image", updatedAt: "2026-09-07" },
        { id: "p3", name: "robots.txt", size: "160 B", mimeType: "document", updatedAt: "2026-09-07" },
      ],
    },
  ];

  // Default connected cloud accounts with statistics
  const cloudAccounts: CloudAccount[] = [
    {
      id: "cloud_gdrive",
      provider: "google",
      accountName: "Google Drive (Band Cloud)",
      email: "dev@alistwebs.com",
      status: "connected",
      fileCount: 142,
      usedBytes: 4831838208, // ~4.5 GB
      totalBytes: 16106127360, // 15.0 GB
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
      usedBytes: 1288490188, // ~1.2 GB
      totalBytes: 2147483648, // 2.0 GB
      usedFormatted: "1.2 GB",
      totalFormatted: "2.0 GB",
      percentUsed: 60,
      lastSynced: "12 minutes ago",
    },
  ];

  // Calculate overall metrics
  const totalLocalFiles = localDirectories.reduce((sum, d) => sum + d.fileCount, 0);
  const totalCloudFiles = cloudAccounts.reduce((sum, a) => sum + a.fileCount, 0);
  const totalFiles = totalLocalFiles + totalCloudFiles;

  const totalLocalBytes = localDirectories.reduce((sum, d) => sum + d.sizeBytes, 0);
  const totalCloudBytes = cloudAccounts.reduce((sum, a) => sum + a.usedBytes, 0);
  const totalUsedBytes = totalLocalBytes + totalCloudBytes;

  const totalCapacityBytes = (50 * 1024 * 1024 * 1024) + cloudAccounts.reduce((sum, a) => sum + a.totalBytes, 0); // 50GB local pool + cloud quotas
  const percentUsed = Math.min(100, Math.round((totalUsedBytes / totalCapacityBytes) * 100));

  return {
    summary: {
      totalAccounts: cloudAccounts.length,
      totalDirectories: localDirectories.length,
      totalFiles,
      totalUsedBytes,
      totalCapacityBytes,
      totalUsedFormatted: formatBytes(totalUsedBytes),
      totalCapacityFormatted: formatBytes(totalCapacityBytes),
      percentUsed,
    },
    cloudAccounts,
    localDirectories,
  };
}

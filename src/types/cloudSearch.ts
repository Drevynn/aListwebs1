export type CloudProvider = "all" | "google" | "dropbox" | "studio";

export type CloudItemType = "file" | "directory";

export type CloudCategory = "all" | "directory" | "audio" | "image" | "document" | "code" | "video" | "archive" | "other";

export interface CloudSearchItem {
  id: string;
  name: string;
  type: CloudItemType;
  provider: "google" | "dropbox" | "studio";
  providerLabel: string;
  accountEmail?: string;
  path: string;
  breadcrumbs: string[];
  size?: string;
  updatedAt?: string;
  mimeType?: string;
  category: CloudCategory;
  url?: string;
  nodeId?: string;
  folderId?: string | null;
  synced?: boolean;
}

export interface CloudConnectionInfo {
  provider: "google" | "dropbox";
  email: string;
  connectedAt?: string;
  accessToken?: string | null;
}

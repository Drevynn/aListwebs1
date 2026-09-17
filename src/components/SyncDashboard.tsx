import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, addDoc } from "firebase/firestore";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Folder, Check, Cloud, RefreshCw, FolderSync } from "lucide-react";
import FileExplorer from "@/components/FileExplorer";

interface Connection {
  id: string;
  provider: "google" | "dropbox";
  email: string;
}

export default function SyncDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [connections, setConnections] = useState<Connection[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncedFolders, setSyncedFolders] = useState<string[]>([]);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    const fetchConnections = async () => {
      try {
        const q = query(collection(db, "cloud_connections"), where("user_id", "==", user.uid));
        const snapshot = await getDocs(q);
        setConnections(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Connection)));

        const syncQ = query(collection(db, "sync_configs"), where("user_id", "==", user.uid));
        const syncSnap = await getDocs(syncQ);
        setSyncedFolders(syncSnap.docs.map(d => d.data().folderId));
      } catch (e) {
        console.error("Error loading sync data:", e);
      }
      setLoading(false);
    };
    fetchConnections();
  }, [user]);

  const handleSyncFolder = async (connection: Connection, folderId: string, folderName: string) => {
    if (!user) {
      toast({ title: "Sign in required", description: "Please sign in to configure cloud sync." });
      return;
    }
    try {
      await addDoc(collection(db, "sync_configs"), {
        user_id: user.uid,
        provider: connection.provider,
        folderId,
        folderName,
        lastSynced: new Date().toISOString()
      });
      setSyncedFolders(prev => [...prev, folderId]);
      toast({ title: "Directory Synced", description: `Syncing ${folderName} from ${connection.provider}` });
    } catch (e) {
      toast({ title: "Sync Failed", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 py-8">
      {/* Cloud Connections & Sync Status */}
      <Card className="bg-card border-glass-border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl font-bold font-display tracking-tight flex items-center gap-2">
                <FolderSync className="w-5 h-5 text-gold" />
                Cloud Directory Synchronization
              </CardTitle>
              <CardDescription className="text-xs">
                Link external Google Drive or Dropbox directories to mirror your media assets automatically.
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-6 text-muted-foreground">
              <Loader2 className="w-5 h-5 animate-spin mr-2 text-gold" /> Loading sync state...
            </div>
          ) : connections.length === 0 ? (
            <div className="p-4 rounded-xl bg-white/[0.02] border border-dashed border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Cloud className="w-8 h-8 text-gold/60 shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-white">No Cloud Accounts Connected</p>
                  <p className="text-xs text-muted-foreground">Connect Google Drive or Dropbox in Cloud Connections to setup live directory sync.</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {connections.map(conn => {
                const isSynced = syncedFolders.includes(`${conn.provider}_root`);
                return (
                  <div key={conn.id} className="p-4 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Folder className="w-6 h-6 text-gold shrink-0" />
                      <div>
                        <p className="text-sm font-semibold text-white capitalize">{conn.provider} Account</p>
                        <p className="text-xs text-muted-foreground font-mono">{conn.email}</p>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant={isSynced ? "secondary" : "hero"}
                      disabled={isSynced}
                      onClick={() => handleSyncFolder(conn, `${conn.provider}_root`, `${conn.provider.toUpperCase()} Root`)}
                      className="text-xs gap-1.5"
                    >
                      {isSynced ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" /> Synced
                        </>
                      ) : (
                        <>
                          <RefreshCw className="w-3.5 h-3.5" /> Sync Root Directory
                        </>
                      )}
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Hierarchical File Explorer */}
      <FileExplorer />
    </div>
  );
}


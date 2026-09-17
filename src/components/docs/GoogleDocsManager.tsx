import React, { useState, useEffect, useCallback } from "react";
import { 
  FileText, 
  Plus, 
  ExternalLink, 
  Trash2, 
  Copy, 
  Check, 
  Loader2, 
  RefreshCw, 
  Search, 
  Sliders, 
  Radio, 
  Palette, 
  Clock, 
  FileEdit,
  ShieldAlert
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle 
} from "@/components/ui/alert-dialog";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Site, SiteGoogleDoc } from "@/types";
import { 
  fetchSiteDocsForUser, 
  deleteSiteDocRecord, 
  getCachedGoogleAccessToken,
  requestGoogleDocsAccess,
  writeGoogleDocumentContent 
} from "@/lib/googleDocsService";
import { CreateSiteDocDialog } from "./CreateSiteDocDialog";
import { GoogleSignInButton } from "./GoogleSignInButton";

interface GoogleDocsManagerProps {
  currentSite?: Site | null;
  allSites?: Site[];
}

export const GoogleDocsManager: React.FC<GoogleDocsManagerProps> = ({
  currentSite,
  allSites = [],
}) => {
  const { user } = useAuth();
  const { toast } = useToast();

  const [docs, setDocs] = useState<SiteGoogleDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<string>("all");

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedSiteForCreate, setSelectedSiteForCreate] = useState<Site | null>(currentSite || null);
  
  // Destructive deletion confirmation state
  const [docToDelete, setDocToDelete] = useState<SiteGoogleDoc | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Append section / update document state (Mandatory explicit confirmation dialog)
  const [docToAppend, setDocToAppend] = useState<SiteGoogleDoc | null>(null);
  const [appendSectionTitle, setAppendSectionTitle] = useState("");
  const [appendSectionText, setAppendSectionText] = useState("");
  const [isAppending, setIsAppending] = useState(false);

  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [hasToken, setHasToken] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  const loadDocs = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const siteIdFilter = currentSite ? currentSite.id : undefined;
      const data = await fetchSiteDocsForUser(user.uid, siteIdFilter);
      setDocs(data);
    } catch (err) {
      console.error("Failed to load Google Docs records:", err);
    } finally {
      setLoading(false);
    }
  }, [user, currentSite]);

  useEffect(() => {
    setHasToken(!!getCachedGoogleAccessToken());
    loadDocs();
  }, [loadDocs]);

  const handleConnectGoogle = async () => {
    setIsConnecting(true);
    try {
      await requestGoogleDocsAccess();
      setHasToken(true);
      toast({
        title: "Google Docs Connected",
        description: "Your Google account is authorized to create and manage site documents.",
      });
    } catch (err: unknown) {
      console.error("Google Auth error:", err);
      const message = err instanceof Error ? err.message : "Failed to connect Google account.";
      toast({
        title: "Connection Failed",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const handleCopyLink = (doc: SiteGoogleDoc) => {
    navigator.clipboard.writeText(doc.doc_url);
    setCopiedId(doc.id);
    toast({
      title: "Link Copied",
      description: "Google Docs link copied to clipboard.",
    });
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Explicit confirmation before deleting index record
  const confirmDeleteDoc = async () => {
    if (!docToDelete) return;
    setIsDeleting(true);
    try {
      await deleteSiteDocRecord(docToDelete.id);
      setDocs((prev) => prev.filter((d) => d.id !== docToDelete.id));
      toast({
        title: "Record Removed",
        description: `Removed "${docToDelete.title}" from your Studio index. The file remains safe in your Google Drive.`,
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to remove record.";
      toast({
        title: "Delete Failed",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      setDocToDelete(null);
    }
  };

  // Append new section to existing Google Doc (Mutating operation requiring explicit confirmation)
  const handleAppendSection = async () => {
    if (!docToAppend || !appendSectionText.trim()) return;

    let token = getCachedGoogleAccessToken();
    if (!token) {
      try {
        const authRes = await requestGoogleDocsAccess();
        token = authRes.accessToken;
        setHasToken(true);
      } catch (err: unknown) {
        toast({
          title: "Authorization Required",
          description: "Google Docs permission is required to append content to this document.",
          variant: "destructive",
        });
        return;
      }
    }

    setIsAppending(true);
    try {
      const timestamp = new Date().toLocaleString();
      const formattedAppend = 
`\n\n================================================================================
${(appendSectionTitle.trim() || "ADDENDUM / CREATOR UPDATE").toUpperCase()}
Added: ${timestamp}
================================================================================
${appendSectionText.trim()}
`;

      await writeGoogleDocumentContent(token, docToAppend.document_id, formattedAppend);
      toast({
        title: "Document Updated",
        description: `Successfully appended update to "${docToAppend.title}" in Google Docs.`,
      });
      setDocToAppend(null);
      setAppendSectionTitle("");
      setAppendSectionText("");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Could not append content to Google Doc.";
      toast({
        title: "Update Failed",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsAppending(false);
    }
  };

  const getDocTypeBadge = (type: string) => {
    switch (type) {
      case "site_dossier":
        return <Badge className="bg-gold/10 text-gold border-gold/30 hover:bg-gold/20">Site Dossier</Badge>;
      case "epk":
        return <Badge className="bg-purple-500/10 text-purple-400 border-purple-500/30 hover:bg-purple-500/20">EPK Dossier</Badge>;
      case "tech_rider":
        return <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/30 hover:bg-blue-500/20">Tech Rider</Badge>;
      case "brand_guide":
        return <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20">Brand Guide</Badge>;
      default:
        return <Badge variant="outline" className="border-zinc-700 text-zinc-400">Documentation</Badge>;
    }
  };

  const filteredDocs = docs.filter((doc) => {
    const matchesSearch = 
      doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.site_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (doc.summary && doc.summary.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesFilter = filterType === "all" || doc.doc_type === filterType;
    return matchesSearch && matchesFilter;
  });

  return (
    <section id="google-docs-hub" className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-zinc-800/80 pb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <FileText className="w-5 h-5" />
            </div>
            <h2 className="text-2xl font-bold font-display text-white tracking-tight">
              Google Docs Manager
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">
              Google Workspace
            </span>
          </div>
          <p className="text-sm text-zinc-400">
            Generate and maintain comprehensive Google Docs for your websites, EPKs, and technical riders.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          {!hasToken && (
            <GoogleSignInButton
              onClick={handleConnectGoogle}
              isLoading={isConnecting}
              text="Connect Google Docs"
            />
          )}
          <Button
            id="create-new-site-doc-btn"
            onClick={() => {
              setSelectedSiteForCreate(currentSite || allSites[0] || null);
              setIsCreateOpen(true);
            }}
            className="rounded-full bg-gold text-black hover:bg-gold/90 font-medium w-full sm:w-auto"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Site Document
          </Button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search generated documents..."
            className="pl-10 bg-zinc-900/60 border-zinc-800 text-white rounded-full text-sm"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1">
          <button
            type="button"
            onClick={() => setFilterType("all")}
            className={`px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
              filterType === "all"
                ? "bg-white text-zinc-950 font-semibold"
                : "bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800"
            }`}
          >
            All Docs ({docs.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterType("site_dossier")}
            className={`px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
              filterType === "site_dossier"
                ? "bg-gold text-black font-semibold"
                : "bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800"
            }`}
          >
            Site Dossiers
          </button>
          <button
            type="button"
            onClick={() => setFilterType("epk")}
            className={`px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
              filterType === "epk"
                ? "bg-purple-400 text-black font-semibold"
                : "bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800"
            }`}
          >
            EPK Dossiers
          </button>
          <button
            type="button"
            onClick={() => setFilterType("tech_rider")}
            className={`px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
              filterType === "tech_rider"
                ? "bg-blue-400 text-black font-semibold"
                : "bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800"
            }`}
          >
            Tech Riders
          </button>
          <Button
            variant="ghost"
            size="icon"
            onClick={loadDocs}
            className="rounded-full text-zinc-400 hover:text-white hover:bg-zinc-800"
            title="Refresh documents list"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </div>

      {/* Documents Grid / List */}
      {loading ? (
        <div className="py-16 text-center space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-gold mx-auto" />
          <p className="text-sm text-zinc-400">Loading your Google Docs portfolio...</p>
        </div>
      ) : filteredDocs.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredDocs.map((doc) => (
            <div
              key={doc.id}
              className="group bg-zinc-900/40 hover:bg-zinc-900/70 border border-zinc-800 hover:border-zinc-700 rounded-3xl p-6 flex flex-col justify-between space-y-4 transition-all"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  {getDocTypeBadge(doc.doc_type)}
                  <span className="text-[11px] text-zinc-500 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(doc.created_at).toLocaleDateString()}
                  </span>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-white group-hover:text-gold transition-colors line-clamp-2">
                    {doc.title}
                  </h3>
                  <p className="text-xs text-zinc-400 mt-1 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-gold/60" />
                    Site: <strong className="text-zinc-300 font-medium">{doc.site_name}</strong>
                  </p>
                </div>

                {doc.summary && (
                  <p className="text-xs text-zinc-400 line-clamp-3 leading-relaxed">
                    {doc.summary}
                  </p>
                )}
              </div>

              {/* Action Toolbar */}
              <div className="pt-3 border-t border-zinc-800/80 flex items-center justify-between gap-2">
                <a
                  href={doc.doc_url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-full bg-blue-600/10 hover:bg-blue-600 text-blue-400 hover:text-white border border-blue-500/20 text-xs font-medium transition-all"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Open in Docs</span>
                  <ExternalLink className="w-3 h-3 ml-0.5 opacity-70" />
                </a>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleCopyLink(doc)}
                  className="rounded-full text-zinc-400 hover:text-white hover:bg-zinc-800 h-8 w-8"
                  title="Copy Google Docs URL"
                >
                  {copiedId === doc.id ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </Button>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setDocToAppend(doc);
                    setAppendSectionTitle("");
                    setAppendSectionText("");
                  }}
                  className="rounded-full text-zinc-400 hover:text-white hover:bg-zinc-800 h-8 w-8"
                  title="Append update section to Google Doc"
                >
                  <FileEdit className="w-3.5 h-3.5" />
                </Button>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setDocToDelete(doc)}
                  className="rounded-full text-zinc-500 hover:text-red-400 hover:bg-red-500/10 h-8 w-8"
                  title="Remove document record from index"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-16 text-center space-y-4 rounded-3xl border border-dashed border-zinc-800 bg-zinc-950/40">
          <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 mx-auto">
            <FileText className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-semibold text-white">No site documents generated yet</h3>
            <p className="text-xs text-zinc-400 max-w-sm mx-auto">
              Create complete site dossiers, EPKs, and technical riders in Google Docs with one click.
            </p>
          </div>
          <Button
            onClick={() => {
              setSelectedSiteForCreate(currentSite || allSites[0] || null);
              setIsCreateOpen(true);
            }}
            className="rounded-full bg-gold text-black hover:bg-gold/90 text-xs font-medium px-5"
          >
            <Plus className="w-3.5 h-3.5 mr-1.5" />
            Generate First Site Document
          </Button>
        </div>
      )}

      {/* Creation Modal */}
      <CreateSiteDocDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        site={selectedSiteForCreate}
        allSites={allSites}
        onDocCreated={(newDoc) => {
          setDocs((prev) => [newDoc, ...prev]);
        }}
      />

      {/* Confirmation Dialog for Append/Update Mutation (Mandated by Workspace Skill) */}
      <Dialog
        open={!!docToAppend}
        onOpenChange={(open) => !open && setDocToAppend(null)}
      >
        <DialogContent className="bg-zinc-950 border border-zinc-800 text-white rounded-3xl max-w-lg">
          <DialogHeader>
            <div className="flex items-center gap-2 text-gold mb-1">
              <FileEdit className="w-4 h-4" />
              <span className="text-xs uppercase font-semibold tracking-wider">Update Document</span>
            </div>
            <DialogTitle className="text-xl font-bold text-white">
              Append Section to Google Doc
            </DialogTitle>
            <DialogDescription className="text-xs text-zinc-400">
              Confirm appending new text to <strong className="text-white">"{docToAppend?.title}"</strong> in Google Docs.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-3">
            <div className="space-y-2">
              <Label htmlFor="append-title" className="text-xs text-zinc-400">
                Section Heading
              </Label>
              <Input
                id="append-title"
                value={appendSectionTitle}
                onChange={(e) => setAppendSectionTitle(e.target.value)}
                placeholder="e.g. Tour Routing Update, Added Audio Stems..."
                className="bg-zinc-900 border-zinc-800 text-white rounded-xl text-sm"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="append-body" className="text-xs text-zinc-400">
                Section Content
              </Label>
              <Textarea
                id="append-body"
                value={appendSectionText}
                onChange={(e) => setAppendSectionText(e.target.value)}
                placeholder="Enter text to append to the document..."
                rows={4}
                className="bg-zinc-900 border-zinc-800 text-white rounded-xl text-sm"
              />
            </div>

            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200 flex items-start gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
              <span>
                <strong>User Confirmation Required:</strong> This will write the new content directly into your Google Doc in Google Drive.
              </span>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              className="rounded-full border-zinc-800 text-zinc-400 hover:bg-zinc-900"
              onClick={() => setDocToAppend(null)}
              disabled={isAppending}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAppendSection}
              disabled={isAppending || !appendSectionText.trim()}
              className="rounded-full bg-gold text-black hover:bg-gold/90 font-medium"
            >
              {isAppending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  <span>Updating in Google Docs...</span>
                </>
              ) : (
                "Confirm & Update Document"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog for Record Deletion (Mandated by Workspace Skill) */}
      <AlertDialog
        open={!!docToDelete}
        onOpenChange={(open) => !open && setDocToDelete(null)}
      >
        <AlertDialogContent className="bg-zinc-950 border border-zinc-800 text-white rounded-3xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-bold text-white">
              Remove Document from Studio Index?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-zinc-400 text-sm">
              Are you sure you want to remove <strong className="text-white">"{docToDelete?.title}"</strong> from your studio documents index? 
              <br /><br />
              <span className="text-xs text-zinc-500">
                Note: This only removes the studio shortcut. Your original document will remain completely safe in your Google Drive.
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel 
              className="rounded-full border-zinc-800 text-zinc-400 hover:bg-zinc-900"
              disabled={isDeleting}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteDoc}
              disabled={isDeleting}
              className="rounded-full bg-red-600 hover:bg-red-500 text-white font-medium"
            >
              {isDeleting ? "Removing..." : "Remove from Studio"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  );
};

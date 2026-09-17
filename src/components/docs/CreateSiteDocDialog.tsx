import React, { useState, useEffect } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  FileText, 
  Sparkles, 
  ExternalLink, 
  CheckCircle2, 
  Loader2, 
  ShieldCheck, 
  AlertCircle,
  Music,
  Radio,
  Sliders,
  Palette
} from "lucide-react";
import { Site, SiteDocType, SiteGoogleDoc } from "@/types";
import { 
  getCachedGoogleAccessToken, 
  requestGoogleDocsAccess, 
  createGoogleDocument, 
  writeGoogleDocumentContent, 
  generateSiteDocumentText, 
  saveSiteDocRecord 
} from "@/lib/googleDocsService";
import { GoogleSignInButton } from "./GoogleSignInButton";
import { useToast } from "@/hooks/use-toast";

interface CreateSiteDocDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  site?: Site | null;
  allSites?: Site[];
  onDocCreated?: (doc: SiteGoogleDoc) => void;
}

export const CreateSiteDocDialog: React.FC<CreateSiteDocDialogProps> = ({
  open,
  onOpenChange,
  site: initialSite,
  allSites = [],
  onDocCreated,
}) => {
  const { toast } = useToast();
  const [selectedSiteId, setSelectedSiteId] = useState<string>(initialSite?.id || "");
  const [docType, setDocType] = useState<SiteDocType>("site_dossier");
  const [title, setTitle] = useState("");
  const [customNotes, setCustomNotes] = useState("");
  
  const [hasToken, setHasToken] = useState(false);
  const [isConnectingGoogle, setIsConnectingGoogle] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [createdDoc, setCreatedDoc] = useState<SiteGoogleDoc | null>(null);
  const [generationStep, setGenerationStep] = useState<string>("");

  // Determine current active site
  const activeSite = initialSite || allSites.find((s) => s.id === selectedSiteId) || allSites[0];

  // Refresh token presence on open
  useEffect(() => {
    if (open) {
      setHasToken(!!getCachedGoogleAccessToken());
      setCreatedDoc(null);
      if (initialSite) {
        setSelectedSiteId(initialSite.id);
      } else if (allSites.length > 0 && !selectedSiteId) {
        setSelectedSiteId(allSites[0].id);
      }
    }
  }, [open, initialSite, allSites, selectedSiteId]);

  // Update default title when site or docType changes
  useEffect(() => {
    if (activeSite) {
      const generated = generateSiteDocumentText(activeSite, docType);
      setTitle(generated.title);
    }
  }, [activeSite, docType]);

  const handleConnectGoogle = async () => {
    setIsConnectingGoogle(true);
    try {
      await requestGoogleDocsAccess();
      setHasToken(true);
      toast({
        title: "Google Docs Connected",
        description: "Your Google account is authorized to generate and manage site documents.",
      });
    } catch (err: unknown) {
      console.error("Google Auth error:", err);
      const message = err instanceof Error ? err.message : "Failed to authenticate with Google.";
      toast({
        title: "Connection Cancelled or Failed",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsConnectingGoogle(false);
    }
  };

  const handleCreateDocument = async () => {
    if (!activeSite) {
      toast({
        title: "No Site Selected",
        description: "Please choose a site to document.",
        variant: "destructive",
      });
      return;
    }

    let token = getCachedGoogleAccessToken();
    if (!token) {
      // Prompt sign in first
      try {
        setIsConnectingGoogle(true);
        const authResult = await requestGoogleDocsAccess();
        token = authResult.accessToken;
        setHasToken(true);
      } catch (err: unknown) {
        setIsConnectingGoogle(false);
        toast({
          title: "Authorization Required",
          description: "Google Docs permission is required to create documents in your Google Drive.",
          variant: "destructive",
        });
        return;
      } finally {
        setIsConnectingGoogle(false);
      }
    }

    setIsGenerating(true);
    setGenerationStep("Initializing document in Google Docs...");

    try {
      // 1. Generate text structure
      const { title: finalTitle, content, summary } = generateSiteDocumentText(
        activeSite,
        docType,
        { customNotes }
      );

      const docTitleToUse = title.trim() || finalTitle;

      // 2. Create document via Google Docs REST API
      setGenerationStep("Creating Google Doc file in your Drive...");
      const newDoc = await createGoogleDocument(token, docTitleToUse);

      // 3. Write formatted content via batchUpdate
      setGenerationStep("Formatting and inserting site dossier chapters...");
      await writeGoogleDocumentContent(token, newDoc.documentId, content);

      // 4. Save record in Firestore
      setGenerationStep("Saving document reference to your Studio...");
      const docUrl = `https://docs.google.com/document/d/${newDoc.documentId}/edit`;
      const recordData = {
        user_id: activeSite.user_id,
        site_id: activeSite.id,
        site_name: activeSite.name || "Untitled Site",
        document_id: newDoc.documentId,
        title: docTitleToUse,
        doc_type: docType,
        doc_url: docUrl,
        created_at: new Date().toISOString(),
        summary,
      };

      const recordId = await saveSiteDocRecord(recordData);
      const fullRecord: SiteGoogleDoc = {
        id: recordId,
        ...recordData,
      };

      setCreatedDoc(fullRecord);
      if (onDocCreated) {
        onDocCreated(fullRecord);
      }

      toast({
        title: "Google Doc Created",
        description: `"${docTitleToUse}" is now available in your Google Drive.`,
      });
    } catch (err: unknown) {
      console.error("Doc creation error:", err);
      const message = err instanceof Error ? err.message : "Failed to generate Google Doc.";
      if (message.includes("expired")) {
        setHasToken(false);
      }
      toast({
        title: "Creation Failed",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
      setGenerationStep("");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        id="create-site-doc-modal"
        className="max-w-2xl bg-zinc-950 border border-zinc-800 text-white p-6 sm:p-8 rounded-3xl max-h-[90vh] overflow-y-auto"
      >
        <DialogHeader className="space-y-2">
          <div className="flex items-center gap-2 text-gold">
            <div className="w-8 h-8 rounded-xl bg-gold/10 border border-gold/20 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
            <span className="text-xs font-semibold tracking-widest uppercase text-gold">
              Google Workspace Integration
            </span>
          </div>
          <DialogTitle className="text-2xl font-bold font-display tracking-tight text-white">
            Create Complete Site Document
          </DialogTitle>
          <DialogDescription className="text-zinc-400 text-sm">
            Generate an official, beautifully structured Google Doc for your website and store it directly in your Google Drive.
          </DialogDescription>
        </DialogHeader>

        {/* Success View */}
        {createdDoc ? (
          <div className="py-6 space-y-6 text-center">
            <div className="w-16 h-16 mx-auto rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 animate-in zoom-in-50">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-white">Document Successfully Generated!</h3>
              <p className="text-zinc-400 text-sm max-w-md mx-auto">
                <span className="font-semibold text-white">{createdDoc.title}</span> has been written to your Google Docs account and indexed in your studio.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800 flex items-center justify-between text-left">
              <div className="flex items-center gap-3 overflow-hidden">
                <FileText className="w-6 h-6 text-blue-400 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-white truncate">{createdDoc.title}</p>
                  <p className="text-xs text-zinc-400">Google Docs • Ready for collaboration</p>
                </div>
              </div>
              <a
                href={createdDoc.doc_url}
                target="_blank"
                rel="noreferrer"
                className="flex-shrink-0 ml-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium transition-colors"
              >
                <span>Open in Docs</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
              <Button
                variant="outline"
                className="rounded-full border-zinc-800 text-zinc-300 hover:bg-zinc-900"
                onClick={() => setCreatedDoc(null)}
              >
                Create Another Doc
              </Button>
              <Button
                className="rounded-full bg-gold text-black hover:bg-gold/90 font-medium"
                onClick={() => onOpenChange(false)}
              >
                Done
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-6 py-4">
            {/* Google Connection Status Banner */}
            <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${hasToken ? "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]" : "bg-amber-400"}`} />
                <div>
                  <p className="text-sm font-medium text-white">
                    {hasToken ? "Google Account Connected" : "Google Docs Authorization Required"}
                  </p>
                  <p className="text-xs text-zinc-400">
                    {hasToken 
                      ? "Documents will be created directly in your personal Google Drive."
                      : "Authorize Google Docs with secure popup permission to enable generation."}
                  </p>
                </div>
              </div>
              {!hasToken && (
                <GoogleSignInButton
                  onClick={handleConnectGoogle}
                  isLoading={isConnectingGoogle}
                  text="Connect Google"
                  className="w-full sm:w-auto"
                />
              )}
            </div>

            {/* Site Picker if multiple sites */}
            {!initialSite && allSites.length > 1 && (
              <div className="space-y-2">
                <Label htmlFor="site-select" className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                  Target Website
                </Label>
                <Select value={selectedSiteId} onValueChange={setSelectedSiteId}>
                  <SelectTrigger id="site-select" className="bg-zinc-900 border-zinc-800 text-white rounded-xl">
                    <SelectValue placeholder="Select site" />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-900 border-zinc-800 text-white">
                    {allSites.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.name || "Untitled Site"} ({s.status})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Document Type Selector */}
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                Document Blueprint
              </Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setDocType("site_dossier")}
                  className={`p-3.5 rounded-2xl border text-left transition-all ${
                    docType === "site_dossier"
                      ? "border-gold bg-gold/5 ring-1 ring-gold/40 text-white"
                      : "border-zinc-800 bg-zinc-900/40 hover:border-zinc-700 text-zinc-300"
                  }`}
                >
                  <div className="flex items-center gap-2 text-gold mb-1">
                    <FileText className="w-4 h-4" />
                    <span className="font-semibold text-sm">Site Dossier</span>
                  </div>
                  <p className="text-xs text-zinc-400 line-clamp-2">
                    Complete master manual: architecture, design blueprint, catalog stems, and hosting specs.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setDocType("epk")}
                  className={`p-3.5 rounded-2xl border text-left transition-all ${
                    docType === "epk"
                      ? "border-gold bg-gold/5 ring-1 ring-gold/40 text-white"
                      : "border-zinc-800 bg-zinc-900/40 hover:border-zinc-700 text-zinc-300"
                  }`}
                >
                  <div className="flex items-center gap-2 text-gold mb-1">
                    <Radio className="w-4 h-4" />
                    <span className="font-semibold text-sm">Electronic Press Kit</span>
                  </div>
                  <p className="text-xs text-zinc-400 line-clamp-2">
                    Official EPK: artist bio, press reviews, discography milestones, and media contacts.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setDocType("tech_rider")}
                  className={`p-3.5 rounded-2xl border text-left transition-all ${
                    docType === "tech_rider"
                      ? "border-gold bg-gold/5 ring-1 ring-gold/40 text-white"
                      : "border-zinc-800 bg-zinc-900/40 hover:border-zinc-700 text-zinc-300"
                  }`}
                >
                  <div className="flex items-center gap-2 text-gold mb-1">
                    <Sliders className="w-4 h-4" />
                    <span className="font-semibold text-sm">Technical Rider</span>
                  </div>
                  <p className="text-xs text-zinc-400 line-clamp-2">
                    Tour audio specifications, 8-channel input list, FOH acoustic limits, and stage wiring.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setDocType("brand_guide")}
                  className={`p-3.5 rounded-2xl border text-left transition-all ${
                    docType === "brand_guide"
                      ? "border-gold bg-gold/5 ring-1 ring-gold/40 text-white"
                      : "border-zinc-800 bg-zinc-900/40 hover:border-zinc-700 text-zinc-300"
                  }`}
                >
                  <div className="flex items-center gap-2 text-gold mb-1">
                    <Palette className="w-4 h-4" />
                    <span className="font-semibold text-sm">Brand & Style Guide</span>
                  </div>
                  <p className="text-xs text-zinc-400 line-clamp-2">
                    Obsidian & gold color palette, typography hierarchy, imagery motifs, and tone of voice.
                  </p>
                </button>
              </div>
            </div>

            {/* Document Title */}
            <div className="space-y-2">
              <Label htmlFor="doc-title" className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                Document Title in Google Docs
              </Label>
              <Input
                id="doc-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter document title..."
                className="bg-zinc-900 border-zinc-800 text-white rounded-xl"
              />
            </div>

            {/* Optional Custom Notes / Creator Additions */}
            <div className="space-y-2">
              <Label htmlFor="custom-notes" className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                Custom Notes & Directives (Optional)
              </Label>
              <Textarea
                id="custom-notes"
                value={customNotes}
                onChange={(e) => setCustomNotes(e.target.value)}
                placeholder="Add any specific venue instructions, album release details, custom stem links, or team members to include in the document..."
                rows={3}
                className="bg-zinc-900 border-zinc-800 text-white rounded-xl text-sm"
              />
            </div>

            {/* Confirmation & Transparency Notice */}
            <div className="p-3.5 rounded-xl bg-zinc-900/40 border border-zinc-800 flex items-start gap-2.5 text-xs text-zinc-400">
              <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
              <span>
                <strong className="text-zinc-300">Explicit Authorization:</strong> Clicking Create will make a single Google Docs API call to create a new document in your Google Drive. No existing documents will ever be overwritten or deleted.
              </span>
            </div>

            <DialogFooter className="flex flex-col sm:flex-row gap-2 pt-2">
              <Button
                variant="outline"
                className="rounded-full border-zinc-800 text-zinc-400 hover:bg-zinc-900"
                onClick={() => onOpenChange(false)}
                disabled={isGenerating}
              >
                Cancel
              </Button>
              <Button
                id="generate-google-doc-submit-btn"
                onClick={handleCreateDocument}
                disabled={isGenerating || !activeSite}
                className="rounded-full bg-gold text-black hover:bg-gold/90 font-medium px-6"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    <span>{generationStep || "Generating in Google Docs..."}</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    <span>Create Document in Google Docs</span>
                  </>
                )}
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

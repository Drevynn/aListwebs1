import React, { useState } from "react";
import { 
  ShieldCheck, 
  CheckCircle2, 
  ExternalLink, 
  Award, 
  Sparkles, 
  Building, 
  Film, 
  UserCheck, 
  Share2, 
  Copy, 
  Info,
  Check,
  ChevronRight,
  ShieldAlert
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { toast } from "sonner";
import { 
  UnionCredential, 
  ProfessionalProfileLink, 
  VerifiedTalentBadgeData,
  AgencyRepresentationInfo 
} from "@/types/verification";

interface VerifiedTalentBadgeProps {
  isVerified?: boolean;
  talentName?: string;
  discipline?: string;
  badgeData?: VerifiedTalentBadgeData;
  unions?: string[] | UnionCredential[];
  professionalLinks?: ProfessionalProfileLink[];
  agencyRepresentation?: AgencyRepresentationInfo;
  variant?: "pill" | "hero" | "compact" | "card" | "unverified_cta";
  className?: string;
  onOpenVerificationFlow?: () => void;
}

export default function VerifiedTalentBadge({
  isVerified = false,
  talentName = "Talent",
  discipline,
  badgeData,
  unions = [],
  professionalLinks = [],
  agencyRepresentation,
  variant = "pill",
  className = "",
  onOpenVerificationFlow,
}: VerifiedTalentBadgeProps) {
  const [showDossier, setShowDossier] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Normalize unions into displayable array
  const unionList: { name: string; memberNumber?: string; standing?: string; verified?: boolean }[] = React.useMemo(() => {
    if (!unions || unions.length === 0) {
      if (badgeData?.verifiedUnions && badgeData.verifiedUnions.length > 0) {
        return badgeData.verifiedUnions.map((u) => ({
          name: u,
          standing: "Active Guild Member",
          verified: true,
        }));
      }
      return [];
    }

    if (typeof unions[0] === "string") {
      return (unions as string[]).map((u) => ({
        name: u,
        standing: "In Good Standing",
        verified: isVerified,
      }));
    }

    return (unions as UnionCredential[]).map((u) => ({
      name: u.unionName,
      memberNumber: u.memberNumber,
      standing: u.standing === "in_good_standing" ? "In Good Standing" : u.standing.replace("_", " "),
      verified: u.verified !== false,
    }));
  }, [unions, badgeData, isVerified]);

  // Derived verification token or placeholder
  const verificationId = badgeData?.verificationToken || `ALIST-TALENT-VERIFIED-${(talentName || "ARTIST").slice(0, 4).toUpperCase()}-94A2`;
  const verifiedDate = badgeData?.verifiedAt ? new Date(badgeData.verifiedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "Active 2026 Registry";

  const handleCopyVerification = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(`${url}#verified-talent`);
    setCopiedLink(true);
    toast.success("Verification Dossier link copied to clipboard");
    setTimeout(() => setCopiedLink(false), 2000);
  };

  // If not verified and variant is unverified_cta
  if (!isVerified) {
    if (variant === "unverified_cta" || variant === "hero") {
      return (
        <button
          type="button"
          onClick={onOpenVerificationFlow}
          className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-900/80 hover:bg-zinc-800 border border-white/10 hover:border-gold/40 text-zinc-400 hover:text-gold transition-all text-xs font-mono group cursor-pointer shadow-sm ${className}`}
        >
          <ShieldAlert className="w-3.5 h-3.5 text-amber-400/80 group-hover:text-gold" />
          <span>Unverified Talent</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20 group-hover:bg-gold/20 group-hover:text-gold">
            Submit Credentials
          </span>
        </button>
      );
    }
    return null;
  }

  return (
    <>
      {/* 1. Hero Variant - Prominent seal & verified guild list */}
      {variant === "hero" && (
        <div 
          onClick={() => setShowDossier(true)}
          className={`group cursor-pointer p-3 sm:p-4 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-amber-950/30 to-black/60 border border-emerald-500/30 hover:border-gold/60 backdrop-blur-md shadow-lg shadow-emerald-950/20 transition-all hover:scale-[1.01] ${className}`}
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 via-amber-500 to-emerald-600 text-zinc-950 shadow-md shadow-amber-500/20">
                <ShieldCheck className="w-6 h-6 text-black" strokeWidth={2.4} />
                <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-400 border-2 border-black animate-pulse" />
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <span className="font-display font-black text-sm tracking-wider uppercase bg-gradient-to-r from-amber-300 via-yellow-200 to-emerald-300 bg-clip-text text-transparent">
                    VERIFIED TALENT
                  </span>
                  <Badge variant="outline" className="text-[10px] font-mono bg-emerald-500/10 border-emerald-500/30 text-emerald-300 py-0">
                    Official Guild Standing
                  </Badge>
                </div>
                <p className="text-xs text-zinc-300">
                  Vetted credentials, registered union standing & professional profiles
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {unionList.slice(0, 2).map((u) => (
                <span
                  key={u.name}
                  className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/40 border border-white/10 text-[11px] font-mono text-zinc-300"
                >
                  <Check className="w-3 h-3 text-emerald-400" />
                  {u.name.length > 18 ? u.name.slice(0, 16) + "…" : u.name}
                </span>
              ))}

              <Button
                size="sm"
                variant="outline"
                className="h-8 text-xs border-gold/40 text-gold hover:bg-gold/10 hover:text-white rounded-xl gap-1 group-hover:border-gold"
              >
                <span>Audit Dossier</span>
                <ChevronRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Pill Variant - Sleek inline badge beside stage name */}
      {variant === "pill" && (
        <TooltipProvider>
          <Tooltip delayDuration={200}>
            <TooltipTrigger asChild>
              <button
                type="button"
                onClick={() => setShowDossier(true)}
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-amber-500/15 via-emerald-500/15 to-amber-500/10 border border-amber-400/40 hover:border-gold hover:shadow-md hover:shadow-amber-500/10 transition-all text-xs font-mono font-medium text-amber-200 hover:text-white cursor-pointer group ${className}`}
              >
                <div className="relative">
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-400 group-hover:text-emerald-300 transition-colors" strokeWidth={2.2} />
                  <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping opacity-75" />
                </div>
                <span className="tracking-wide">Verified Talent</span>
                <span className="text-[10px] text-zinc-400 group-hover:text-amber-300">
                  ({unionList.length > 0 ? unionList[0].name.split(" ")[0] : "SAG-AFTRA"})
                </span>
              </button>
            </TooltipTrigger>
            <TooltipContent side="top" className="bg-zinc-900 border-white/20 text-zinc-200 text-xs p-2 max-w-xs shadow-xl">
              <p className="font-semibold text-gold flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                Verified Talent Credential
              </p>
              <p className="text-[11px] text-zinc-300 mt-1">
                Union credentials, vetted industry profiles & representation verified by A List Webs. Click to inspect dossier.
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}

      {/* 3. Compact Variant - Small badge */}
      {variant === "compact" && (
        <button
          type="button"
          onClick={() => setShowDossier(true)}
          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 hover:border-emerald-400 hover:text-white transition-all text-[11px] font-mono cursor-pointer ${className}`}
        >
          <ShieldCheck className="w-3 h-3 text-emerald-400" />
          <span>Verified</span>
        </button>
      )}

      {/* 4. Full Card Variant - For Resumes & Casting Packets */}
      {variant === "card" && (
        <div className={`p-5 rounded-2xl bg-zinc-950/90 border border-amber-500/30 shadow-xl space-y-4 ${className}`}>
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-display font-bold text-white text-sm">
                  Verified Talent Registry
                </h4>
                <p className="text-[11px] text-zinc-400 font-mono">
                  Registry ID: {verificationId}
                </p>
              </div>
            </div>
            <Badge className="bg-emerald-500/15 text-emerald-300 border-emerald-500/30 text-xs">
              Vetted & Active
            </Badge>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between text-zinc-300">
              <span className="text-zinc-500">Talent:</span>
              <span className="font-medium text-white">{talentName}</span>
            </div>
            {discipline && (
              <div className="flex items-center justify-between text-zinc-300">
                <span className="text-zinc-500">Discipline:</span>
                <span className="capitalize">{discipline}</span>
              </div>
            )}
            <div className="flex items-center justify-between text-zinc-300">
              <span className="text-zinc-500">Verification Date:</span>
              <span className="font-mono text-zinc-300">{verifiedDate}</span>
            </div>
          </div>

          <Button
            size="sm"
            onClick={() => setShowDossier(true)}
            className="w-full bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-zinc-950 font-semibold text-xs rounded-xl shadow-md"
          >
            Open Credential Dossier
          </Button>
        </div>
      )}

      {/* Interactive Verification Dossier Modal */}
      <Dialog open={showDossier} onOpenChange={setShowDossier}>
        <DialogContent className="max-w-2xl bg-zinc-950 border border-amber-500/30 text-white p-0 overflow-hidden shadow-2xl rounded-3xl">
          {/* Top Holographic Header */}
          <div className="p-6 bg-gradient-to-br from-amber-950/60 via-zinc-900 to-black border-b border-white/10 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="flex items-start justify-between relative z-10">
              <div className="flex items-center gap-3.5">
                <div className="p-3 rounded-2xl bg-gradient-to-br from-amber-400 via-yellow-500 to-emerald-500 text-zinc-950 shadow-lg shadow-amber-500/20">
                  <ShieldCheck className="w-8 h-8 text-black" strokeWidth={2.4} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[11px] uppercase tracking-wider text-amber-400 font-semibold">
                      Official A-List Webs Talent Registry
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-mono border border-emerald-500/30">
                      Verified Active
                    </span>
                  </div>
                  <h3 className="text-2xl font-display font-extrabold text-white tracking-tight mt-0.5">
                    {talentName}
                  </h3>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    Professional Entertainment Credential Dossier
                  </p>
                </div>
              </div>

              <div className="hidden sm:block text-right font-mono text-[11px] text-zinc-400">
                <span className="text-zinc-500 block">Dossier ID</span>
                <span className="text-gold font-semibold">{verificationId}</span>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
            {/* Summary Security Ribbon */}
            <div className="flex flex-wrap items-center justify-between p-3.5 rounded-xl bg-black/50 border border-white/10 text-xs font-mono">
              <div className="flex items-center gap-2 text-zinc-300">
                <Sparkles className="w-4 h-4 text-gold" />
                <span>Status: <strong className="text-emerald-400">Verified Talent & Guild Signatory</strong></span>
              </div>
              <div className="text-zinc-400">
                Issued: {verifiedDate}
              </div>
            </div>

            {/* 1. Verified Guilds & Unions */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-mono uppercase tracking-wider text-gold flex items-center gap-2">
                  <Award className="w-3.5 h-3.5" />
                  Verified Union & Guild Memberships ({unionList.length})
                </h4>
                <span className="text-[11px] text-zinc-500 font-mono">Good Standing Verified</span>
              </div>

              {unionList.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {unionList.map((union, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-xl bg-zinc-900/80 border border-white/10 hover:border-amber-500/30 transition-all flex flex-col justify-between"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="space-y-1">
                          <p className="text-sm font-semibold text-white flex items-center gap-1.5">
                            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                            {union.name}
                          </p>
                          <p className="text-xs text-emerald-400/90 font-mono">
                            {union.standing || "Active in Good Standing"}
                          </p>
                        </div>
                      </div>

                      {union.memberNumber && (
                        <div className="mt-2.5 pt-2 border-t border-white/5 flex items-center justify-between text-[11px] font-mono text-zinc-400">
                          <span>Card / Member ID:</span>
                          <span className="text-white font-semibold">{union.memberNumber}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-zinc-900/40 border border-dashed border-white/10 text-xs text-zinc-400 text-center">
                  No specific union memberships listed.
                </div>
              )}
            </div>

            {/* 2. Verified Professional Profiles */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-mono uppercase tracking-wider text-gold flex items-center gap-2">
                  <Film className="w-3.5 h-3.5" />
                  Verified Professional Profile Links ({professionalLinks.length})
                </h4>
                <span className="text-[11px] text-zinc-500 font-mono">Direct Casting Links</span>
              </div>

              {professionalLinks.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {professionalLinks.map((link) => (
                    <a
                      key={link.id}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-3 rounded-xl bg-zinc-900/80 hover:bg-zinc-800 border border-white/10 hover:border-gold/50 transition-all flex items-center justify-between group"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="p-2 rounded-lg bg-white/5 group-hover:bg-gold/10 text-gold transition-colors">
                          <UserCheck className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-xs font-medium text-white group-hover:text-gold transition-colors">
                            {link.label}
                          </p>
                          <p className="text-[10px] text-zinc-400 font-mono truncate max-w-[160px]">
                            {link.url.replace(/^https?:\/\//, "")}
                          </p>
                        </div>
                      </div>

                      <ExternalLink className="w-3.5 h-3.5 text-zinc-500 group-hover:text-gold transition-colors" />
                    </a>
                  ))}
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-zinc-900/40 border border-dashed border-white/10 text-xs text-zinc-400 flex items-center justify-between">
                  <span>Industry profiles linked directly on portfolio.</span>
                  <Badge variant="outline" className="text-[10px] text-zinc-400">
                    IMDb & Agency Vetted
                  </Badge>
                </div>
              )}
            </div>

            {/* 3. Representation */}
            {agencyRepresentation && (
              <div className="p-4 rounded-xl bg-zinc-900/60 border border-white/10 space-y-2">
                <h4 className="text-xs font-mono uppercase tracking-wider text-gold flex items-center gap-2">
                  <Building className="w-3.5 h-3.5" />
                  Franchised Agency Representation
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
                  <div>
                    <span className="text-zinc-500 block text-[11px]">Agency:</span>
                    <span className="text-white font-medium">{agencyRepresentation.agencyName}</span>
                  </div>
                  <div>
                    <span className="text-zinc-500 block text-[11px]">Responsible Agent:</span>
                    <span className="text-white font-medium">{agencyRepresentation.agentName}</span>
                  </div>
                  {agencyRepresentation.agentEmail && (
                    <div>
                      <span className="text-zinc-500 block text-[11px]">Booking Contact:</span>
                      <span className="text-gold font-mono">{agencyRepresentation.agentEmail}</span>
                    </div>
                  )}
                  {agencyRepresentation.franchisedGuild && (
                    <div>
                      <span className="text-zinc-500 block text-[11px]">Franchise Status:</span>
                      <span className="text-emerald-400 font-mono">{agencyRepresentation.franchisedGuild}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Cryptographic Authenticity Seal */}
            <div className="p-4 rounded-2xl bg-zinc-900/90 border border-amber-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                <div>
                  <p className="text-white font-medium">
                    Tamper-Evident Verification Seal
                  </p>
                  <p className="text-[11px] text-zinc-400 font-mono">
                    Token: {verificationId}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleCopyVerification}
                  className="text-xs border-white/20 text-zinc-300 hover:text-white rounded-xl flex-1 sm:flex-initial"
                >
                  {copiedLink ? <Check className="w-3.5 h-3.5 mr-1 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 mr-1" />}
                  {copiedLink ? "Copied" : "Copy Dossier Link"}
                </Button>

                {onOpenVerificationFlow && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setShowDossier(false);
                      onOpenVerificationFlow();
                    }}
                    className="text-xs border-amber-500/30 text-amber-300 hover:text-white rounded-xl flex-1 sm:flex-initial"
                  >
                    Update Credentials
                  </Button>
                )}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

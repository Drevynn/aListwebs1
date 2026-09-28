import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  ShieldCheck, 
  Sparkles, 
  Award, 
  Plus, 
  Trash2, 
  ExternalLink, 
  CheckCircle2, 
  Loader2, 
  Building, 
  FileCheck2, 
  UserCheck, 
  AlertCircle,
  Film,
  Zap,
  Check
} from "lucide-react";
import { 
  POPULAR_ENTERTAINMENT_UNIONS, 
  PROFESSIONAL_PLATFORM_CONFIG,
  UnionCredential, 
  ProfessionalProfileLink, 
  TalentVerificationRequest,
  ProfessionalPlatform
} from "@/types/verification";
import { PortfolioProfile } from "@/types/portfolio";
import VerifiedTalentBadge from "./VerifiedTalentBadge";
import { useAuth } from "@/hooks/useAuth";
import { db } from "@/lib/firebase";
import { doc, setDoc, addDoc, collection } from "firebase/firestore";
import { toast } from "sonner";

interface TalentVerificationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profile: PortfolioProfile;
  onProfileUpdated?: (updated: PortfolioProfile) => void;
}

export default function TalentVerificationModal({
  open,
  onOpenChange,
  profile,
  onProfileUpdated,
}: TalentVerificationModalProps) {
  const { user } = useAuth();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Union credentials state (initialize from profile.unions or existing unionCredentials)
  const [unionCredentials, setUnionCredentials] = useState<UnionCredential[]>(() => {
    if (profile.unionCredentials && profile.unionCredentials.length > 0) {
      return profile.unionCredentials;
    }
    if (profile.unions && profile.unions.length > 0) {
      return profile.unions.map((u, idx) => ({
        id: `uc-${idx}-${Date.now()}`,
        unionName: u,
        memberNumber: "",
        localChapter: "National / Branch",
        standing: "in_good_standing",
        verified: false,
      }));
    }
    return [
      {
        id: `uc-default-${Date.now()}`,
        unionName: "SAG-AFTRA",
        memberNumber: "",
        localChapter: "Los Angeles Local",
        standing: "in_good_standing",
        verified: false,
      },
    ];
  });

  // Selected union from dropdown to add
  const [selectedPresetUnion, setSelectedPresetUnion] = useState("");
  const [customUnionName, setCustomUnionName] = useState("");

  // Professional links state
  const [professionalLinks, setProfessionalLinks] = useState<ProfessionalProfileLink[]>(() => {
    if (profile.professionalLinks && profile.professionalLinks.length > 0) {
      return profile.professionalLinks;
    }
    const initial: ProfessionalProfileLink[] = [];
    if (profile.imdbUrl) {
      initial.push({
        id: "link-imdb",
        platform: "imdb",
        label: "IMDb / IMDbPro",
        url: profile.imdbUrl,
        verified: false,
      });
    } else {
      initial.push({
        id: "link-imdb",
        platform: "imdb",
        label: "IMDb / IMDbPro",
        url: "https://www.imdb.com/name/nm0000000/",
        verified: false,
      });
    }

    initial.push({
      id: "link-actors-access",
      platform: "actors_access",
      label: "Actors Access",
      url: "",
      verified: false,
    });

    initial.push({
      id: "link-spotlight",
      platform: "spotlight",
      label: "Spotlight UK",
      url: "",
      verified: false,
    });

    return initial;
  });

  // New professional link
  const [newPlatform, setNewPlatform] = useState<ProfessionalPlatform>("casting_networks");
  const [newPlatformUrl, setNewPlatformUrl] = useState("");

  // Agency representation
  const [agencyName, setAgencyName] = useState(profile.agencyName || "");
  const [agentName, setAgentName] = useState(profile.agentName || "");
  const [agentEmail, setAgentEmail] = useState(profile.bookingEmail || "");
  const [franchisedGuild, setFranchisedGuild] = useState("SAG-AFTRA Franchised");

  // Legal name & verification contact
  const [legalName, setLegalName] = useState(profile.stageName || "");
  const [contactEmail, setContactEmail] = useState(profile.bookingEmail || user?.email || "");

  // Add union to list
  const handleAddUnion = (nameToAdd?: string) => {
    const unionName = nameToAdd || customUnionName || selectedPresetUnion;
    if (!unionName.trim()) return;

    if (unionCredentials.some((u) => u.unionName.toLowerCase() === unionName.toLowerCase())) {
      toast.info("Union already added to your credentials list");
      return;
    }

    const newUnion: UnionCredential = {
      id: `uc-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      unionName: unionName.trim(),
      memberNumber: "",
      localChapter: "Local Branch",
      standing: "in_good_standing",
      verified: false,
    };

    setUnionCredentials([...unionCredentials, newUnion]);
    setSelectedPresetUnion("");
    setCustomUnionName("");
    toast.success(`Added ${unionName.trim()} to credentials`);
  };

  const handleRemoveUnion = (id: string) => {
    setUnionCredentials(unionCredentials.filter((u) => u.id !== id));
  };

  const handleUpdateUnion = (id: string, field: keyof UnionCredential, value: string) => {
    setUnionCredentials(
      unionCredentials.map((u) => (u.id === id ? { ...u, [field]: value } : u))
    );
  };

  // Add professional link
  const handleAddLink = () => {
    if (!newPlatformUrl.trim()) return;

    const config = PROFESSIONAL_PLATFORM_CONFIG[newPlatform];
    const newLink: ProfessionalProfileLink = {
      id: `link-${Date.now()}`,
      platform: newPlatform,
      label: config.label,
      url: newPlatformUrl.trim(),
      verified: false,
    };

    setProfessionalLinks([...professionalLinks, newLink]);
    setNewPlatformUrl("");
    toast.success(`Added ${config.label} profile link`);
  };

  const handleRemoveLink = (id: string) => {
    setProfessionalLinks(professionalLinks.filter((l) => l.id !== id));
  };

  const handleUpdateLinkUrl = (id: string, url: string) => {
    setProfessionalLinks(
      professionalLinks.map((l) => (l.id === id ? { ...l, url } : l))
    );
  };

  // Submission handler
  const handleSubmitVerification = async (instantApproveDemo = false) => {
    if (unionCredentials.length === 0) {
      toast.error("Please add at least one union membership credential");
      setStep(1);
      return;
    }

    setIsSubmitting(true);
    try {
      const activeUnions = unionCredentials.map((u) => u.unionName);
      const filteredLinks = professionalLinks.filter((l) => l.url && l.url.trim().length > 0);

      const verificationId = `ALIST-TALENT-VERIFIED-${(profile.stageName || "ARTIST").slice(0, 4).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

      const updatedBadge = {
        tier: "verified_talent" as const,
        label: "Verified Talent",
        verifiedAt: new Date().toISOString(),
        verifiedUnions: activeUnions,
        verifiedPlatforms: filteredLinks.map((l) => l.label),
        verificationToken: verificationId,
        registryId: `REG-${Date.now().toString(36).toUpperCase()}`,
        agentVetted: Boolean(agencyName),
      };

      const verificationRecord: TalentVerificationRequest = {
        id: `verif_${Date.now()}`,
        user_id: user?.uid || "dev_talent_user",
        talentName: profile.stageName || "Artist",
        legalName: legalName || profile.stageName,
        email: contactEmail || user?.email || "talent@alistwebs.com",
        discipline: profile.discipline,
        filmDepartment: profile.filmDepartment,
        unions: unionCredentials.map((u) => ({
          ...u,
          verified: instantApproveDemo ? true : u.verified,
        })),
        professionalLinks: filteredLinks.map((l) => ({
          ...l,
          verified: instantApproveDemo ? true : l.verified,
        })),
        agencyRepresentation: agencyName
          ? {
              agencyName,
              agentName,
              agentEmail,
              franchisedGuild,
              verified: instantApproveDemo,
            }
          : undefined,
        status: instantApproveDemo ? "verified" : "pending",
        submissionDate: new Date().toISOString(),
        reviewedAt: instantApproveDemo ? new Date().toISOString() : undefined,
        badgeData: updatedBadge,
      };

      // 1. Save to Firestore if available
      try {
        await addDoc(collection(db, "talent_verifications"), verificationRecord);
        if (user) {
          await setDoc(
            doc(db, "portfolios", user.uid),
            {
              profile: {
                ...profile,
                unions: activeUnions,
                isVerifiedTalent: instantApproveDemo ? true : profile.isVerifiedTalent,
                verificationStatus: instantApproveDemo ? "verified" : "pending",
                verifiedBadge: instantApproveDemo ? updatedBadge : profile.verifiedBadge,
                unionCredentials: verificationRecord.unions,
                professionalLinks: verificationRecord.professionalLinks,
                agencyRepresentation: verificationRecord.agencyRepresentation,
              },
            },
            { merge: true }
          );
        }
      } catch (err) {
        console.warn("Could not save to Firestore directly (local state will update):", err);
      }

      // 2. Update local state
      const updatedProfile: PortfolioProfile = {
        ...profile,
        unions: activeUnions,
        isVerifiedTalent: instantApproveDemo ? true : profile.isVerifiedTalent,
        verificationStatus: instantApproveDemo ? "verified" : "pending",
        verifiedBadge: instantApproveDemo ? updatedBadge : profile.verifiedBadge,
        unionCredentials: verificationRecord.unions,
        professionalLinks: verificationRecord.professionalLinks,
        agencyRepresentation: verificationRecord.agencyRepresentation,
      };

      if (onProfileUpdated) {
        onProfileUpdated(updatedProfile);
      }

      if (instantApproveDemo) {
        toast.success("Verified Talent Status Granted!", {
          description: `Your profile now displays the Verified Talent badge with Token ${verificationId}.`,
        });
      } else {
        toast.success("Verification Request Submitted", {
          description: "Guild verification submitted for registrar review. Badge will activate upon approval.",
        });
      }

      onOpenChange(false);
    } catch (error) {
      toast.error("Failed to submit verification", {
        description: (error as Error).message,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl bg-zinc-950 border border-amber-500/30 text-white p-0 overflow-hidden shadow-2xl rounded-3xl">
        {/* Header */}
        <div className="p-6 bg-gradient-to-br from-amber-950/60 via-zinc-900 to-black border-b border-white/10 relative">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-gradient-to-br from-amber-400 via-amber-500 to-emerald-500 text-zinc-950 shadow-lg shadow-amber-500/20">
              <ShieldCheck className="w-7 h-7 text-black" strokeWidth={2.4} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs text-gold uppercase tracking-wider">
                  Sovereign Guild & Industry Registry
                </span>
                <span className="px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[10px] font-mono">
                  SAG • IATSE • DGA • AEA
                </span>
              </div>
              <h2 className="text-2xl font-display font-extrabold text-white tracking-tight mt-0.5">
                Talent & Guild Verification Flow
              </h2>
              <p className="text-xs text-zinc-400 mt-0.5">
                Submit entertainment union credentials and professional profile links to unlock the <strong>'Verified Talent'</strong> badge on your public presence.
              </p>
            </div>
          </div>

          {/* Stepper Tabs */}
          <div className="grid grid-cols-3 gap-2 mt-5 pt-4 border-t border-white/10 text-xs font-mono">
            <button
              type="button"
              onClick={() => setStep(1)}
              className={`p-2 rounded-xl text-center transition-all ${
                step === 1
                  ? "bg-amber-500 text-zinc-950 font-bold shadow-md shadow-amber-500/20"
                  : "bg-zinc-900/60 text-zinc-400 hover:text-white"
              }`}
            >
              1. Union Credentials
            </button>
            <button
              type="button"
              onClick={() => setStep(2)}
              className={`p-2 rounded-xl text-center transition-all ${
                step === 2
                  ? "bg-amber-500 text-zinc-950 font-bold shadow-md shadow-amber-500/20"
                  : "bg-zinc-900/60 text-zinc-400 hover:text-white"
              }`}
            >
              2. Industry Profiles
            </button>
            <button
              type="button"
              onClick={() => setStep(3)}
              className={`p-2 rounded-xl text-center transition-all ${
                step === 3
                  ? "bg-amber-500 text-zinc-950 font-bold shadow-md shadow-amber-500/20"
                  : "bg-zinc-900/60 text-zinc-400 hover:text-white"
              }`}
            >
              3. Review & Badge
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          {/* STEP 1: Union Credentials */}
          {step === 1 && (
            <div className="space-y-5">
              <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200/90 flex items-start gap-2.5">
                <Sparkles className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                <span>
                  Provide your union memberships (e.g., <strong>SAG-AFTRA</strong>, <strong>ICG Local 600</strong>, <strong>IATSE 728</strong>, <strong>DGA</strong>, <strong>Actors' Equity</strong>, or <strong>AFM</strong>). Member IDs are securely stored and can be masked for public privacy.
                </span>
              </div>

              {/* Add Union Controls */}
              <div className="p-4 rounded-2xl bg-zinc-900/70 border border-white/10 space-y-3">
                <Label className="text-xs font-mono uppercase text-gold">
                  Select Guild / Union to Add
                </Label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <select
                    value={selectedPresetUnion}
                    onChange={(e) => {
                      setSelectedPresetUnion(e.target.value);
                      if (e.target.value) handleAddUnion(e.target.value);
                    }}
                    className="flex-1 px-3 py-2 rounded-xl bg-black border border-white/15 text-xs text-zinc-200 focus:outline-none focus:border-gold"
                  >
                    <option value="">-- Choose Common Entertainment Guild --</option>
                    {POPULAR_ENTERTAINMENT_UNIONS.map((u) => (
                      <option key={u.id} value={u.name}>
                        {u.name} ({u.category})
                      </option>
                    ))}
                  </select>

                  <div className="flex gap-2">
                    <Input
                      placeholder="Or custom guild name..."
                      value={customUnionName}
                      onChange={(e) => setCustomUnionName(e.target.value)}
                      className="bg-black border-white/15 text-xs h-9"
                    />
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => handleAddUnion()}
                      disabled={!customUnionName.trim()}
                      className="bg-gold text-black font-semibold text-xs h-9 rounded-xl hover:bg-gold/90"
                    >
                      <Plus className="w-3.5 h-3.5 mr-1" /> Add
                    </Button>
                  </div>
                </div>
              </div>

              {/* Active Union List */}
              <div className="space-y-3">
                <h4 className="text-xs font-mono uppercase text-zinc-400 flex items-center justify-between">
                  <span>Union Credentials ({unionCredentials.length})</span>
                  <span className="text-[11px] text-zinc-500">Provide Member Card ID / Branch</span>
                </h4>

                {unionCredentials.length === 0 ? (
                  <div className="p-6 rounded-2xl bg-zinc-900/40 border border-dashed border-white/10 text-center text-xs text-zinc-500">
                    No union credentials added yet. Select a guild above to get started.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {unionCredentials.map((union) => (
                      <div
                        key={union.id}
                        className="p-4 rounded-2xl bg-zinc-900/90 border border-white/10 space-y-3 hover:border-white/20 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
                              <ShieldCheck className="w-4 h-4" />
                            </div>
                            <span className="font-semibold text-sm text-white">{union.unionName}</span>
                          </div>

                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveUnion(union.id)}
                            className="h-7 w-7 p-0 text-zinc-500 hover:text-red-400"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <Label className="text-[11px] text-zinc-400 font-mono">
                              Guild Card / Member ID
                            </Label>
                            <Input
                              placeholder="e.g. SA-920412 or ••••412"
                              value={union.memberNumber || ""}
                              onChange={(e) => handleUpdateUnion(union.id, "memberNumber", e.target.value)}
                              className="bg-black/60 border-white/10 text-xs h-8 mt-1 font-mono"
                            />
                          </div>

                          <div>
                            <Label className="text-[11px] text-zinc-400 font-mono">
                              Local Chapter / Region
                            </Label>
                            <Input
                              placeholder="e.g. Los Angeles, NY, Atlanta, London"
                              value={union.localChapter || ""}
                              onChange={(e) => handleUpdateUnion(union.id, "localChapter", e.target.value)}
                              className="bg-black/60 border-white/10 text-xs h-8 mt-1"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* STEP 2: Professional Profiles & Representation */}
          {step === 2 && (
            <div className="space-y-5">
              <div className="p-3.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-xs text-blue-200/90 flex items-start gap-2.5">
                <Film className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
                <span>
                  Link your primary entertainment casting and industry directories. Verified links enable casting directors to instantly confirm your film credits and representation.
                </span>
              </div>

              {/* Profiles List */}
              <div className="space-y-3">
                <h4 className="text-xs font-mono uppercase text-gold">
                  Professional Industry Directory Links
                </h4>

                <div className="space-y-2.5">
                  {professionalLinks.map((link) => (
                    <div
                      key={link.id}
                      className="p-3 rounded-xl bg-zinc-900/80 border border-white/10 space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-white flex items-center gap-1.5">
                          <UserCheck className="w-3.5 h-3.5 text-gold" />
                          {link.label}
                        </span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveLink(link.id)}
                          className="h-6 w-6 p-0 text-zinc-500 hover:text-red-400"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                      <Input
                        placeholder="https://..."
                        value={link.url}
                        onChange={(e) => handleUpdateLinkUrl(link.id, e.target.value)}
                        className="bg-black/60 border-white/10 text-xs h-8 font-mono"
                      />
                    </div>
                  ))}
                </div>

                {/* Add another platform */}
                <div className="p-3 rounded-xl bg-zinc-900/40 border border-dashed border-white/10 flex flex-col sm:flex-row gap-2 items-center">
                  <select
                    value={newPlatform}
                    onChange={(e) => setNewPlatform(e.target.value as ProfessionalPlatform)}
                    className="w-full sm:w-48 px-3 py-1.5 rounded-xl bg-black border border-white/15 text-xs text-zinc-200"
                  >
                    {Object.entries(PROFESSIONAL_PLATFORM_CONFIG).map(([key, cfg]) => (
                      <option key={key} value={key}>
                        {cfg.label}
                      </option>
                    ))}
                  </select>

                  <Input
                    placeholder={PROFESSIONAL_PLATFORM_CONFIG[newPlatform].placeholder}
                    value={newPlatformUrl}
                    onChange={(e) => setNewPlatformUrl(e.target.value)}
                    className="bg-black/60 border-white/15 text-xs h-8 flex-1"
                  />

                  <Button
                    type="button"
                    size="sm"
                    onClick={handleAddLink}
                    disabled={!newPlatformUrl.trim()}
                    className="bg-white/10 hover:bg-white/20 text-white text-xs h-8 rounded-xl"
                  >
                    <Plus className="w-3.5 h-3.5 mr-1" /> Add Link
                  </Button>
                </div>
              </div>

              {/* Agency Representation */}
              <div className="p-4 rounded-2xl bg-zinc-900/70 border border-white/10 space-y-3">
                <h4 className="text-xs font-mono uppercase text-gold flex items-center gap-1.5">
                  <Building className="w-3.5 h-3.5" />
                  Franchised Talent Agency / Management (Optional)
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <Label className="text-[11px] text-zinc-400">Talent Agency Name</Label>
                    <Input
                      placeholder="e.g. CAA, WME, UTA, Sterling Artists"
                      value={agencyName}
                      onChange={(e) => setAgencyName(e.target.value)}
                      className="bg-black/60 border-white/10 text-xs h-8 mt-1"
                    />
                  </div>

                  <div>
                    <Label className="text-[11px] text-zinc-400">Agent / Manager Name</Label>
                    <Input
                      placeholder="e.g. Vivian Sterling"
                      value={agentName}
                      onChange={(e) => setAgentName(e.target.value)}
                      className="bg-black/60 border-white/10 text-xs h-8 mt-1"
                    />
                  </div>

                  <div>
                    <Label className="text-[11px] text-zinc-400">Agent Booking Email</Label>
                    <Input
                      placeholder="e.g. theatrical@agency.com"
                      value={agentEmail}
                      onChange={(e) => setAgentEmail(e.target.value)}
                      className="bg-black/60 border-white/10 text-xs h-8 mt-1 font-mono"
                    />
                  </div>

                  <div>
                    <Label className="text-[11px] text-zinc-400">Franchise Affiliation</Label>
                    <Input
                      placeholder="e.g. SAG-AFTRA Franchised Agency"
                      value={franchisedGuild}
                      onChange={(e) => setFranchisedGuild(e.target.value)}
                      className="bg-black/60 border-white/10 text-xs h-8 mt-1"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Review & Live Badge Preview */}
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <h4 className="text-xs font-mono uppercase text-gold mb-2">
                  Live Public Badge Preview
                </h4>
                <p className="text-xs text-zinc-400 mb-3">
                  This is how the <strong>'Verified Talent'</strong> badge will display on your public sovereign website and EPK:
                </p>

                {/* Live Preview Component */}
                <div className="p-4 rounded-2xl bg-black border border-white/10 space-y-4">
                  <div className="flex items-center gap-3">
                    <h3 className="text-xl font-display font-bold text-white">
                      {profile.stageName || "Artist Name"}
                    </h3>
                    <VerifiedTalentBadge
                      isVerified={true}
                      talentName={profile.stageName || "Artist Name"}
                      discipline={profile.discipline}
                      unions={unionCredentials}
                      variant="pill"
                    />
                  </div>

                  <VerifiedTalentBadge
                    isVerified={true}
                    talentName={profile.stageName || "Artist Name"}
                    discipline={profile.discipline}
                    unions={unionCredentials}
                    professionalLinks={professionalLinks.filter((l) => l.url)}
                    agencyRepresentation={agencyName ? { agencyName, agentName, agentEmail, franchisedGuild } : undefined}
                    variant="hero"
                  />
                </div>
              </div>

              {/* Summary of credentials */}
              <div className="p-4 rounded-2xl bg-zinc-900/60 border border-white/10 space-y-2 text-xs">
                <div className="flex justify-between text-zinc-400">
                  <span>Talent Name:</span>
                  <span className="text-white font-medium">{profile.stageName}</span>
                </div>
                <div className="flex justify-between text-zinc-400">
                  <span>Unions to Verify:</span>
                  <span className="text-gold font-mono">
                    {unionCredentials.map((u) => u.unionName).join(", ") || "None"}
                  </span>
                </div>
                <div className="flex justify-between text-zinc-400">
                  <span>Professional Links:</span>
                  <span className="text-emerald-400 font-mono">
                    {professionalLinks.filter((l) => l.url).length} profiles attached
                  </span>
                </div>
                {agencyName && (
                  <div className="flex justify-between text-zinc-400">
                    <span>Representation:</span>
                    <span className="text-zinc-200">{agencyName} ({agentName})</span>
                  </div>
                )}
              </div>

              {/* Notice */}
              <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200/90 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                <span>
                  Submitting will record your credentials in the guild audit registry. To test and experience your Verified Talent badge immediately during preview or review, you can click <strong>"Instant Test Verify"</strong>.
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-6 bg-zinc-900/90 border-t border-white/10 flex flex-wrap items-center justify-between gap-3">
          <div>
            {step > 1 && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setStep((step - 1) as 1 | 2)}
                className="border-white/10 text-xs rounded-xl"
              >
                Back
              </Button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {step < 3 ? (
              <Button
                type="button"
                size="sm"
                onClick={() => setStep((step + 1) as 2 | 3)}
                className="bg-gold text-black font-semibold text-xs rounded-xl hover:bg-gold/90"
              >
                Continue
              </Button>
            ) : (
              <>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleSubmitVerification(false)}
                  disabled={isSubmitting}
                  className="border-white/20 text-xs rounded-xl"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" />
                  ) : (
                    <FileCheck2 className="w-3.5 h-3.5 mr-1" />
                  )}
                  Submit for Review
                </Button>

                <Button
                  type="button"
                  size="sm"
                  onClick={() => handleSubmitVerification(true)}
                  disabled={isSubmitting}
                  className="bg-gradient-to-r from-amber-500 via-yellow-400 to-emerald-400 hover:from-amber-400 hover:to-emerald-300 text-zinc-950 font-bold text-xs rounded-xl shadow-lg shadow-amber-500/20"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" />
                  ) : (
                    <Zap className="w-3.5 h-3.5 mr-1" />
                  )}
                  Instant Test Verify (Demo Mode)
                </Button>
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

import React, { useState, useEffect } from "react";
import { 
  ShieldCheck, 
  CheckCircle2, 
  XCircle, 
  ExternalLink, 
  Search, 
  Filter, 
  Clock, 
  UserCheck, 
  Award, 
  Building, 
  Film, 
  Sparkles, 
  RefreshCw,
  AlertCircle,
  Check,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { db } from "@/lib/firebase";
import { 
  collection, 
  getDocs, 
  doc, 
  setDoc, 
  updateDoc,
  query,
  orderBy 
} from "firebase/firestore";
import { TalentVerificationRequest, VerifiedTalentBadgeData } from "@/types/verification";
import { toast } from "sonner";
import VerifiedTalentBadge from "@/components/portfolio/VerifiedTalentBadge";

interface TalentVerificationsSectionProps {
  onRefresh?: () => void;
}

export function TalentVerificationsSection({ onRefresh }: TalentVerificationsSectionProps) {
  const [requests, setRequests] = useState<TalentVerificationRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "verified" | "rejected">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRequest, setSelectedRequest] = useState<TalentVerificationRequest | null>(null);
  const [rejectionNotes, setRejectionNotes] = useState("");
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);

  // Fetch verification submissions
  const fetchVerifications = async () => {
    setLoading(true);
    try {
      const snap = await getDocs(collection(db, "talent_verifications"));
      const loaded: TalentVerificationRequest[] = snap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      })) as TalentVerificationRequest[];

      // Sort newest first
      loaded.sort((a, b) => new Date(b.submissionDate).getTime() - new Date(a.submissionDate).getTime());
      setRequests(loaded);
    } catch (err) {
      console.warn("Could not fetch talent verifications from Firestore:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVerifications();
  }, []);

  // Seed sample requests if empty for instant testability
  const handleSeedSamples = async () => {
    try {
      const samples: TalentVerificationRequest[] = [
        {
          id: "verif_elena_vance",
          user_id: "user_elena_vance_001",
          talentName: "Elena Vance",
          legalName: "Elena Maria Vance",
          email: "elena.vance@hollywoodactors.com",
          discipline: "actor",
          filmDepartment: "acting",
          unions: [
            {
              id: "uc-1",
              unionName: "SAG-AFTRA",
              memberNumber: "SA-8839210",
              localChapter: "Los Angeles Local",
              standing: "in_good_standing",
              verified: false,
            },
            {
              id: "uc-2",
              unionName: "Actors' Equity Association (AEA)",
              memberNumber: "AEA-40192",
              localChapter: "Eastern Board",
              standing: "in_good_standing",
              verified: false,
            },
          ],
          professionalLinks: [
            {
              id: "pl-1",
              platform: "imdb",
              label: "IMDb / IMDbPro",
              url: "https://www.imdb.com/name/nm0000001/",
              verified: false,
            },
            {
              id: "pl-2",
              platform: "spotlight",
              label: "Spotlight UK",
              url: "https://www.spotlight.com/1293-8472-9104",
              verified: false,
            },
            {
              id: "pl-3",
              platform: "actors_access",
              label: "Actors Access",
              url: "https://resumes.actorsaccess.com/elenavance",
              verified: false,
            },
          ],
          agencyRepresentation: {
            agencyName: "United Talent Management",
            agentName: "Sarah Sterling",
            agentEmail: "theatrical@utm-agency.com",
            franchisedGuild: "SAG-AFTRA Franchised",
            verified: false,
          },
          status: "pending",
          submissionDate: new Date(Date.now() - 2 * 3600000).toISOString(),
        },
        {
          id: "verif_david_rossi",
          user_id: "user_david_rossi_002",
          talentName: "David Rossi",
          legalName: "David Antonio Rossi",
          email: "david@rossicamera.com",
          discipline: "film_crew",
          filmDepartment: "camera",
          unions: [
            {
              id: "uc-3",
              unionName: "ICG Local 600 (International Cinematographers Guild)",
              memberNumber: "DP-600-98421",
              localChapter: "Western Region",
              standing: "in_good_standing",
              verified: false,
            },
          ],
          professionalLinks: [
            {
              id: "pl-4",
              platform: "imdb",
              label: "IMDb / IMDbPro",
              url: "https://www.imdb.com/name/nm0000002/",
              verified: false,
            },
            {
              id: "pl-5",
              platform: "staff_me_up",
              label: "Staff Me Up",
              url: "https://staffmeup.com/profile/davidrossidp",
              verified: false,
            },
          ],
          agencyRepresentation: {
            agencyName: "Worldwide Production Agency (WPA)",
            agentName: "Brian Miller",
            agentEmail: "dp@wpa.agency",
            franchisedGuild: "Guild Signatory",
            verified: false,
          },
          status: "pending",
          submissionDate: new Date(Date.now() - 6 * 3600000).toISOString(),
        },
        {
          id: "verif_marcus_reed",
          user_id: "user_marcus_reed_003",
          talentName: "Marcus Reed",
          email: "marcus@reedaudio.com",
          discipline: "film_crew",
          filmDepartment: "sound",
          unions: [
            {
              id: "uc-4",
              unionName: "Cinema Audio Society (CAS)",
              memberNumber: "CAS-MEMBER-491",
              localChapter: "Global Registry",
              standing: "in_good_standing",
              verified: true,
            },
            {
              id: "uc-5",
              unionName: "IATSE Local 695 (Sound & Video)",
              memberNumber: "695-••••3910",
              localChapter: "Hollywood",
              standing: "in_good_standing",
              verified: true,
            },
          ],
          professionalLinks: [
            {
              id: "pl-6",
              platform: "imdb",
              label: "IMDb / IMDbPro",
              url: "https://www.imdb.com/name/nm0000003/",
              verified: true,
            },
          ],
          status: "verified",
          submissionDate: new Date(Date.now() - 48 * 3600000).toISOString(),
          reviewedAt: new Date(Date.now() - 24 * 3600000).toISOString(),
          badgeData: {
            tier: "verified_talent",
            label: "Verified Talent",
            verifiedAt: new Date(Date.now() - 24 * 3600000).toISOString(),
            verifiedUnions: ["Cinema Audio Society (CAS)", "IATSE Local 695"],
            verifiedPlatforms: ["IMDb Pro"],
            verificationToken: "ALIST-TALENT-VERIFIED-REED-695A",
            registryId: "REG-CAS-695-3910",
            agentVetted: false,
          },
        },
      ];

      for (const item of samples) {
        await setDoc(doc(db, "talent_verifications", item.id), item, { merge: true });
      }

      toast.success("Sample verification requests seeded");
      fetchVerifications();
      if (onRefresh) onRefresh();
    } catch (err) {
      toast.error("Error seeding sample verifications: " + (err as Error).message);
    }
  };

  // Approve a verification request
  const handleApprove = async (request: TalentVerificationRequest) => {
    try {
      const activeUnions = request.unions.map((u) => u.unionName);
      const activeLinks = request.professionalLinks.map((l) => l.label);
      const verificationToken = `ALIST-TALENT-VERIFIED-${request.talentName.slice(0, 4).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

      const badgeData: VerifiedTalentBadgeData = {
        tier: "verified_talent",
        label: "Verified Talent",
        verifiedAt: new Date().toISOString(),
        verifiedUnions: activeUnions,
        verifiedPlatforms: activeLinks,
        verificationToken,
        registryId: `REG-VERIFIED-${Date.now().toString(36).toUpperCase()}`,
        agentVetted: Boolean(request.agencyRepresentation?.agencyName),
      };

      // 1. Update verification doc
      await updateDoc(doc(db, "talent_verifications", request.id), {
        status: "verified",
        reviewedAt: new Date().toISOString(),
        badgeData,
        unions: request.unions.map((u) => ({ ...u, verified: true })),
        professionalLinks: request.professionalLinks.map((l) => ({ ...l, verified: true })),
      });

      // 2. Update user's portfolio if document exists
      try {
        await updateDoc(doc(db, "portfolios", request.user_id), {
          "profile.isVerifiedTalent": true,
          "profile.verificationStatus": "verified",
          "profile.verifiedBadge": badgeData,
          "profile.unionCredentials": request.unions.map((u) => ({ ...u, verified: true })),
          "profile.professionalLinks": request.professionalLinks.map((l) => ({ ...l, verified: true })),
        });
      } catch (e) {
        // Portfolio doc might have different ID or not created yet
      }

      toast.success(`Granted 'Verified Talent' Badge to ${request.talentName}`, {
        description: `Active Token: ${verificationToken}`,
      });

      fetchVerifications();
      if (onRefresh) onRefresh();
    } catch (err) {
      toast.error("Failed to approve verification: " + (err as Error).message);
    }
  };

  // Reject a verification request
  const handleReject = async () => {
    if (!selectedRequest) return;
    try {
      await updateDoc(doc(db, "talent_verifications", selectedRequest.id), {
        status: "rejected",
        reviewedAt: new Date().toISOString(),
        reviewNotes: rejectionNotes || "Guild credentials could not be validated with registrar.",
      });

      toast.info(`Rejected verification request for ${selectedRequest.talentName}`);
      setIsRejectDialogOpen(false);
      setSelectedRequest(null);
      setRejectionNotes("");
      fetchVerifications();
      if (onRefresh) onRefresh();
    } catch (err) {
      toast.error("Failed to reject verification: " + (err as Error).message);
    }
  };

  // Filtered requests
  const filteredRequests = requests.filter((r) => {
    if (statusFilter !== "all" && r.status !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = r.talentName.toLowerCase().includes(q);
      const matchEmail = r.email.toLowerCase().includes(q);
      const matchUnion = r.unions.some((u) => u.unionName.toLowerCase().includes(q));
      return matchName || matchEmail || matchUnion;
    }
    return true;
  });

  const pendingCount = requests.filter((r) => r.status === "pending").length;
  const verifiedCount = requests.filter((r) => r.status === "verified").length;

  return (
    <div className="space-y-6">
      {/* Top Controls Ribbon */}
      <div className="p-6 rounded-3xl bg-zinc-900/80 border border-white/10 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-display font-bold text-white">
                  Talent & Guild Verifications
                </h3>
                {pendingCount > 0 && (
                  <Badge className="bg-amber-500 text-zinc-950 font-bold text-xs">
                    {pendingCount} Pending Review
                  </Badge>
                )}
              </div>
              <p className="text-xs text-zinc-400">
                Audit union memberships (SAG-AFTRA, IATSE, DGA, Equity) and professional profile links to issue Verified Talent status.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchVerifications}
              className="border-white/15 text-xs rounded-xl"
            >
              <RefreshCw className="w-3.5 h-3.5 mr-1" /> Refresh
            </Button>
            {requests.length === 0 && (
              <Button
                size="sm"
                onClick={handleSeedSamples}
                className="bg-gold text-black font-semibold text-xs rounded-xl hover:bg-gold/90"
              >
                <Sparkles className="w-3.5 h-3.5 mr-1" /> Seed Demo Verifications
              </Button>
            )}
          </div>
        </div>

        {/* Filter bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-white/10 text-xs">
          <div className="flex items-center gap-1.5 w-full sm:w-auto">
            <button
              onClick={() => setStatusFilter("all")}
              className={`px-3 py-1.5 rounded-xl font-mono transition-all ${
                statusFilter === "all"
                  ? "bg-white text-black font-semibold"
                  : "bg-black/40 text-zinc-400 hover:text-white"
              }`}
            >
              All ({requests.length})
            </button>
            <button
              onClick={() => setStatusFilter("pending")}
              className={`px-3 py-1.5 rounded-xl font-mono transition-all ${
                statusFilter === "pending"
                  ? "bg-amber-500 text-black font-semibold"
                  : "bg-black/40 text-zinc-400 hover:text-white"
              }`}
            >
              Pending ({pendingCount})
            </button>
            <button
              onClick={() => setStatusFilter("verified")}
              className={`px-3 py-1.5 rounded-xl font-mono transition-all ${
                statusFilter === "verified"
                  ? "bg-emerald-500 text-black font-semibold"
                  : "bg-black/40 text-zinc-400 hover:text-white"
              }`}
            >
              Verified ({verifiedCount})
            </button>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-2.5" />
            <Input
              placeholder="Search talent or guild..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-black/40 border-white/15 pl-8 text-xs h-8"
            />
          </div>
        </div>
      </div>

      {/* Requests List */}
      {loading ? (
        <div className="p-12 text-center text-zinc-400 font-mono text-xs">
          Loading verification requests...
        </div>
      ) : filteredRequests.length === 0 ? (
        <div className="p-12 rounded-3xl bg-zinc-900/40 border border-white/10 text-center space-y-3">
          <ShieldCheck className="w-10 h-10 text-zinc-600 mx-auto" />
          <h4 className="text-base font-semibold text-white">No Verification Requests Found</h4>
          <p className="text-xs text-zinc-400 max-w-sm mx-auto">
            No talent credentials match your filter. Creators submit verifications from their Portfolio Editor.
          </p>
          <Button
            size="sm"
            onClick={handleSeedSamples}
            className="bg-gold text-black font-semibold text-xs rounded-xl"
          >
            Seed Demo Requests for Testing
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredRequests.map((req) => (
            <div
              key={req.id}
              className="p-5 rounded-2xl bg-zinc-900/80 border border-white/10 hover:border-white/20 transition-all space-y-4"
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-white/5 pb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-black border border-white/10 text-gold">
                    <UserCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-base font-bold text-white">{req.talentName}</h4>
                      {req.status === "verified" ? (
                        <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 text-[10px] font-mono">
                          ✓ Verified Talent
                        </Badge>
                      ) : req.status === "rejected" ? (
                        <Badge className="bg-red-500/20 text-red-300 border-red-500/30 text-[10px] font-mono">
                          Rejected
                        </Badge>
                      ) : (
                        <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/30 text-[10px] font-mono">
                          Pending Audit
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-zinc-400">
                      {req.email} • {req.discipline} {req.filmDepartment ? `(${req.filmDepartment})` : ""}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs font-mono">
                  <span className="text-zinc-500">
                    {new Date(req.submissionDate).toLocaleDateString()}
                  </span>
                  {req.status === "pending" && (
                    <div className="flex items-center gap-1.5">
                      <Button
                        size="sm"
                        onClick={() => handleApprove(req)}
                        className="bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs h-8 rounded-xl shadow-md shadow-emerald-500/10"
                      >
                        <Check className="w-3.5 h-3.5 mr-1" /> Approve & Grant Badge
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedRequest(req);
                          setIsRejectDialogOpen(true);
                        }}
                        className="border-red-500/30 text-red-400 hover:bg-red-500/10 text-xs h-8 rounded-xl"
                      >
                        <X className="w-3.5 h-3.5 mr-1" /> Reject
                      </Button>
                    </div>
                  )}

                  {req.status === "verified" && req.badgeData && (
                    <VerifiedTalentBadge
                      isVerified={true}
                      talentName={req.talentName}
                      discipline={req.discipline}
                      badgeData={req.badgeData}
                      unions={req.unions}
                      variant="compact"
                    />
                  )}
                </div>
              </div>

              {/* Submitted Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
                {/* Union Credentials */}
                <div className="space-y-1.5 p-3 rounded-xl bg-black/40 border border-white/5">
                  <span className="text-[11px] font-mono uppercase text-gold flex items-center gap-1">
                    <Award className="w-3.5 h-3.5" /> Guild & Union Cards
                  </span>
                  <div className="space-y-1 pt-1">
                    {req.unions.map((u, i) => (
                      <div key={i} className="flex items-center justify-between text-zinc-300">
                        <span className="font-medium text-white">{u.unionName}</span>
                        <span className="text-[11px] font-mono text-zinc-400">
                          {u.memberNumber || "Active"}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Professional Links */}
                <div className="space-y-1.5 p-3 rounded-xl bg-black/40 border border-white/5">
                  <span className="text-[11px] font-mono uppercase text-gold flex items-center gap-1">
                    <Film className="w-3.5 h-3.5" /> Professional Directories
                  </span>
                  <div className="space-y-1 pt-1">
                    {req.professionalLinks.map((l, i) => (
                      <a
                        key={i}
                        href={l.url}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center justify-between text-zinc-300 hover:text-gold transition-colors"
                      >
                        <span>{l.label}</span>
                        <ExternalLink className="w-3 h-3 text-zinc-500" />
                      </a>
                    ))}
                  </div>
                </div>

                {/* Agency Representation */}
                <div className="space-y-1.5 p-3 rounded-xl bg-black/40 border border-white/5">
                  <span className="text-[11px] font-mono uppercase text-gold flex items-center gap-1">
                    <Building className="w-3.5 h-3.5" /> Representation
                  </span>
                  <div className="pt-1 text-zinc-300 space-y-0.5">
                    {req.agencyRepresentation ? (
                      <>
                        <p className="font-medium text-white">
                          {req.agencyRepresentation.agencyName}
                        </p>
                        <p className="text-[11px] text-zinc-400">
                          Agent: {req.agencyRepresentation.agentName}
                        </p>
                        {req.agencyRepresentation.franchisedGuild && (
                          <p className="text-[10px] text-emerald-400 font-mono">
                            {req.agencyRepresentation.franchisedGuild}
                          </p>
                        )}
                      </>
                    ) : (
                      <span className="text-zinc-500">Independent / Direct Booking</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Reject Reason Dialog */}
      <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
        <DialogContent className="bg-zinc-950 border border-white/20 text-white max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">Reject Verification Request</DialogTitle>
            <DialogDescription className="text-xs text-zinc-400">
              Provide feedback for {selectedRequest?.talentName} regarding why their guild credentials could not be verified.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2">
            <Input
              placeholder="Reason (e.g. SAG card ID could not be matched with registry)"
              value={rejectionNotes}
              onChange={(e) => setRejectionNotes(e.target.value)}
              className="bg-black border-white/20 text-xs"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsRejectDialogOpen(false)}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleReject}
              className="text-xs"
            >
              Confirm Rejection
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

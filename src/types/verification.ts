export type UnionStanding = 'active' | 'in_good_standing' | 'apprentice' | 'honorary' | 'inactive';

export type ProfessionalPlatform = 
  | 'imdb' 
  | 'spotlight' 
  | 'actors_access' 
  | 'casting_networks' 
  | 'staff_me_up' 
  | 'mandy' 
  | 'linkedin' 
  | 'agency_roster' 
  | 'vimeo_pro'
  | 'other';

export interface UnionCredential {
  id: string;
  unionName: string; // e.g. "SAG-AFTRA", "IATSE Local 728", "DGA", "WGA West", "Actors' Equity (AEA)"
  memberNumber?: string; // e.g. "SA-904128" (can be partially masked e.g. "••••4128")
  localChapter?: string; // e.g. "Los Angeles Local", "New York Chapter", "Atlanta Local"
  standing: UnionStanding;
  joinedYear?: string;
  proofDocumentUrl?: string; // Document or card scan preview
  proofDocumentName?: string;
  verified: boolean;
  verifiedAt?: string;
}

export interface ProfessionalProfileLink {
  id: string;
  platform: ProfessionalPlatform;
  label: string; // e.g. "IMDb Pro", "Spotlight UK", "Actors Access"
  url: string;
  accountHolderName?: string;
  verified: boolean;
  verifiedAt?: string;
}

export interface AgencyRepresentationInfo {
  agencyName: string;
  agentName: string;
  agentEmail?: string;
  agentPhone?: string;
  franchisedGuild?: string; // e.g. "SAG-AFTRA Franchised", "ATA Member"
  verified?: boolean;
}

export type VerificationStatus = 'unverified' | 'pending' | 'verified' | 'rejected';

export type VerifiedBadgeTier = 'verified_talent' | 'union_signatory' | 'master_craft';

export interface VerifiedTalentBadgeData {
  tier: VerifiedBadgeTier;
  label: string;
  verifiedAt: string;
  verifiedUnions: string[];
  verifiedPlatforms: string[];
  verificationToken: string; // e.g. "ALIST-VERIFIED-982F"
  registryId: string;
  agentVetted?: boolean;
}

export interface TalentVerificationRequest {
  id: string;
  user_id: string;
  talentName: string;
  legalName?: string;
  email: string;
  discipline: string;
  filmDepartment?: string;
  unions: UnionCredential[];
  professionalLinks: ProfessionalProfileLink[];
  agencyRepresentation?: AgencyRepresentationInfo;
  status: VerificationStatus;
  submissionDate: string;
  reviewedAt?: string;
  reviewedBy?: string;
  reviewNotes?: string;
  badgeData?: VerifiedTalentBadgeData;
}

export const POPULAR_ENTERTAINMENT_UNIONS = [
  { id: "sag_aftra", name: "SAG-AFTRA", category: "Performers & Broadcasters", jurisdiction: "US National" },
  { id: "actors_equity", name: "Actors' Equity Association (AEA)", category: "Theatrical Stage", jurisdiction: "US National" },
  { id: "dga", name: "Directors Guild of America (DGA)", category: "Directorial & ADs", jurisdiction: "US & Global" },
  { id: "wga_west", name: "Writers Guild of America West (WGAW)", category: "Screen & Television Writers", jurisdiction: "US West" },
  { id: "wga_east", name: "Writers Guild of America East (WGAE)", category: "Writers", jurisdiction: "US East" },
  { id: "iatse_728", name: "IATSE Local 728 (Motion Picture Lighting Techs)", category: "Electric & Lighting", jurisdiction: "Hollywood" },
  { id: "iatse_80", name: "IATSE Local 80 (Grip, Crafts, Marine)", category: "Grip & Rigging", jurisdiction: "Hollywood" },
  { id: "icg_600", name: "ICG Local 600 (International Cinematographers Guild)", category: "Camera & DP", jurisdiction: "US National" },
  { id: "iatse_695", name: "IATSE Local 695 (Production Sound & Video)", category: "Sound & Audio", jurisdiction: "Hollywood" },
  { id: "iatse_700", name: "IATSE Local 700 (Motion Picture Editors Guild)", category: "Editorial & Post", jurisdiction: "US National" },
  { id: "adg_800", name: "Art Directors Guild (ADG Local 800)", category: "Art & Production Design", jurisdiction: "US National" },
  { id: "cas", name: "Cinema Audio Society (CAS)", category: "Audio Engineering", jurisdiction: "Global Society" },
  { id: "afm_47", name: "American Federation of Musicians (AFM Local 47)", category: "Musicians & Scoring", jurisdiction: "US / Canada" },
  { id: "equity_uk", name: "Equity UK", category: "Performers", jurisdiction: "United Kingdom" },
  { id: "bectu", name: "BECTU", category: "Film & TV Production Crew", jurisdiction: "United Kingdom" },
  { id: "ascap", name: "ASCAP (Performing Rights Organization)", category: "Music Composers & Songwriters", jurisdiction: "Global" },
  { id: "bmi", name: "BMI (Broadcast Music Inc.)", category: "Music Composers & Songwriters", jurisdiction: "Global" },
  { id: "grammys", name: "The Recording Academy (GRAMMYs Voting Member)", category: "Music Industry", jurisdiction: "Global" },
];

export const PROFESSIONAL_PLATFORM_CONFIG: Record<
  ProfessionalPlatform,
  { label: string; placeholder: string; icon: string; urlPrefixMatch: RegExp }
> = {
  imdb: {
    label: "IMDb / IMDbPro",
    placeholder: "https://www.imdb.com/name/nm0000000/ or imdbpro.com",
    icon: "Film",
    urlPrefixMatch: /imdb\.com\/(name\/|pro\/)/i,
  },
  spotlight: {
    label: "Spotlight UK",
    placeholder: "https://www.spotlight.com/0000-0000-0000",
    icon: "Sparkles",
    urlPrefixMatch: /spotlight\.com/i,
  },
  actors_access: {
    label: "Actors Access (Breakdown Services)",
    placeholder: "https://resumes.actorsaccess.com/yourname",
    icon: "UserCheck",
    urlPrefixMatch: /actorsaccess\.com/i,
  },
  casting_networks: {
    label: "Casting Networks",
    placeholder: "https://app.castingnetworks.com/talent/public-profile/...",
    icon: "Clapperboard",
    urlPrefixMatch: /castingnetworks\.com/i,
  },
  staff_me_up: {
    label: "Staff Me Up",
    placeholder: "https://staffmeup.com/profile/yourname",
    icon: "Briefcase",
    urlPrefixMatch: /staffmeup\.com/i,
  },
  mandy: {
    label: "Mandy / Backstage",
    placeholder: "https://mandy.com/actor/profile/...",
    icon: "Theater",
    urlPrefixMatch: /(mandy\.com|backstage\.com)/i,
  },
  linkedin: {
    label: "LinkedIn Professional",
    placeholder: "https://linkedin.com/in/yourname",
    icon: "Linkedin",
    urlPrefixMatch: /linkedin\.com/i,
  },
  agency_roster: {
    label: "Official Agency Roster",
    placeholder: "https://agencywebsite.com/clients/yourname",
    icon: "Building",
    urlPrefixMatch: /https?:\/\//i,
  },
  vimeo_pro: {
    label: "Vimeo Pro Reel Portfolio",
    placeholder: "https://vimeo.com/yourname",
    icon: "Video",
    urlPrefixMatch: /vimeo\.com/i,
  },
  other: {
    label: "Other Professional Link",
    placeholder: "https://...",
    icon: "Link",
    urlPrefixMatch: /https?:\/\//i,
  },
};

export type CreatorDiscipline = 'musician' | 'actor' | 'film_crew' | 'dual';

export type FilmDepartment =
  | 'directing'
  | 'production'
  | 'camera'
  | 'electric_lighting'
  | 'grip'
  | 'sound'
  | 'art_department'
  | 'costume'
  | 'hair_makeup'
  | 'stunts'
  | 'vfx'
  | 'editorial'
  | 'locations'
  | 'casting'
  | 'music_scoring'
  | 'acting';

export interface EquipmentItem {
  id: string;
  name: string;
  category: 'lighting' | 'camera' | 'grip' | 'sound' | 'post' | 'specialized';
  description?: string;
  isAvailableForRent?: boolean;
}

export interface FilmCreditItem {
  id: string;
  title: string;
  year: string;
  role: string;
  department: FilmDepartment | string;
  productionCompany?: string;
  directorOrDP?: string;
  festivalAwards?: string;
  imdbUrl?: string;
  isFeatured?: boolean;
}

export interface ShowreelItem {
  id: string;
  title: string;
  url: string;
  category: 
    | 'dramatic' 
    | 'comedic' 
    | 'commercial' 
    | 'live_performance' 
    | 'music_video' 
    | 'stunt' 
    | 'voiceover'
    | 'cinematography'
    | 'lighting_gaffer'
    | 'grip_rigging'
    | 'sound_mix'
    | 'directing'
    | 'editing_color'
    | 'vfx_breakdown';
  roleOrCharacter?: string;
  duration?: string; // e.g. "03:45" or "PT3M45S"
  uploadDate?: string;
  thumbnailUrl?: string;
  description?: string;
  isPrivate?: boolean;
}

export interface TrackItem {
  id: string;
  title: string;
  duration?: string;
  audioPreviewUrl?: string;
  featuredArtist?: string;
  isrc?: string;
}

export interface DiscographyRelease {
  id: string;
  title: string;
  releaseType: 'Album' | 'EP' | 'Single' | 'Soundtrack' | 'Live' | 'Compilation';
  releaseDate: string; // YYYY-MM-DD
  label?: string;
  artworkUrl?: string;
  spotifyUrl?: string;
  appleMusicUrl?: string;
  bandcampUrl?: string;
  tracks: TrackItem[];
  upc?: string;
  description?: string;
}

export interface HeadshotItem {
  id: string;
  imageUrl: string;
  shotType: 'theatrical' | 'commercial' | 'dramatic_closeup' | 'full_body' | 'live_stage' | 'editorial';
  resolution?: string; // e.g. "300 DPI 4K", "8K Raw", "Web Optimized"
  photographerCredit?: string;
  year?: string;
  isPrimary?: boolean;
  caption?: string;
}

export interface PortfolioProfile {
  stageName: string;
  discipline: CreatorDiscipline;
  filmDepartment?: FilmDepartment;
  filmRole?: string; // e.g. "Best Boy Electric", "Key Grip", "Gaffer", "DP", "Sound Mixer", "1st AD"
  yearsExperience?: string;
  dayRateGuideline?: string;
  tagline: string;
  bio: string;
  unions: string[]; // e.g. ['IATSE Local 728', 'IATSE Local 80', 'ICG Local 600', 'DGA', 'SAG-AFTRA', 'CAS']
  primaryGenresOrTypes: string[]; // e.g. ['Narrative Features', 'High-Budget Commercials', 'Music Videos']
  imdbUrl?: string;
  spotifyArtistUrl?: string;
  appleMusicArtistUrl?: string;
  bandcampArtistUrl?: string;
  youtubeChannelUrl?: string;
  vimeoUrl?: string;
  instagramHandle?: string;
  agentName?: string;
  agencyName?: string;
  bookingEmail?: string;
  bookingPhone?: string;
  location?: string;
  websiteUrl?: string;
}

export interface PortfolioData {
  id?: string;
  user_id?: string;
  profile: PortfolioProfile;
  showreels: ShowreelItem[];
  discography: DiscographyRelease[];
  headshots: HeadshotItem[];
  equipmentKit?: EquipmentItem[];
  filmCredits?: FilmCreditItem[];
  updatedAt?: string;
}

export interface SEOAuditItem {
  key: string;
  label: string;
  status: 'passed' | 'warning' | 'missing';
  message: string;
  impact: 'high' | 'medium' | 'low';
}

export interface SEOAuditResult {
  score: number; // 0 to 100
  items: SEOAuditItem[];
  richResultsEligible: {
    videoCarousel: boolean;
    musicAlbumKnowledgePanel: boolean;
    personActorKnowledgeCard: boolean;
    imageLicensing: boolean;
  };
}

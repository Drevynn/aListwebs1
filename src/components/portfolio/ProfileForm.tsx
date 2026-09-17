import { PortfolioProfile, CreatorDiscipline, FilmDepartment } from "@/types/portfolio";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Music, 
  Clapperboard, 
  Sparkles, 
  ShieldCheck, 
  Plus, 
  X, 
  Link as LinkIcon,
  User,
  Mail,
  Phone,
  Building,
  Film,
  Wrench,
  DollarSign
} from "lucide-react";
import { useState } from "react";
import { FILM_DEPARTMENTS, ALL_FILM_GUILDS } from "@/lib/filmDepartments";

interface ProfileFormProps {
  profile: PortfolioProfile;
  onChange: (updated: PortfolioProfile) => void;
}

const COMMON_UNIONS = [
  "IATSE Local 728 (Lighting & Electric)",
  "IATSE Local 80 (Grip & Crafts)",
  "ICG Local 600 (Cinematographers)",
  "IATSE Local 695 (Sound & Video)",
  "IATSE Local 700 (Editors Guild)",
  "Directors Guild of America (DGA)",
  "SAG-AFTRA",
  "Cinema Audio Society (CAS)",
  "Art Directors Guild (ADG 800)",
  "Actors' Equity (AEA)",
  "ASCAP",
  "BMI",
  "The Recording Academy (GRAMMYs)",
];

export default function ProfileForm({ profile, onChange }: ProfileFormProps) {
  const [newUnion, setNewUnion] = useState("");
  const [newGenre, setNewGenre] = useState("");

  const setField = <K extends keyof PortfolioProfile>(field: K, value: PortfolioProfile[K]) => {
    onChange({ ...profile, [field]: value });
  };

  const addUnion = (union: string) => {
    const trimmed = union.trim();
    if (trimmed && !profile.unions.includes(trimmed)) {
      setField("unions", [...profile.unions, trimmed]);
      setNewUnion("");
    }
  };

  const removeUnion = (union: string) => {
    setField("unions", profile.unions.filter((u) => u !== union));
  };

  const addGenre = () => {
    const trimmed = newGenre.trim();
    if (trimmed && !profile.primaryGenresOrTypes.includes(trimmed)) {
      setField("primaryGenresOrTypes", [...profile.primaryGenresOrTypes, trimmed]);
      setNewGenre("");
    }
  };

  const removeGenre = (genre: string) => {
    setField("primaryGenresOrTypes", profile.primaryGenresOrTypes.filter((g) => g !== genre));
  };

  return (
    <div className="space-y-8">
      {/* Discipline Selector */}
      <div className="p-5 rounded-2xl bg-zinc-900/60 border border-white/10 space-y-3">
        <label className="text-xs font-mono uppercase tracking-wider text-gold flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5" />
          Creative Discipline Focus *
        </label>
        <p className="text-xs text-muted-foreground">
          Determines which Schema.org structured data types (MusicGroup, Person, VideoObject) Google will prioritize.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
          <button
            type="button"
            onClick={() => setField("discipline", "musician")}
            className={`p-3.5 rounded-xl border text-left transition-all flex flex-col gap-1.5 ${
              profile.discipline === "musician"
                ? "bg-amber-500/15 border-amber-400 text-white shadow-lg shadow-amber-500/10"
                : "bg-black/40 border-white/10 text-zinc-300 hover:border-white/20"
            }`}
          >
            <div className="flex items-center gap-2 font-display font-semibold text-sm">
              <Music className={`w-4 h-4 ${profile.discipline === "musician" ? "text-amber-400" : "text-zinc-400"}`} />
              Musician / Band
            </div>
            <span className="text-xs text-muted-foreground">
              Discography, lossless audio, albums & Schema.org/MusicGroup.
            </span>
          </button>

          <button
            type="button"
            onClick={() => setField("discipline", "actor")}
            className={`p-3.5 rounded-xl border text-left transition-all flex flex-col gap-1.5 ${
              profile.discipline === "actor"
                ? "bg-amber-500/15 border-amber-400 text-white shadow-lg shadow-amber-500/10"
                : "bg-black/40 border-white/10 text-zinc-300 hover:border-white/20"
            }`}
          >
            <div className="flex items-center gap-2 font-display font-semibold text-sm">
              <Clapperboard className={`w-4 h-4 ${profile.discipline === "actor" ? "text-amber-400" : "text-zinc-400"}`} />
              Actor / Performer
            </div>
            <span className="text-xs text-muted-foreground">
              Casting reels, headshots, rep info & Schema.org/Person.
            </span>
          </button>

          <button
            type="button"
            onClick={() => setField("discipline", "film_crew")}
            className={`p-3.5 rounded-xl border text-left transition-all flex flex-col gap-1.5 ${
              profile.discipline === "film_crew"
                ? "bg-amber-500/15 border-amber-400 text-white shadow-lg shadow-amber-500/10"
                : "bg-black/40 border-white/10 text-zinc-300 hover:border-white/20"
            }`}
          >
            <div className="flex items-center gap-2 font-display font-semibold text-sm">
              <Film className={`w-4 h-4 ${profile.discipline === "film_crew" ? "text-amber-400" : "text-zinc-400"}`} />
              Film Crew & Depts
            </div>
            <span className="text-xs text-muted-foreground">
              Best Boys, Gaffers, Grips, Sound, DP, Directing & Kit Rentals.
            </span>
          </button>

          <button
            type="button"
            onClick={() => setField("discipline", "dual")}
            className={`p-3.5 rounded-xl border text-left transition-all flex flex-col gap-1.5 ${
              profile.discipline === "dual"
                ? "bg-amber-500/15 border-amber-400 text-white shadow-lg shadow-amber-500/10"
                : "bg-black/40 border-white/10 text-zinc-300 hover:border-white/20"
            }`}
          >
            <div className="flex items-center gap-2 font-display font-semibold text-sm">
              <Sparkles className={`w-4 h-4 ${profile.discipline === "dual" ? "text-amber-400" : "text-zinc-400"}`} />
              Multi-Hyphenate
            </div>
            <span className="text-xs text-muted-foreground">
              Dual graph schema linking music, film, acting, and crew roles.
            </span>
          </button>
        </div>
      </div>

      {/* Film Department & Role Specifics (Highlighted if film_crew or dual) */}
      {(profile.discipline === "film_crew" || profile.filmDepartment || profile.discipline === "dual") && (
        <div className="p-5 rounded-2xl bg-amber-500/5 border border-amber-500/30 space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-xs font-mono uppercase tracking-wider text-amber-400 flex items-center gap-2">
              <Film className="w-4 h-4" />
              Film Department & On-Set Specialization
            </label>
            <span className="text-[11px] text-zinc-400 font-mono">
              Every Department Represented
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-mono uppercase tracking-wider text-zinc-300">
                Film Department *
              </label>
              <select
                value={profile.filmDepartment || "electric_lighting"}
                onChange={(e) => setField("filmDepartment", e.target.value as FilmDepartment)}
                className="w-full h-10 px-3 rounded-md bg-black/50 border border-white/15 focus:border-amber-400 text-xs text-zinc-100 outline-none"
              >
                {FILM_DEPARTMENTS.map((dept) => (
                  <option key={dept.id} value={dept.id}>
                    {dept.label} (e.g. {dept.headTitle})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-mono uppercase tracking-wider text-zinc-300">
                Specific Film Role / Credit Title *
              </label>
              <Input
                value={profile.filmRole || ""}
                onChange={(e) => setField("filmRole", e.target.value)}
                placeholder="e.g. Best Boy Electric, Key Grip, Gaffer, 1st AC, DP"
                className="bg-black/40 border-white/15 focus:border-amber-400"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
            <div className="space-y-1.5">
              <label className="text-xs font-mono uppercase tracking-wider text-zinc-300">
                Years of Set Experience
              </label>
              <Input
                value={profile.yearsExperience || ""}
                onChange={(e) => setField("yearsExperience", e.target.value)}
                placeholder="e.g. 14 Years on Set / 12 Features"
                className="bg-black/40 border-white/15 focus:border-amber-400"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-mono uppercase tracking-wider text-zinc-300">
                Day Rate Guideline & Box Rental
              </label>
              <Input
                value={profile.dayRateGuideline || ""}
                onChange={(e) => setField("dayRateGuideline", e.target.value)}
                placeholder="e.g. IATSE Local 728 Scale ($950/10hr + $150 kit rental)"
                className="bg-black/40 border-white/15 focus:border-amber-400"
              />
            </div>
          </div>
        </div>
      )}

      {/* Primary Identity */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="space-y-1.5">
          <label className="text-xs font-mono uppercase tracking-wider text-zinc-300">
            Stage / Professional Name *
          </label>
          <Input
            value={profile.stageName}
            onChange={(e) => setField("stageName", e.target.value)}
            placeholder="e.g. Abledsoul or Marcus Vance"
            className="bg-black/40 border-white/15 focus:border-gold"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-mono uppercase tracking-wider text-zinc-300">
            Professional Tagline / Logline
          </label>
          <Input
            value={profile.tagline}
            onChange={(e) => setField("tagline", e.target.value)}
            placeholder="e.g. Industrial Metal & Darkwave or SAG-AFTRA Dramatic Lead"
            className="bg-black/40 border-white/15 focus:border-gold"
          />
        </div>

        <div className="space-y-1.5 md:col-span-2">
          <label className="text-xs font-mono uppercase tracking-wider text-zinc-300">
            Artist & Performer Biography (SEO Meta Description)
          </label>
          <Textarea
            value={profile.bio}
            onChange={(e) => setField("bio", e.target.value)}
            rows={3}
            placeholder="A compelling, authoritative bio detailing artistic style, notable works, training, and achievements..."
            className="bg-black/40 border-white/15 focus:border-gold resize-none"
          />
        </div>
      </div>

      {/* Genres and Casting Types */}
      <div className="space-y-3 p-5 rounded-2xl bg-zinc-900/60 border border-white/10">
        <label className="text-xs font-mono uppercase tracking-wider text-zinc-300">
          {profile.discipline === "actor"
            ? "Casting Types, Roles & Special Skills (Schema.org/skills)"
            : "Musical Genres & Sonic Signatures (Schema.org/genre)"}
        </label>

        <div className="flex flex-wrap gap-2">
          {profile.primaryGenresOrTypes.map((genre) => (
            <Badge
              key={genre}
              variant="outline"
              className="bg-white/5 border-white/20 text-zinc-200 px-3 py-1 flex items-center gap-1.5"
            >
              <span>{genre}</span>
              <button
                type="button"
                onClick={() => removeGenre(genre)}
                className="text-zinc-400 hover:text-white"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          ))}
        </div>

        <div className="flex gap-2 max-w-md">
          <Input
            value={newGenre}
            onChange={(e) => setNewGenre(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addGenre())}
            placeholder={
              profile.discipline === "actor"
                ? "e.g. Psychological Thriller, Screen Combat, Period Drama"
                : "e.g. Industrial Metal, Dark Ambient, Modular Synth"
            }
            className="bg-black/40 border-white/15 text-sm"
          />
          <Button type="button" variant="outline" size="sm" onClick={addGenre} className="border-white/20">
            <Plus className="w-4 h-4 mr-1" /> Add
          </Button>
        </div>
      </div>

      {/* Unions & Guild Affiliations */}
      <div className="space-y-3 p-5 rounded-2xl bg-zinc-900/60 border border-white/10">
        <div className="flex items-center justify-between">
          <label className="text-xs font-mono uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            Union & Professional Guild Affiliations (Schema.org/affiliation)
          </label>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {COMMON_UNIONS.map((u) => {
            const isSelected = profile.unions.includes(u);
            return (
              <button
                key={u}
                type="button"
                onClick={() => (isSelected ? removeUnion(u) : addUnion(u))}
                className={`text-xs px-2.5 py-1 rounded-full border transition-all ${
                  isSelected
                    ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-300 font-medium"
                    : "bg-white/5 border-white/10 text-zinc-400 hover:border-white/20"
                }`}
              >
                {isSelected ? "✓ " : "+ "}
                {u}
              </button>
            );
          })}
        </div>

        <div className="flex gap-2 max-w-md pt-2">
          <Input
            value={newUnion}
            onChange={(e) => setNewUnion(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addUnion(newUnion))}
            placeholder="Add custom guild (e.g. DGA, WGA, AFM Local 47)"
            className="bg-black/40 border-white/15 text-sm"
          />
          <Button type="button" variant="outline" size="sm" onClick={() => addUnion(newUnion)} className="border-white/20">
            <Plus className="w-4 h-4 mr-1" /> Add
          </Button>
        </div>
      </div>

      {/* Representation & Agency ContactPoint */}
      <div className="space-y-4 p-5 rounded-2xl bg-zinc-900/60 border border-white/10">
        <label className="text-xs font-mono uppercase tracking-wider text-gold flex items-center gap-2">
          <Building className="w-3.5 h-3.5" />
          Representation & Booking ContactPoint (Schema.org/contactPoint)
        </label>
        <p className="text-xs text-muted-foreground">
          Enables casting agents, music supervisors, and festival promoters to route bookings directly.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs text-zinc-300">Agent / Manager Name</label>
            <div className="relative">
              <User className="w-4 h-4 text-zinc-500 absolute left-3 top-3" />
              <Input
                value={profile.agentName || ""}
                onChange={(e) => setField("agentName", e.target.value)}
                placeholder="e.g. Vivian Sterling"
                className="bg-black/40 border-white/15 pl-9 text-sm"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs text-zinc-300">Agency / Management Firm</label>
            <div className="relative">
              <Building className="w-4 h-4 text-zinc-500 absolute left-3 top-3" />
              <Input
                value={profile.agencyName || ""}
                onChange={(e) => setField("agencyName", e.target.value)}
                placeholder="e.g. Sterling Artists Agency (LA/London)"
                className="bg-black/40 border-white/15 pl-9 text-sm"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs text-zinc-300">Booking / Inquiries Email *</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-zinc-500 absolute left-3 top-3" />
              <Input
                type="email"
                value={profile.bookingEmail || ""}
                onChange={(e) => setField("bookingEmail", e.target.value)}
                placeholder="booking@agency.com"
                className="bg-black/40 border-white/15 pl-9 text-sm"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs text-zinc-300">Agency Direct Phone</label>
            <div className="relative">
              <Phone className="w-4 h-4 text-zinc-500 absolute left-3 top-3" />
              <Input
                type="tel"
                value={profile.bookingPhone || ""}
                onChange={(e) => setField("bookingPhone", e.target.value)}
                placeholder="+1 (310) 555-0199"
                className="bg-black/40 border-white/15 pl-9 text-sm"
              />
            </div>
          </div>
        </div>
      </div>

      {/* External Authority Registries (sameAs) */}
      <div className="space-y-4 p-5 rounded-2xl bg-zinc-900/60 border border-white/10">
        <label className="text-xs font-mono uppercase tracking-wider text-gold flex items-center gap-2">
          <LinkIcon className="w-3.5 h-3.5" />
          Authority Registries & Verified URLs (Schema.org/sameAs)
        </label>
        <p className="text-xs text-muted-foreground">
          Linking recognized platforms anchors your knowledge panel in Google Search and Knowledge Graph.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs text-zinc-300">IMDb Profile URL (for Actors/Composers)</label>
            <Input
              value={profile.imdbUrl || ""}
              onChange={(e) => setField("imdbUrl", e.target.value)}
              placeholder="https://www.imdb.com/name/nm..."
              className="bg-black/40 border-white/15 text-sm font-mono"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs text-zinc-300">Spotify Artist URL (for Musicians)</label>
            <Input
              value={profile.spotifyArtistUrl || ""}
              onChange={(e) => setField("spotifyArtistUrl", e.target.value)}
              placeholder="https://open.spotify.com/artist/..."
              className="bg-black/40 border-white/15 text-sm font-mono"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs text-zinc-300">Bandcamp URL</label>
            <Input
              value={profile.bandcampArtistUrl || ""}
              onChange={(e) => setField("bandcampArtistUrl", e.target.value)}
              placeholder="https://artist.bandcamp.com"
              className="bg-black/40 border-white/15 text-sm font-mono"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs text-zinc-300">YouTube Channel or Showreel Hub</label>
            <Input
              value={profile.youtubeChannelUrl || ""}
              onChange={(e) => setField("youtubeChannelUrl", e.target.value)}
              placeholder="https://youtube.com/@handle"
              className="bg-black/40 border-white/15 text-sm font-mono"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs text-zinc-300">Instagram Handle</label>
            <Input
              value={profile.instagramHandle || ""}
              onChange={(e) => setField("instagramHandle", e.target.value)}
              placeholder="@artist_handle"
              className="bg-black/40 border-white/15 text-sm font-mono"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs text-zinc-300">Vimeo Showreel / Portfolio Channel</label>
            <Input
              value={profile.vimeoUrl || ""}
              onChange={(e) => setField("vimeoUrl", e.target.value)}
              placeholder="https://vimeo.com/handle"
              className="bg-black/40 border-white/15 text-sm font-mono"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs text-zinc-300">Sovereign Canonical Website Domain</label>
            <Input
              value={profile.websiteUrl || ""}
              onChange={(e) => setField("websiteUrl", e.target.value)}
              placeholder="https://yourname.com"
              className="bg-black/40 border-white/15 text-sm font-mono"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

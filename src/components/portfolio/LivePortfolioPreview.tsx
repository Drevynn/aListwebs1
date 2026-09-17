import { PortfolioData, ShowreelItem } from "@/types/portfolio";
import { parseVideoUrl } from "@/lib/seoSchemaGenerator";
import { FILM_DEPARTMENTS } from "@/lib/filmDepartments";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Play, 
  Pause, 
  ExternalLink, 
  ShieldCheck, 
  Mail, 
  MapPin, 
  Film, 
  Disc3, 
  Camera, 
  Star,
  CheckCircle2,
  ZoomIn,
  Building,
  Wrench,
  Award,
  DollarSign,
  User,
  Box
} from "lucide-react";
import { useState, useRef } from "react";

interface LivePortfolioPreviewProps {
  portfolio: PortfolioData;
}

export default function LivePortfolioPreview({ portfolio }: LivePortfolioPreviewProps) {
  const { profile, showreels, discography, headshots, filmCredits, equipmentKit } = portfolio;
  const [activeReel, setActiveReel] = useState<ShowreelItem | null>(showreels[0] || null);
  const [playingTrackId, setPlayingTrackId] = useState<string | null>(null);
  const [zoomedHeadshot, setZoomedHeadshot] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const primaryHeadshot = headshots.find((h) => h.isPrimary) || headshots[0];
  const parsedActiveVideo = activeReel ? parseVideoUrl(activeReel.url) : null;
  const deptMeta = FILM_DEPARTMENTS.find((d) => d.id === profile.filmDepartment);

  const handleToggleAudio = (trackId: string, previewUrl?: string) => {
    if (!previewUrl) return;

    if (playingTrackId === trackId) {
      audioRef.current?.pause();
      setPlayingTrackId(null);
    } else {
      if (!audioRef.current) {
        audioRef.current = new Audio();
        audioRef.current.onended = () => setPlayingTrackId(null);
      }
      audioRef.current.src = previewUrl;
      audioRef.current.play().catch(() => {});
      setPlayingTrackId(trackId);
    }
  };

  return (
    <div className="space-y-12 bg-black/60 rounded-3xl border border-white/10 p-6 md:p-10 shadow-2xl">
      {/* Live Preview Notification */}
      <div className="flex items-center justify-between p-3.5 rounded-xl bg-gold/10 border border-gold/30 text-gold text-xs font-mono">
        <span className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          LIVE RENDERING ENGINE — Real-time Client-Side Preview
        </span>
        <span className="hidden sm:inline text-zinc-400">
          Domain: {profile.websiteUrl || "https://alistwebs.com"}
        </span>
      </div>

      {/* Hero Header Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center pt-4">
        <div className="lg:col-span-8 space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-white/10 border border-white/20 text-xs font-mono uppercase tracking-wider text-white">
              {profile.discipline === "musician" ? "Recording Artist" : profile.discipline === "actor" ? "Theatrical & Screen Actor" : "Actor & Recording Artist"}
            </span>
            {profile.unions.map((u) => (
              <span
                key={u}
                className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-[11px] font-mono flex items-center gap-1"
              >
                <ShieldCheck className="w-3 h-3" /> {u}
              </span>
            ))}
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-extrabold text-white tracking-tight">
            {profile.stageName || "Artist Name"}
          </h1>

          <p className="text-lg text-gold font-medium">
            {profile.tagline || "Creator Portfolio & Sovereign Digital Presence"}
          </p>

          <p className="text-sm text-zinc-300 max-w-2xl leading-relaxed">
            {profile.bio || "No biography added yet."}
          </p>

          {/* Key tags */}
          <div className="flex flex-wrap gap-1.5 pt-2">
            {profile.primaryGenresOrTypes.map((g) => (
              <Badge key={g} variant="outline" className="text-xs bg-white/5 border-white/10 text-zinc-300">
                {g}
              </Badge>
            ))}
          </div>

          {/* Representation & Contact CTA */}
          <div className="pt-4 flex flex-wrap items-center gap-3">
            {profile.bookingEmail && (
              <Button
                variant="hero"
                size="sm"
                onClick={() => window.open(`mailto:${profile.bookingEmail}?subject=Booking Inquiry for ${profile.stageName}`, "_blank")}
                className="rounded-xl"
              >
                <Mail className="w-4 h-4 mr-1.5" /> Book / Casting Inquiry
              </Button>
            )}

            {profile.imdbUrl && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(profile.imdbUrl, "_blank")}
                className="rounded-xl border-white/20 text-xs"
              >
                IMDb Profile <ExternalLink className="w-3 h-3 ml-1" />
              </Button>
            )}

            {profile.spotifyArtistUrl && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(profile.spotifyArtistUrl, "_blank")}
                className="rounded-xl border-white/20 text-xs text-emerald-400 hover:text-emerald-300"
              >
                Spotify Artist <ExternalLink className="w-3 h-3 ml-1" />
              </Button>
            )}
          </div>
        </div>

        {/* Primary Hero Headshot */}
        <div className="lg:col-span-4 flex justify-center">
          <div className="relative w-full max-w-sm aspect-[4/5] rounded-2xl overflow-hidden border border-white/20 shadow-2xl group">
            {primaryHeadshot ? (
              <img
                src={primaryHeadshot.imageUrl}
                alt={profile.stageName}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            ) : (
              <div className="w-full h-full bg-zinc-900 flex items-center justify-center text-zinc-600">
                <Camera className="w-12 h-12" />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-80" />
            <div className="absolute bottom-4 left-4 right-4 text-left">
              <span className="text-[10px] font-mono uppercase tracking-widest text-gold block">
                Official Headshot Dossier
              </span>
              <p className="text-sm font-semibold text-white">
                {primaryHeadshot?.caption || profile.stageName}
              </p>
              {primaryHeadshot?.photographerCredit && (
                <p className="text-[11px] text-zinc-400 font-mono">
                  © {primaryHeadshot.photographerCredit}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Showreel Section */}
      {showreels.length > 0 && (
        <div className="space-y-6 pt-6 border-t border-white/10">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-2xl font-display font-bold text-white flex items-center gap-2">
                <Film className="w-5 h-5 text-gold" />
                Featured Showreels & Media
              </h2>
              <p className="text-xs text-zinc-400">
                High-definition theatrical reels and cinematic production footage.
              </p>
            </div>
            <span className="text-xs font-mono text-zinc-500">
              {showreels.length} reel(s) available
            </span>
          </div>

          {activeReel && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              <div className="lg:col-span-8 aspect-video rounded-2xl overflow-hidden bg-black border border-white/15 shadow-xl">
                {parsedActiveVideo?.embedUrl.includes("youtube.com/embed") ||
                parsedActiveVideo?.embedUrl.includes("player.vimeo.com") ? (
                  <iframe
                    src={parsedActiveVideo.embedUrl}
                    title={activeReel.title}
                    className="w-full h-full border-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center relative">
                    <img
                      src={activeReel.thumbnailUrl || "https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=600&q=80"}
                      alt={activeReel.title}
                      className="absolute inset-0 w-full h-full object-cover opacity-40"
                    />
                    <div className="relative z-10 space-y-2">
                      <Play className="w-12 h-12 text-gold mx-auto" />
                      <Button
                        variant="hero"
                        size="sm"
                        onClick={() => window.open(activeReel.url, "_blank")}
                        className="text-xs"
                      >
                        Watch External Stream <ExternalLink className="w-3.5 h-3.5 ml-1" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              <div className="lg:col-span-4 space-y-3">
                <span className="text-xs font-mono text-gold uppercase tracking-wider block">
                  Now Playing
                </span>
                <h3 className="text-lg font-bold text-white">{activeReel.title}</h3>
                {activeReel.roleOrCharacter && (
                  <p className="text-xs font-semibold text-emerald-400">
                    Role: {activeReel.roleOrCharacter}
                  </p>
                )}
                <p className="text-xs text-zinc-300 leading-relaxed">
                  {activeReel.description}
                </p>
                <div className="pt-3 border-t border-white/10 space-y-2">
                  <span className="text-[11px] font-mono text-zinc-400 block uppercase">
                    Select Reel:
                  </span>
                  <div className="space-y-1.5">
                    {showreels.map((reel) => (
                      <button
                        key={reel.id}
                        type="button"
                        onClick={() => setActiveReel(reel)}
                        className={`w-full text-left p-2.5 rounded-xl border text-xs transition-all flex items-center justify-between ${
                          reel.id === activeReel.id
                            ? "bg-gold/15 border-gold text-white font-semibold"
                            : "bg-black/30 border-white/10 text-zinc-400 hover:border-white/20"
                        }`}
                      >
                        <span className="truncate max-w-[200px]">{reel.title}</span>
                        <span className="font-mono text-[10px] text-zinc-500">{reel.duration}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Discography Section (for Musicians and Dual Creators) */}
      {discography.length > 0 && (
        <div className="space-y-6 pt-6 border-t border-white/10">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-2xl font-display font-bold text-white flex items-center gap-2">
                <Disc3 className="w-5 h-5 text-gold" />
                Discography & Releases
              </h2>
              <p className="text-xs text-zinc-400">
                Official releases, streaming links, and track previews.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {discography.map((release) => (
              <div
                key={release.id}
                className="p-6 rounded-2xl bg-zinc-950/60 border border-white/10 space-y-4"
              >
                <div className="flex items-start gap-4">
                  <div className="w-20 h-20 rounded-xl bg-zinc-900 border border-white/10 overflow-hidden shrink-0 shadow-lg">
                    <img
                      src={release.artworkUrl || "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=300&q=80"}
                      alt={release.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className="text-[10px] bg-gold/10 border-gold/30 text-gold">
                        {release.releaseType}
                      </Badge>
                      <span className="text-xs font-mono text-zinc-500">{release.releaseDate}</span>
                    </div>
                    <h4 className="font-bold text-base text-white">{release.title}</h4>
                    <p className="text-xs text-zinc-400">{release.label || "Independent"}</p>
                  </div>
                </div>

                {/* Tracklist Preview */}
                <div className="space-y-1.5 pt-2 border-t border-white/10">
                  {release.tracks.map((track, idx) => (
                    <div
                      key={track.id}
                      className="flex items-center justify-between p-2 rounded-lg bg-black/40 text-xs hover:bg-white/5 transition-colors"
                    >
                      <div className="flex items-center gap-2.5 truncate max-w-[240px]">
                        <span className="text-[10px] font-mono text-zinc-500 w-4">{idx + 1}</span>
                        <span className="text-zinc-200 font-medium truncate">{track.title}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono text-zinc-500">{track.duration}</span>
                        {track.audioPreviewUrl && (
                          <button
                            type="button"
                            onClick={() => handleToggleAudio(track.id, track.audioPreviewUrl)}
                            className="w-6 h-6 rounded-full bg-gold/20 text-gold hover:bg-gold hover:text-black flex items-center justify-center transition-colors"
                            title="Play sample"
                          >
                            {playingTrackId === track.id ? (
                              <Pause className="w-3 h-3" />
                            ) : (
                              <Play className="w-3 h-3 ml-0.5" />
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Streaming Store Buttons */}
                <div className="flex flex-wrap gap-2 pt-2">
                  {release.spotifyUrl && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(release.spotifyUrl, "_blank")}
                      className="text-[11px] h-7 rounded-lg border-white/15"
                    >
                      Spotify
                    </Button>
                  )}
                  {release.bandcampUrl && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(release.bandcampUrl, "_blank")}
                      className="text-[11px] h-7 rounded-lg border-white/15"
                    >
                      Bandcamp
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Headshots Gallery */}
      {headshots.length > 0 && (
        <div className="space-y-6 pt-6 border-t border-white/10">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-2xl font-display font-bold text-white flex items-center gap-2">
                <Camera className="w-5 h-5 text-gold" />
                Headshots & Theatrical Dossier
              </h2>
              <p className="text-xs text-zinc-400">
                Print-ready (300 DPI) casting assets with certified photographer metadata.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {headshots.map((item) => (
              <div
                key={item.id}
                className="relative aspect-[4/5] rounded-xl overflow-hidden bg-black border border-white/15 group cursor-pointer"
                onClick={() => setZoomedHeadshot(item.imageUrl)}
              >
                <img
                  src={item.imageUrl}
                  alt={item.caption || "Headshot"}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-3 flex flex-col justify-end">
                  <span className="text-[10px] font-mono text-gold uppercase tracking-wider block">
                    {item.shotType}
                  </span>
                  <p className="text-xs text-white font-semibold truncate">{item.caption}</p>
                  {item.photographerCredit && (
                    <p className="text-[10px] text-zinc-400 font-mono">
                      Photo: {item.photographerCredit}
                    </p>
                  )}
                </div>
                {item.isPrimary && (
                  <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-gold text-black font-semibold text-[10px] flex items-center gap-0.5">
                    <Star className="w-2.5 h-2.5 fill-black" /> Primary
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Film Production Credits & Department History */}
      {filmCredits && filmCredits.length > 0 && (
        <div className="space-y-6 pt-6 border-t border-white/10">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-2xl font-display font-bold text-white flex items-center gap-2">
                <Film className="w-5 h-5 text-amber-400" />
                Film Credits & Production Dossier
              </h2>
              <p className="text-xs text-zinc-400">
                Features, series, commercials, and festival selections across your film career.
              </p>
            </div>
            <span className="text-xs font-mono text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
              {filmCredits.length} Credits On Record
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filmCredits.map((credit) => (
              <div
                key={credit.id}
                className="p-5 rounded-2xl bg-zinc-950/80 border border-white/10 hover:border-amber-500/40 transition-all space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-base font-bold text-white tracking-tight">
                      {credit.title}
                    </h4>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <span className="px-2 py-0.5 text-[11px] font-mono bg-white/10 text-zinc-300 rounded">
                        {credit.year}
                      </span>
                      <span className="px-2 py-0.5 text-[11px] font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30 rounded">
                        {credit.role}
                      </span>
                    </div>
                  </div>
                  {credit.isFeatured && (
                    <span className="px-2 py-0.5 text-[10px] font-mono uppercase bg-amber-500 text-zinc-950 font-bold rounded">
                      Featured
                    </span>
                  )}
                </div>

                <div className="space-y-1.5 text-xs text-zinc-400 pt-1 border-t border-white/5">
                  {credit.productionCompany && (
                    <div className="flex items-center gap-2">
                      <Building className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                      <span>Studio: {credit.productionCompany}</span>
                    </div>
                  )}
                  {credit.directorOrDP && (
                    <div className="flex items-center gap-2">
                      <User className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                      <span>{credit.directorOrDP}</span>
                    </div>
                  )}
                  {credit.festivalAwards && (
                    <div className="flex items-center gap-2 text-amber-300 font-medium">
                      <Award className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span>{credit.festivalAwards}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Equipment & Kit Inventory (Crucial for Best Boys, Grips, Sound, DPs) */}
      {equipmentKit && equipmentKit.length > 0 && (
        <div className="space-y-6 pt-6 border-t border-white/10">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-2xl font-display font-bold text-white flex items-center gap-2">
                <Wrench className="w-5 h-5 text-amber-400" />
                Equipment Packages & Box Rentals
              </h2>
              <p className="text-xs text-zinc-400">
                Production-ready gear, fixtures, and specialized kits available for production rental.
              </p>
            </div>
            <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
              Box Rental Ready
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {equipmentKit.map((item) => (
              <div
                key={item.id}
                className="p-4 rounded-xl bg-zinc-950/80 border border-white/10 hover:border-amber-500/30 transition-all flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Box className="w-4 h-4 text-amber-400 shrink-0" />
                      <h4 className="text-xs font-bold text-white">{item.name}</h4>
                    </div>
                    <span className="px-1.5 py-0.5 text-[10px] uppercase font-mono bg-white/10 text-zinc-400 rounded">
                      {item.category}
                    </span>
                  </div>

                  {item.description && (
                    <p className="mt-2 text-xs text-zinc-400 leading-relaxed">
                      {item.description}
                    </p>
                  )}
                </div>

                <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[11px]">
                  <span className="flex items-center gap-1 text-emerald-400">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {item.isAvailableForRent ? "Available for Rental" : "Personal Rig"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Representation Card Footer */}
      {(profile.agentName || profile.agencyName || profile.bookingEmail) && (
        <div className="p-6 rounded-2xl bg-zinc-950/80 border border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-xs font-mono uppercase tracking-widest text-gold flex items-center gap-1.5">
              <Building className="w-3.5 h-3.5" /> Direct Representation & Agency
            </span>
            <h4 className="text-base font-bold text-white">
              {profile.agentName ? `${profile.agentName} — ` : ""}{profile.agencyName || "Representation"}
            </h4>
            <p className="text-xs text-zinc-400">
              For script inquiries, festival invitations, sync licensing, and theatrical booking.
            </p>
          </div>

          {profile.bookingEmail && (
            <Button
              variant="hero"
              size="sm"
              onClick={() => window.open(`mailto:${profile.bookingEmail}`, "_blank")}
              className="rounded-xl shrink-0"
            >
              <Mail className="w-4 h-4 mr-1.5" /> Contact Agent ({profile.bookingEmail})
            </Button>
          )}
        </div>
      )}

      {/* Lightbox for headshot preview */}
      {zoomedHeadshot && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4"
          onClick={() => setZoomedHeadshot(null)}
        >
          <div className="max-w-2xl max-h-[85vh] relative">
            <img
              src={zoomedHeadshot}
              alt="High resolution headshot preview"
              className="w-full h-full object-contain rounded-xl border border-white/20"
            />
            <button
              onClick={() => setZoomedHeadshot(null)}
              className="absolute top-4 right-4 px-3 py-1.5 rounded-full bg-black/70 text-white text-xs hover:bg-black"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
